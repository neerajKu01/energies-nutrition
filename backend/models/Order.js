const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  image:    String,
  price:    Number,
  quantity: { type: Number, required: true },
  flavor:   String,
  weight:   String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],

    shippingAddress: {
      name:    { type: String, required: true },
      phone:   { type: String, required: true },
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },

    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    // ── Razorpay fields ────────────────────────────────────────────────────
    razorpayOrderId:   { type: String },   // rzp order id created on backend
    razorpayPaymentId: { type: String },   // rzp payment id after capture
    razorpaySignature: { type: String },   // verification signature
    paidAt:            { type: Date },     // timestamp of successful payment

    orderStatus: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },

    itemsPrice:    { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    totalPrice:    { type: Number, required: true },

    trackingNumber: { type: String },
    notes:          { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
