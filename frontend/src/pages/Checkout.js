import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: '', city: '', state: '', pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const shipping = cartTotal >= 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!cart.items?.length) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const items = cart.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images?.[0],
        price: i.product.price,
        quantity: i.quantity,
        flavor: i.flavor,
        weight: i.weight,
      }));

      const { data } = await api.post('/orders', {
        items,
        shippingAddress: form,
        paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: shipping,
        totalPrice: total,
      });

      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">CHECKOUT</h1>

        <form className="checkout-layout" onSubmit={handleOrder}>
          {/* Shipping */}
          <div className="checkout-main">
            <div className="checkout-section">
              <h3 className="cs-title">📦 Shipping Address</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handle} required />
                </div>
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input name="street" value={form.street} onChange={handle} required placeholder="House no, Colony, Street" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input name="state" value={form.state} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handle} required maxLength={6} />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h3 className="cs-title">💳 Payment Method</h3>
              <div className="payment-options">
                {['COD', 'UPI', 'Card', 'Net Banking'].map((m) => (
                  <label key={m} className={`pay-option ${paymentMethod === m ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                    {m === 'COD' ? '🚚 Cash on Delivery' : m === 'UPI' ? '📱 UPI' : m === 'Card' ? '💳 Credit/Debit Card' : '🏦 Net Banking'}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="checkout-summary">
            <h3 className="cs-title">ORDER SUMMARY</h3>
            <div className="co-items">
              {cart.items?.map((item) => (
                <div key={item._id} className="co-item">
                  <img src={item.product?.images?.[0] || 'https://placehold.co/60x60/1a1a1a/f5a623?text=S'} alt="" className="co-thumb" />
                  <div className="co-item-info">
                    <p>{item.product?.name}</p>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <strong>₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
            </div>
            <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--gold)' }}>FREE</span> : `₹${shipping}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            <button className="btn btn-primary summary-btn" type="submit" disabled={loading}>
              {loading ? 'PLACING ORDER...' : `PLACE ORDER — ₹${total.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
