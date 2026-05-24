import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2 className="footer-logo">SUPP<span>X</span></h2>
            <p>Science-backed supplements for peak performance. 100% authentic, directly delivered.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products?category=proteins">Protein</Link>
            <Link to="/products?category=pre-workout">Pre-Workout</Link>
            <Link to="/products?category=creatine">Creatine</Link>
            <Link to="/products?category=vitamins-and-supplements">Vitamins</Link>
            <Link to="/products?bestseller=true">Best Sellers</Link>
          </div>

          <div className="footer-col">
            <h4>Info</h4>
            <Link to="/about">About Us</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/pages/shipping-policy">Shipping Policy</Link>
            <Link to="/pages/return-policy">Return Policy</Link>
            <Link to="/pages/privacy-policy">Privacy Policy</Link>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <p>📧 info@suppx.co.in</p>
            <p>📞 +91 85069 30085</p>
            <p>🕐 Mon–Sat: 10am–7pm</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SuppX Vitamins & Supplements Store. All rights reserved.</p>
          <div className="payment-icons">
            <span>UPI</span>
            <span>Cards</span>
            <span>Net Banking</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
