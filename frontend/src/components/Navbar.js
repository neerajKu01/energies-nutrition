import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${search}`);
      setSearch('');
    }
  };

  const navLinks = [
    { to: '/products?bestseller=true', label: 'Best Sellers' },
    { to: '/products?category=proteins', label: 'Protein' },
    { to: '/products?category=pre-workout', label: 'Pre-Workout' },
    { to: '/products?category=creatine', label: 'Creatine' },
    { to: '/products?category=vitamins-and-supplements', label: 'Vitamins' },
    { to: '/products', label: 'All Products' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-top">
        <div className="container nav-inner">
          <Link to="/" className="nav-logo">
            SUPP<span>X</span>
          </Link>

          <form className="nav-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search supplements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>

          <div className="nav-actions">
            <Link to="/cart" className="nav-icon-btn">
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="nav-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className="nav-icon-btn">👤 {user.name.split(' ')[0]}</span>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                    {user.isAdmin && <Link to="/admin" onClick={() => setDropdownOpen(false)}>Admin Panel</Link>}
                    <button onClick={() => { logout(); setDropdownOpen(false); }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                LOGIN
              </Link>
            )}

            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      <div className="nav-categories">
        <div className="container">
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
