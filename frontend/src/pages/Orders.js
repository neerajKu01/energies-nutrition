import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Orders.css';

const STATUS_COLORS = { placed: '#f5a623', processing: '#4cc9f0', shipped: '#7209b7', delivered: '#80ed99', cancelled: '#e63946' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => { setOrders(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><div className="skeleton" style={{ height: 300 }} /></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">MY <span>ORDERS</span></h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <p style={{ fontSize: 20, marginBottom: 24 }}>No orders yet!</p>
            <Link to="/products" className="btn btn-primary">SHOP NOW</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className="order-status" style={{ background: STATUS_COLORS[order.orderStatus] + '22', color: STATUS_COLORS[order.orderStatus], border: `1px solid ${STATUS_COLORS[order.orderStatus]}` }}>
                    {order.orderStatus.toUpperCase()}
                  </span>
                </div>
                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="oip-item">
                      <img src={item.image || 'https://placehold.co/60x60/1a1a1a/f5a623?text=S'} alt={item.name} />
                      <div>
                        <p>{item.name}</p>
                        <span>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && <p className="more-items">+{order.items.length - 3} more items</p>}
                </div>
                <div className="order-footer">
                  <span className="order-total">Total: <strong>₹{order.totalPrice?.toLocaleString()}</strong></span>
                  <Link to={`/order/${order._id}`} className="btn btn-dark" style={{ padding: '8px 20px', fontSize: '12px' }}>VIEW DETAILS</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
