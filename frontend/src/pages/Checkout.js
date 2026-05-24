import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const IS_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Dynamically loads the Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PAYMENT_METHODS = [
  { id: 'COD',         label: 'Cash on Delivery',    icon: '🚚', desc: 'Pay when your order arrives' },
  { id: 'Razorpay',    label: 'Pay Online',           icon: '💳', desc: 'UPI · Cards · Net Banking · Wallets', highlight: true },
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || '',
    pincode: user?.address?.pincode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [step,   setStep]   = useState(1);   // 1 = address, 2 = payment, 3 = review
  const [loading, setLoading] = useState(false);

  const shipping = cartTotal >= 999 ? 0 : 99;
  const total    = cartTotal + shipping;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ─── Step 1: Validate address ─────────────────────────────────────────────
  const handleNextStep = (e) => {
    e.preventDefault();
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    const missing  = required.find((f) => !form[f]?.trim());
    if (missing) { toast.error(`Please fill in ${missing}`); return; }
    if (form.pincode.length !== 6) { toast.error('Pincode must be 6 digits'); return; }
    if (form.phone.length < 10)    { toast.error('Phone number must be at least 10 digits'); return; }
    setStep(2);
  };

  // ─── Step 3: Place order ──────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!cart.items?.length) { toast.error('Cart is empty'); return; }
    setLoading(true);

    try {
      const items = cart.items.map((i) => ({
        product:  i.product._id,
        name:     i.product.name,
        image:    i.product.images?.[0] || '',
        price:    i.product.price,
        quantity: i.quantity,
        flavor:   i.flavor  || '',
        weight:   i.weight  || '',
      }));

      // 1. Create our order in MongoDB first
      const { data: order } = await api.post('/orders', {
        items,
        shippingAddress: form,
        paymentMethod,
        itemsPrice:   cartTotal,
        shippingPrice: shipping,
        totalPrice:   total,
      });

      // 2. Branch on payment method
      if (paymentMethod === 'COD') {
        await clearCart();
        toast.success('Order placed! Pay on delivery 🚚');
        navigate(`/order/${order._id}`);
        return;
      }

      // ─── Razorpay online payment flow ─────────────────────────────────────
      if (IS_MOCK) {
        // Demo mode: simulate Razorpay popup with a fake success
        await simulateMockPayment(order._id, order.totalPrice);
        return;
      }

      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        setLoading(false);
        return;
      }

      // Create a Razorpay order on our backend
      const { data: rzpData } = await api.post('/payment/create-order', { orderId: order._id });

      // Open Razorpay checkout popup
      const rzpOptions = {
        key:          rzpData.keyId,
        amount:       rzpData.amount,
        currency:     rzpData.currency,
        name:         'SuppX',
        description:  `Order #${order._id.toString().slice(-8).toUpperCase()}`,
        order_id:     rzpData.razorpayOrderId,
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: form.phone,
        },
        theme:        { color: '#f5a623' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your order is saved — you can pay later.', { icon: 'ℹ️' });
            setLoading(false);
            navigate(`/order/${order._id}`);
          },
        },
        handler: async (response) => {
          try {
            // Verify signature on backend
            const { data: verifyData } = await api.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             order._id,
            });

            if (verifyData.success) {
              await clearCart();
              toast.success('Payment successful! 🎉');
              navigate(`/order/${order._id}`);
            } else {
              toast.error('Payment verification failed. Contact support.');
              navigate(`/order/${order._id}`);
            }
          } catch (err) {
            toast.error('Payment verification error. Contact support.');
            navigate(`/order/${order._id}`);
          }
        },
      };

      const rzp = new window.Razorpay(rzpOptions);

      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  // ─── Mock payment simulator (demo mode only) ──────────────────────────────
  const simulateMockPayment = async (orderId, amount) => {
    // Show a fake Razorpay-style modal
    const confirmed = window.confirm(
      `[DEMO] Razorpay Checkout\n\nAmount: ₹${amount.toLocaleString()}\nOrder: #${orderId.toString().slice(-8).toUpperCase()}\n\nClick OK to simulate a successful payment.\nClick Cancel to simulate payment failure.`
    );

    if (confirmed) {
      // Simulate /payment/verify with mock IDs
      await api.post('/payment/verify', {
        razorpay_order_id:   'order_mock_' + Date.now(),
        razorpay_payment_id: 'pay_mock_'   + Date.now(),
        razorpay_signature:  'sig_mock_'   + Date.now(),
        orderId,
      });
      await clearCart();
      toast.success('Payment successful! 🎉');
      navigate(`/order/${orderId}`);
    } else {
      toast.error('Payment cancelled in demo mode.');
      navigate(`/order/${orderId}`);
    }
    setLoading(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (!cart.items?.length) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ fontSize: 48 }}>🛒</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: '16px 0' }}>Your cart is empty</h2>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">CHECKOUT</h1>

        {/* Progress steps */}
        <div className="checkout-steps">
          {['Shipping', 'Payment', 'Review'].map((s, i) => (
            <div key={s} className={`ch-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="ch-step-dot">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < 2 && <div className={`ch-step-line ${step > i + 1 ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* ── Step 1: Shipping ─────────────────────────────────── */}
            {step === 1 && (
              <form className="checkout-section" onSubmit={handleNextStep}>
                <h3 className="cs-title">📦 Shipping Address</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="name" value={form.name} onChange={handle} required placeholder="Rahul Sharma" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handle} required placeholder="9876543210" maxLength={10} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Street / House Address</label>
                  <input name="street" value={form.street} onChange={handle} required placeholder="Flat 4B, Sunshine Apartments, MG Road" />
                </div>
                <div className="form-row form-row-3">
                  <div className="form-group">
                    <label>City</label>
                    <input name="city" value={form.city} onChange={handle} required placeholder="Delhi" />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input name="state" value={form.state} onChange={handle} required placeholder="Delhi" />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input name="pincode" value={form.pincode} onChange={handle} required placeholder="110001" maxLength={6} />
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}>
                  Continue to Payment →
                </button>
              </form>
            )}

            {/* ── Step 2: Payment ──────────────────────────────────── */}
            {step === 2 && (
              <div className="checkout-section">
                <h3 className="cs-title">💳 Payment Method</h3>
                <div className="payment-options">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`pay-option ${paymentMethod === m.id ? 'active' : ''} ${m.highlight ? 'highlight' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                      />
                      <div className="pay-option-icon">{m.icon}</div>
                      <div className="pay-option-text">
                        <strong>{m.label}</strong>
                        <span>{m.desc}</span>
                      </div>
                      {m.highlight && <span className="pay-recommended">RECOMMENDED</span>}
                    </label>
                  ))}
                </div>

                {paymentMethod === 'Razorpay' && (
                  <div className="razorpay-note">
                    <img
                      src="https://razorpay.com/assets/razorpay-glyph.svg"
                      alt="Razorpay"
                      style={{ width: 22, height: 22 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <p>Secured by <strong>Razorpay</strong> · 256-bit SSL encryption · PCI DSS compliant</p>
                  </div>
                )}

                <div className="step-actions">
                  <button className="btn btn-dark" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* ── Step 3: Review & Confirm ─────────────────────────── */}
            {step === 3 && (
              <div className="checkout-section">
                <h3 className="cs-title">✅ Review Your Order</h3>

                <div className="review-block">
                  <div className="review-block-header">
                    <span>📦 Shipping To</span>
                    <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <p className="review-address">
                    <strong>{form.name}</strong> · {form.phone}<br />
                    {form.street}, {form.city}, {form.state} — {form.pincode}
                  </p>
                </div>

                <div className="review-block">
                  <div className="review-block-header">
                    <span>💳 Payment</span>
                    <button className="edit-btn" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <p className="review-address">
                    {paymentMethod === 'Razorpay' ? '💳 Online Payment (Razorpay)' : '🚚 Cash on Delivery'}
                  </p>
                </div>

                <div className="step-actions">
                  <button className="btn btn-dark" onClick={() => setStep(2)}>← Back</button>
                  <button
                    className="btn btn-primary confirm-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading
                      ? 'Processing...'
                      : paymentMethod === 'COD'
                        ? `✓ Place Order — ₹${total.toLocaleString()}`
                        : `🔒 Pay ₹${total.toLocaleString()}`
                    }
                  </button>
                </div>

                {paymentMethod === 'Razorpay' && (
                  <p className="secure-note">🔒 You'll be redirected to Razorpay's secure payment page</p>
                )}
              </div>
            )}
          </div>

          {/* ── Order Summary sidebar ─────────────────────────────── */}
          <div className="checkout-summary">
            <h3 className="cs-title">ORDER SUMMARY</h3>
            <div className="co-items">
              {cart.items?.map((item) => (
                <div key={item._id} className="co-item">
                  <img
                    src={item.product?.images?.[0] || 'https://placehold.co/60x60/1a1a1a/f5a623?text=S'}
                    alt=""
                    className="co-thumb"
                  />
                  <div className="co-item-info">
                    <p>{item.product?.name}</p>
                    {item.flavor && <span>{item.flavor}</span>}
                    {item.weight && <span> · {item.weight}</span>}
                    <br /><span>Qty: {item.quantity}</span>
                  </div>
                  <strong>₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
            </div>

            <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? <span style={{ color: 'var(--gold)' }}>FREE</span>
                  : `₹${shipping}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="free-ship-msg">Add ₹{(999 - cartTotal).toLocaleString()} more for FREE shipping</p>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <div className="trust-badges">
              <span>✅ 100% Authentic</span>
              <span>🔒 Secure Checkout</span>
              <span>↩️ Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
