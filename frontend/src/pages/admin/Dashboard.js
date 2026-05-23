import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './Admin.css';

const STATUS_COLORS = {
  placed: '#f5a623', processing: '#4cc9f0',
  shipped: '#7209b7', delivered: '#80ed99', cancelled: '#e63946',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products?limit=1000'),
        ]);
        const orders   = ordersRes.data;                   // array
        const prodData = productsRes.data;                 // { products, total, ... }
        const totalProducts = prodData.total || prodData.products?.length || 0;

        const totalRevenue = orders
          .filter((o) => o.orderStatus !== 'cancelled')
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts,
          pendingOrders: orders.filter((o) => o.orderStatus === 'placed').length,
        });
        setRecentOrders(orders.slice(0, 8));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin <span>Dashboard</span></h1>
        <div className="admin-nav-links">
          <Link to="/admin/products"   className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '12px' }}>Manage Products</Link>
          <Link to="/admin/orders"     className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '12px' }}>Manage Orders</Link>
          <Link to="/admin/categories" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '12px' }}>Categories</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-icon">💰</span>
              <div>
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">₹{stats?.totalRevenue?.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📦</span>
              <div>
                <p className="stat-label">Total Orders</p>
                <p className="stat-value">{stats?.totalOrders}</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏷️</span>
              <div>
                <p className="stat-label">Total Products</p>
                <p className="stat-value">{stats?.totalProducts}</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderColor: stats?.pendingOrders > 0 ? 'var(--gold)' : 'var(--border)' }}>
              <span className="stat-icon">⏳</span>
              <div>
                <p className="stat-label">Pending Orders</p>
                <p className="stat-value" style={{ color: stats?.pendingOrders > 0 ? 'var(--gold)' : 'inherit' }}>
                  {stats?.pendingOrders}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Recent Orders</h2>
          <Link to="/admin/orders" className="section-link">View All →</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 24 }} /></td></tr>
                  ))
                : recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id-cell">#{order._id.toString().slice(-8).toUpperCase()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.user?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{order.user?.email || ''}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                      <td style={{ fontWeight: 700 }}>₹{order.totalPrice?.toLocaleString()}</td>
                      <td>
                        <span className="status-pill"
                          style={{ background: (STATUS_COLORS[order.orderStatus] || '#888') + '22', color: STATUS_COLORS[order.orderStatus] || '#888' }}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <Link to={`/order/${order._id}`} className="table-action">Details →</Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
