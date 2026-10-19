import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import Stars from './Stars.jsx';
import { fcfa } from '../utils.js';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const { isAdmin } = useAuth();
  const out = product.stock <= 0;

  return (
    <article className="card product-card">
      <div className="card-media">
        <Link to={`/produits/${product._id}`}>
          <ProductImage product={product} />
        </Link>
        <FavoriteButton productId={product._id} />
      </div>
      <div className="product-body">
        <span className="muted small">{product.category?.name}</span>
        <h3><Link to={`/produits/${product._id}`}>{product.name}</Link></h3>
        {product.ratingCount > 0 && (
          <span className="rating-line"><Stars value={product.ratingAvg} /> <span className="muted small">({product.ratingCount})</span></span>
        )}
        <div className="product-foot">
          <strong className="price">{fcfa(product.price)}</strong>
          {out ? (
            <span className="tag tag-red">Épuisé</span>
          ) : (
            !isAdmin && <button className="btn btn-small" onClick={() => add(product)}>Ajouter</button>
          )}
        </div>
      </div>
    </article>
  );
}
