import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {discount > 0 && <span className="badge badge-red pc-discount">{discount}% OFF</span>}
      {product.isBestSeller && !discount && <span className="badge badge-gold pc-best">Best Seller</span>}

      <Link to={`/product/${product._id}`} className="pc-image-wrap">
        <img
          src={product.images?.[0] || 'https://placehold.co/300x300/1a1a1a/f5a623?text=energienutrition'}
          alt={product.name}
          className="pc-image"
        />
      </Link>

      <div className="pc-body">
        <p className="pc-brand">{product.brand || 'energienutrition'}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="pc-name">{product.name}</h3>
        </Link>

        {product.rating > 0 && (
          <div className="pc-rating">
            <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span className="pc-num-reviews">({product.numReviews})</span>
          </div>
        )}

        <div className="pc-pricing">
          <span className="pc-price">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="pc-original">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        <button
          className="btn btn-primary pc-cart-btn"
          onClick={() => addToCart(product._id)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
}
