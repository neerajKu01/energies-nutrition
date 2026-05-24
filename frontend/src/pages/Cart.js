import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, cartTotal, loading } = useCart();
  const navigate = useNavigate();

  const shipping = cartTotal >= 999 ? 0 : 99;
  const total = cartTotal + shipping;

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><div className="skeleton" style={{ height: 300 }} /></div>;

  if (!cart.items?.length) {
    return (
      <div className="cart-empty">
        <div className="container">
          <span style={{ fontSize: 64 }}>🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add some supplements to get started!</p>
          <Link to="/products" className="btn btn-primary">SHOP NOW</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">SHOPPING <span>CART</span></h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item">
                <Link to={`/product/${item.product?._id}`}>
                  <img
                    src={item.product?.images?.[0] || 'https://placehold.co/100x100/1a1a1a/f5a623?text=SuppX'}
                    alt={item.product?.name}
                    className="ci-image"
                  />
                </Link>
                <div className="ci-info">
                  <Link to={`/product/${item.product?._id}`}>
                    <h3 className="ci-name">{item.product?.name}</h3>
                  </Link>
                  {item.flavor && <p className="ci-variant">Flavor: {item.flavor}</p>}
                  {item.weight && <p className="ci-variant">Size: {item.weight}</p>}
                  <p className="ci-price">₹{item.product?.price?.toLocaleString()}</p>
                </div>
                <div className="ci-qty">Qty: {item.quantity}</div>
                <div className="ci-subtotal">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
                <button className="ci-remove" onClick={() => removeFromCart(item._id)}>✕</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="summary-title">ORDER SUMMARY</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span style={{ color: 'var(--gold)' }}>FREE</span> : `₹${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <p className="free-ship-msg">Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping</p>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary summary-btn" onClick={() => navigate('/checkout')}>
              PROCEED TO CHECKOUT
            </button>
            <Link to="/products" className="btn btn-dark summary-btn">CONTINUE SHOPPING</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
