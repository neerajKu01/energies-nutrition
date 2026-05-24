const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const crypto   = require('crypto');
const Order    = require('./models/Order');

dotenv.config();

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));

// ── Razorpay Webhook — MUST use raw body, registered BEFORE express.json() ────
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const expected  = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
        .update(req.body)
        .digest('hex');

      if (signature !== expected) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }

      const event   = JSON.parse(req.body.toString());
      const payment = event.payload?.payment?.entity;

      if (event.event === 'payment.captured' && payment?.notes?.suppxOrderId) {
        await Order.findByIdAndUpdate(payment.notes.suppxOrderId, {
          paymentStatus: 'paid', razorpayPaymentId: payment.id,
          orderStatus: 'processing', paidAt: new Date(),
        });
        console.log('✅ Webhook: payment captured for order', payment.notes.suppxOrderId);
      }

      if (event.event === 'payment.failed' && payment?.notes?.suppxOrderId) {
        await Order.findByIdAndUpdate(payment.notes.suppxOrderId, { paymentStatus: 'failed' });
        console.log('❌ Webhook: payment failed for order', payment.notes.suppxOrderId);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ── JSON body parser (after webhook route) ─────────────────────────────────────
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/cart',       require('./routes/cartRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/payment',    require('./routes/paymentRoutes'));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'SuppX API is running 🚀' }));

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ── Connect DB & start ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
