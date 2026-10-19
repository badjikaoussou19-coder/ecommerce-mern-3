import { assetUrl } from '../api.js';

// Image du produit, ou initiale du nom si aucune image n'est définie
export default function ProductImage({ product, className = '' }) {
  if (product.image) return <img className={`product-img ${className}`} src={assetUrl(product.image)} alt={product.name} loading="lazy" />;
  return (
    <div className={`product-img placeholder ${className}`} aria-label={product.name}>
      {product.name?.[0]?.toUpperCase()}
    </div>
  );
}
