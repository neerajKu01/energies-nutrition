import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    password: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      };
      if (form.password) payload.password = form.password;

      const { data } = await api.put('/auth/profile', payload);
      localStorage.setItem('suppx_user', JSON.stringify({ ...data, token: data.token }));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title">MY <span>PROFILE</span></h1>

        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
            {user?.isAdmin && <span className="badge badge-gold" style={{ marginTop: 8 }}>ADMIN</span>}
          </div>

          {/* Form */}
          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-section">
              <h3 className="ps-title">Personal Information</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div className="profile-section">
              <h3 className="ps-title">Saved Address</h3>
              <div className="form-group">
                <label>Street Address</label>
                <input name="street" value={form.street} onChange={handle} placeholder="House no, Colony, Street" />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handle} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input name="state" value={form.state} onChange={handle} />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handle} maxLength={6} />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3 className="ps-title">Change Password <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>(leave blank to keep current)</span></h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" name="password" value={form.password} onChange={handle} placeholder="Min 6 characters" />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handle} placeholder="••••••••" />
                </div>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 8 }}>
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
