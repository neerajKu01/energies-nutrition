import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';
import './AdminExtra.css';

const STATUS_COLORS = { placed: '#f5a623', processing: '#4cc9f0', shipped: '#7209b7', delivered: '#80ed99', cancelled: '#e63946' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleRefund = async (orderId) => {
    if (!window.confirm('Initiate full refund for this order?')) return;
    try {
      await api.post('/payment/refund', { orderId });
      toast.success('Refund initiated successfully');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    }
  };

  const updateStatus = async (orderId, status, trackingNumber) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status, trackingNumber });
      toast.success(`Status updated to "${status}"`);
      fetchOrders();
    } catch { toast.error('Update failed'); }
    setUpdatingId(null);
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.orderStatus === filter;
    const matchSearch = !search || o._id.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Manage <span>Orders</span></h1>
      </div>

      {/* Filter tabs */}
      <div className="order-filter-tabs">
        {['all', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            className={`filter-tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="tab-count">
              {s === 'all' ? orders.length : orders.filter((o) => o.orderStatus === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search by order ID or customer name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{filtered.length} orders</span>
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
              <th>Payment</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(6).fill(0).map((_, i) => <tr key={i}><td colSpan={8}><div className="skeleton" style={{ height: 28 }} /></td></tr>)
              : filtered.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <Link to={`/order/${order._id}`} className="order-id-cell" style={{ color: 'var(--gold)' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{order.user?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>{order.items?.length} items</td>
                    <td style={{ fontWeight: 700 }}>₹{order.totalPrice?.toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: 12 }}>{order.paymentMethod}</span>
                      <br />
                      <span style={{ fontSize: 11, color: order.paymentStatus === 'paid' ? '#80ed99' : 'var(--muted)' }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: STATUS_COLORS[order.orderStatus] + '22', color: STATUS_COLORS[order.orderStatus] }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                        <select
                          className="status-select"
                          value={order.orderStatus}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                        >
                          <option value="placed">Placed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
