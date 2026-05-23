import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Admin.css';

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  brand: '', stock: '', category: '',
  flavors: '', weights: '', tags: '',
  images: '', isFeatured: false, isBestSeller: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/products?limit=200'), api.get('/categories')]);
      setProducts(p.data.products);
      setCategories(c.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handle = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: p.price,
      originalPrice: p.originalPrice || '', brand: p.brand || '',
      stock: p.stock, category: p.category?._id || '',
      flavors: p.flavors?.join(', ') || '',
      weights: p.weights?.join(', ') || '',
      tags: p.tags?.join(', ') || '',
      images: p.images?.join(', ') || '',
      isFeatured: p.isFeatured, isBestSeller: p.isBestSeller,
    });
    setEditId(p._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        flavors: form.flavors ? form.flavors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        weights: form.weights ? form.weights.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      if (editId) {
        await api.put(`/products/${editId}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Manage <span>Products</span></h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-form-panel">
          <h3 className="admin-form-title">{editId ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <div className="form-group">
                <label>Product Name *</label>
                <input name="name" value={form.name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input name="brand" value={form.brand} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3} required />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>Sale Price (₹) *</label>
                <input type="number" name="price" value={form.price} onChange={handle} required min={0} />
              </div>
              <div className="form-group">
                <label>Original Price (₹)</label>
                <input type="number" name="originalPrice" value={form.originalPrice} onChange={handle} min={0} />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input type="number" name="stock" value={form.stock} onChange={handle} required min={0} />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handle} required>
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Image URLs (comma-separated)</label>
                <input name="images" value={form.images} onChange={handle} placeholder="https://…, https://…" />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Flavors (comma-separated)</label>
                <input name="flavors" value={form.flavors} onChange={handle} placeholder="Chocolate, Vanilla, Strawberry" />
              </div>
              <div className="form-group">
                <label>Weights / Sizes (comma-separated)</label>
                <input name="weights" value={form.weights} onChange={handle} placeholder="500g, 1kg, 2kg" />
              </div>
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handle} placeholder="protein, muscle, whey" />
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handle} style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
                Featured Product
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handle} style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
                Best Seller
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'SAVING…' : editId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}</button>
              <button className="btn btn-dark" type="button" onClick={() => setShowForm(false)}>CANCEL</button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Table */}
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{filtered.length} products</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(6).fill(0).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 24 }} /></td></tr>)
              : filtered.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{p.category?.name || '—'}</td>
                    <td>₹{p.price?.toLocaleString()}</td>
                    <td style={{ color: p.stock === 0 ? '#e63946' : p.stock < 10 ? '#f5a623' : 'inherit' }}>{p.stock}</td>
                    <td>{p.rating > 0 ? `⭐ ${p.rating.toFixed(1)}` : '—'}</td>
                    <td>
                      {p.isFeatured && <span className="badge badge-gold" style={{ marginRight: 4 }}>F</span>}
                      {p.isBestSeller && <span className="badge badge-red">BS</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn-danger" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
