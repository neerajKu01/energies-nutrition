import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './OrderDetail.css';

const STATUS_STEPS = ['placed', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS = { placed: '#f5a623', processing: '#4cc9f0', shipped: '#7209b7', delivered: '#80ed99', cancelled: '#e63946' };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><div className="skeleton" style={{ height: 400 }} /></div>;
  if (!order) return <div className="container" style={{ padding: '60px', textAlign: 'center' }}><p>Order not found.</p><Link to="/orders" className="btn btn-primary" style={{ marginTop: 24 }}>My Orders</Link></div>;

  const stepIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="od-page">
      <div className="container">
        <div className="od-header">
          <div>
            <Link to="/orders" className="back-link">← Back to Orders</Link>
            <h1 className="od-title">Order <span>#{order._id.slice(-8).toUpperCase()}</span></h1>
            <p className="od-date">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className="order-status-badge" style={{ background: STATUS_COLORS[order.orderStatus] + '22', color: STATUS_COLORS[order.orderStatus], border: `1px solid ${STATUS_COLORS[order.orderStatus]}` }}>
            {order.orderStatus.toUpperCase()}
          </span>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="od-tracker">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`tracker-step ${i <= stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`}>
                <div className="tracker-dot">
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                {i < STATUS_STEPS.length - 1 && <div className={`tracker-line ${i < stepIndex ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="od-layout">
          {/* Left: items + shipping */}
          <div>
            <div className="od-section">
              <h3 className="od-section-title">ORDER ITEMS</h3>
              {order.items.map((item, i) => (
                <div key={i} className="od-item">
                  <img src={item.image || 'https://placehold.co/80x80/1a1a1a/f5a623?text=S'} alt={item.name} className="od-item-img" />
                  <div className="od-item-info">
                    <p className="od-item-name">{item.name}</p>
                    {item.flavor && <span className="od-item-meta">Flavor: {item.flavor}</span>}
                    {item.weight && <span className="od-item-meta">Size: {item.weight}</span>}
                    <span className="od-item-meta">Qty: {item.quantity}</span>
                  </div>
                  <div className="od-item-price">
                    <p>₹{item.price?.toLocaleString()} × {item.quantity}</p>
                    <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="od-section">
              <h3 className="od-section-title">SHIPPING ADDRESS</h3>
              <div className="od-address">
                <p><strong>{order.shippingAddress.name}</strong></p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                <p>📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="od-section">
                <h3 className="od-section-title">TRACKING</h3>
                <p className="od-tracking">🚚 Tracking ID: <strong>{order.trackingNumber}</strong></p>
              </div>
            )}
          </div>

          {/* Right: price summary */}
          <div className="od-summary">
            <h3 className="od-section-title">PRICE DETAILS</h3>
            <div className="summary-row"><span>Items Total</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? <span style={{ color: 'var(--gold)' }}>FREE</span> : `₹${order.shippingPrice}`}</span></div>
            <div className="summary-row total"><span>Total Paid</span><span>₹{order.totalPrice?.toLocaleString()}</span></div>
            <div className="od-payment-info">
              <p>💳 Payment Method: <strong>{order.paymentMethod}</strong></p>
              <p>
                Payment Status:{' '}
                <span style={{
                  color: order.paymentStatus === 'paid' ? '#80ed99'
                       : order.paymentStatus === 'failed' ? '#e63946'
                       : order.paymentStatus === 'refunded' ? '#4cc9f0'
                       : 'var(--muted)'
                }}>
                  {order.paymentStatus === 'paid'     ? '✅ PAID'
                   : order.paymentStatus === 'failed'  ? '❌ FAILED'
                   : order.paymentStatus === 'refunded'? '↩️ REFUNDED'
                   : '⏳ PENDING'}
                </span>
              </p>
              {order.razorpayPaymentId && (
                <p style={{ fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all' }}>
                  Razorpay ID: <code style={{ color: 'var(--gold)', fontSize: 11 }}>{order.razorpayPaymentId}</code>
                </p>
              )}
              {order.paidAt && (
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Paid at: {new Date(order.paidAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
