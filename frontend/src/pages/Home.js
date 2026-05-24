import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const CATEGORIES = [
  { name: 'Protein', icon: '💪', slug: 'proteins', color: '#e63946' },
  { name: 'Pre-Workout', icon: '⚡', slug: 'pre-workout', color: '#f5a623' },
  { name: 'Creatine', icon: '🔥', slug: 'creatine', color: '#4cc9f0' },
  { name: 'Vitamins', icon: '🌿', slug: 'vitamins-and-supplements', color: '#80ed99' },
  { name: 'Omega', icon: '🐟', slug: 'omega', color: '#7209b7' },
  { name: 'Aminos', icon: '🧬', slug: 'aminos', color: '#f72585' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, b] = await Promise.all([
          api.get('/products?featured=true&limit=4'),
          api.get('/products?bestseller=true&limit=8'),
        ]);
        setFeatured(f.data.products);
        setBestsellers(b.data.products);
      } catch { /* show empty */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid-lines" />
        </div>
        <div className="container hero-content">
          <div className="hero-tag">🏋️ India's Premium Supplement Store</div>
          <h1 className="hero-title">
            UNLOCK YOUR<br />
            <span className="hero-accent">PEAK POTENTIAL</span>
          </h1>
          <p className="hero-sub">
            Science-backed formulas for Maximum Power,<br />
            Razor Focus & Rapid Recovery.
          </p>
          <div className="hero-cta">
            <Link to="/products" className="btn btn-primary">SHOP NOW</Link>
            <Link to="/products?bestseller=true" className="btn btn-outline">BEST SELLERS</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">100%</span><span>Authentic</span></div>
            <div className="stat"><span className="stat-num">10K+</span><span>Happy Customers</span></div>
            <div className="stat"><span className="stat-num">48hr</span><span>Fast Delivery</span></div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee">
        <div className="marquee-track">
          {['FREE DELIVERY ON ₹999+', '100% AUTHENTIC PRODUCTS', 'SCIENTIFICALLY FORMULATED', 'DIRECT FROM WAREHOUSE', 'FREE DELIVERY ON ₹999+', '100% AUTHENTIC PRODUCTS', 'SCIENTIFICALLY FORMULATED', 'DIRECT FROM WAREHOUSE'].map((t, i) => (
            <span key={i}>{t} &nbsp;•&nbsp; </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">SHOP BY <span>CATEGORY</span></h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link to={`/products?category=${cat.slug}`} key={cat.slug} className="cat-card" style={{ '--cat-color': cat.color }}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {(loading || featured.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">FEATURED <span>PRODUCTS</span></h2>
              <Link to="/products?featured=true" className="section-link">View All →</Link>
            </div>
            <div className="products-grid">
              {loading
                ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)
                : featured.map((p) => <ProductCard key={p._id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="banner-section">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-text">
              <span className="badge badge-red">LIMITED OFFER</span>
              <h3>FREE SHIPPING ON ALL ORDERS ABOVE ₹999</h3>
              <p>Use code: <strong>SUPPX10</strong> for extra 10% off</p>
            </div>
            <Link to="/products" className="btn btn-primary">GRAB THE DEAL</Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {(loading || bestsellers.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">BEST <span>SELLERS</span></h2>
              <Link to="/products?bestseller=true" className="section-link">View All →</Link>
            </div>
            <div className="products-grid">
              {loading
                ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)
                : bestsellers.map((p) => <ProductCard key={p._id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* Why SuppX */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <h2 className="section-title">WHY CHOOSE <span>SUPPX?</span></h2>
          </div>
          <div className="why-grid">
            {[
              { icon: '✅', title: '100% Authentic', desc: 'Every product sourced directly from authorized importers. No fakes, ever.' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Orders processed within 24 hours. PAN India delivery in 2–5 days.' },
              { icon: '💰', title: 'Best Prices', desc: 'No middlemen. Direct from warehouse to your gym bag.' },
              { icon: '🧪', title: 'Science-Backed', desc: 'Products formulated with clinically proven ingredients and dosages.' },
            ].map((item) => (
              <div key={item.title} className="why-card">
                <span className="why-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
