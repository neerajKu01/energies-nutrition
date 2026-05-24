import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product._id, quantity, selectedFlavor, selectedWeight);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReviewText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><div className="skeleton" style={{ height: 500 }} /></div>;
  if (!product) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><p>Product not found.</p><Link to="/products" className="btn btn-primary" style={{ marginTop: 24 }}>Back to Products</Link></div>;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product.images?.length ? product.images : ['https://placehold.co/600x600/1a1a1a/f5a623?text=SuppX'];

  return (
    <div className="pd-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Products</Link> / {product.name}
        </div>

        <div className="pd-layout">
          {/* Images */}
          <div className="pd-images">
            <div className="pd-main-image">
              {discount > 0 && <span className="badge badge-red pd-badge">{discount}% OFF</span>}
              <img src={images[selectedImage]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className={`pd-thumb ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <p className="pd-brand">{product.brand || 'SuppX'}</p>
            <h1 className="pd-name">{product.name}</h1>

            {product.rating > 0 && (
              <div className="pd-rating">
                <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
                <span>{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}

            <div className="pd-price-row">
              <span className="pd-price">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && <span className="pd-original">₹{product.originalPrice.toLocaleString()}</span>}
              {discount > 0 && <span className="badge badge-red">{discount}% OFF</span>}
            </div>

            <p className="pd-description">{product.description}</p>

            {product.flavors?.length > 0 && (
              <div className="pd-variants">
                <h4>Flavor</h4>
                <div className="variant-btns">
                  {product.flavors.map((f) => (
                    <button
                      key={f}
                      className={`variant-btn ${selectedFlavor === f ? 'active' : ''}`}
                      onClick={() => setSelectedFlavor(f)}
                    >{f}</button>
                  ))}
                </div>
              </div>
            )}

            {product.weights?.length > 0 && (
              <div className="pd-variants">
                <h4>Size / Weight</h4>
                <div className="variant-btns">
                  {product.weights.map((w) => (
                    <button
                      key={w}
                      className={`variant-btn ${selectedWeight === w ? 'active' : ''}`}
                      onClick={() => setSelectedWeight(w)}
                    >{w}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-qty-row">
              <div className="qty-control">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="stock-info">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            </div>

            <div className="pd-actions">
              <button
                className="btn btn-primary pd-atc"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'OUT OF STOCK' : '🛒 ADD TO CART'}
              </button>
              <Link to="/cart" className="btn btn-outline" onClick={handleAddToCart}>BUY NOW</Link>
            </div>

            <div className="pd-perks">
              <span>✅ 100% Authentic</span>
              <span>🚚 Free delivery on ₹999+</span>
              <span>↩️ Easy returns</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2 className="section-title">CUSTOMER <span>REVIEWS</span></h2>

          {product.reviews?.length === 0 && <p style={{ color: 'var(--muted)' }}>No reviews yet. Be the first!</p>}

          <div className="reviews-list">
            {product.reviews?.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-top">
                  <span className="review-name">{r.name}</span>
                  <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p>{r.comment}</p>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>

          {user && (
            <form className="review-form" onSubmit={handleReview}>
              <h4>Write a Review</h4>
              <div className="star-select">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)}
                    style={{ color: s <= reviewRating ? 'var(--gold)' : 'var(--muted)', fontSize: 24, background: 'none', border: 'none' }}>★</button>
                ))}
              </div>
              <div className="form-group">
                <textarea rows={4} placeholder="Share your experience..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
