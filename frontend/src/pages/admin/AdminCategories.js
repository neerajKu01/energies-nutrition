import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', form);
        toast.success('Category created!');
      }
      setForm({ name: '', description: '', image: '' });
      setEditId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '' });
    setEditId(cat._id);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Deleted');
      fetchCategories();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Manage <span>Categories</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Form */}
        <div className="admin-form-panel">
          <h3 className="admin-form-title">{editId ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category Name *</label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Pre-Workout" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Brief description…" />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input name="image" value={form.image} onChange={handle} placeholder="https://…" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'SAVING…' : editId ? 'UPDATE' : 'CREATE'}
              </button>
              {editId && (
                <button className="btn btn-dark" type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', image: '' }); }}>
                  CANCEL
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={4}><div className="skeleton" style={{ height: 24 }} /></td></tr>)
                : categories.map((cat) => (
                    <tr key={cat._id}>
                      <td style={{ fontWeight: 700 }}>{cat.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{cat.slug}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{cat.description || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-edit" onClick={() => handleEdit(cat)}>Edit</button>
                          <button className="btn-danger" onClick={() => handleDelete(cat._id, cat.name)}>Delete</button>
                        </div>
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
