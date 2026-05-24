const express   = require('express');
const router    = express.Router();
const Razorpay  = require('razorpay');
const crypto    = require('crypto');
const Order     = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/key  →  return public key to frontend
// ─────────────────────────────────────────────────────────────────────────────
router.get('/key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-order
// Step 1: frontend calls this after our order is saved in MongoDB.
// We create a Razorpay order and return rzp order id + amount + key.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    const dbOrder = await Order.findById(orderId);
    if (!dbOrder)
      return res.status(404).json({ message: 'Order not found' });

    if (dbOrder.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(dbOrder.totalPrice * 100), // paise
      currency: 'INR',
      receipt:  `suppx_${orderId}`,
      notes: {
        suppxOrderId:  orderId.toString(),
        customerName:  req.user.name,
        customerEmail: req.user.email,
      },
    });

    // Persist the razorpay order id so we can verify later
    dbOrder.razorpayOrderId = rzpOrder.id;
    await dbOrder.save();

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('create-order error:', err);
    res.status(500).json({ message: err.error?.description || err.message || 'Payment initiation failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/verify
// Step 2: frontend sends payment ids after Razorpay popup closes.
// We verify the HMAC signature — if valid, mark order as paid.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Recreate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer      = Buffer.from(razorpay_signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    const isValid =
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    if (!isValid)
      return res.status(400).json({ success: false, message: 'Payment verification failed — signature mismatch' });

    // Mark order as paid in our DB
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus      = 'paid';
    order.razorpayPaymentId  = razorpay_payment_id;
    order.razorpaySignature  = razorpay_signature;
    order.orderStatus        = 'processing';
    order.paidAt             = new Date();
    await order.save();

    res.json({ success: true, message: 'Payment verified', order });
  } catch (err) {
    console.error('verify error:', err);
    res.status(500).json({ success: false, message: err.message || 'Verification failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/refund  (admin)
// Initiates a full refund for a paid order via Razorpay.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/refund', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: 'Order not found' });

    if (!order.razorpayPaymentId)
      return res.status(400).json({ message: 'No payment found for this order' });

    if (order.paymentStatus !== 'paid')
      return res.status(400).json({ message: 'Order is not in paid state' });

    // Only admin or order owner can refund
    if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    // Initiate full refund via Razorpay
    await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(order.totalPrice * 100), // full refund in paise
      notes: { reason: 'Customer requested refund', orderId: orderId.toString() },
    });

    order.paymentStatus = 'refunded';
    order.orderStatus   = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Refund initiated successfully', order });
  } catch (err) {
    console.error('refund error:', err);
    res.status(500).json({ message: err.error?.description || err.message || 'Refund failed' });
  }
});

module.exports = router;
