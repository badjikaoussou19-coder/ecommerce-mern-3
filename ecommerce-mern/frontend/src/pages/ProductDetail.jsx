import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import Stars from '../components/Stars.jsx';
import { fcfa, formatDate } from '../utils.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const { user, isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

  const loadAll = () => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data)).catch((e) => setError(errMsg(e)));
    api.get(`/products/${id}/reviews`).then((r) => setReviews(r.data)).catch(() => {});
  };

  const sendReview = async (e) => {
    e.preventDefault();
    setReviewMsg({ type: '', text: '' });
    try {
      await api.post(`/products/${id}/reviews`, form);
      setReviewMsg({ type: 'ok', text: 'Merci, votre avis est publié.' });
      loadAll();
    } catch (err) {
      setReviewMsg({ type: 'error', text: errMsg(err) });
    }
  };

  const removeReview = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      loadAll();
    } catch (err) {
      setReviewMsg({ type: 'error', text: errMsg(err) });
    }
  };

  useEffect(loadAll, [id]);

  if (error) return <p className="alert alert-error">{error}</p>;
  if (!product) return <p className="empty">Chargement…</p>;

  const out = product.stock <= 0;

  return (
    <>
      <Link to="/produits" className="back">← Retour aux produits</Link>
      <div className="detail">
        <ProductImage product={product} className="detail-img" />
        <div>
          <span className="muted">{product.category?.name}</span>
          <div className="title-row">
            <h1>{product.name}</h1>
            <FavoriteButton productId={product._id} />
          </div>
          {product.ratingCount > 0 && (
            <p className="rating-line"><Stars value={product.ratingAvg} size="1.2rem" /> <span className="muted">{product.ratingAvg} / 5 · {product.ratingCount} avis</span></p>
          )}
          <p className="price big">{fcfa(product.price)}</p>
          <p>{product.description || 'Aucune description.'}</p>
          <p className={out ? 'text-red' : 'muted'}>{out ? 'Produit épuisé' : `${product.stock} en stock`}</p>

          {!out && !isAdmin && (
            <div className="row">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuer la quantité">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Augmenter la quantité">+</button>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  add(product, qty);
                  setAdded(true);
                }}
              >
                Ajouter au panier
              </button>
            </div>
          )}
          {added && (
            <p className="alert alert-ok">
              Produit ajouté au panier. <Link to="/panier">Voir le panier</Link>
            </p>
          )}
        </div>
      </div>

      <section className="reviews">
        <h2>Avis des clients</h2>
        {reviews.length === 0 && <p className="muted">Aucun avis pour le moment.</p>}
        <div className="stack">
          {reviews.map((r) => (
            <article className="card review" key={r._id}>
              <div className="review-head">
                <strong>{r.user?.name || 'Client'}</strong>
                <Stars value={r.rating} />
                <span className="muted small">{formatDate(r.createdAt)}</span>
                {(isAdmin || r.user?._id === user?._id) && (
                  <button className="btn btn-ghost btn-small" onClick={() => removeReview(r._id)}>Supprimer</button>
                )}
              </div>
              {r.comment && <p>{r.comment}</p>}
            </article>
          ))}
        </div>

        {user && !isAdmin && (
          <form className="card form review-form" onSubmit={sendReview}>
            <h3>Donner mon avis</h3>
            <Stars value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} size="1.6rem" />
            <label>Commentaire (facultatif)
              <textarea rows="3" maxLength="1000" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </label>
            {reviewMsg.text && <p className={`alert alert-${reviewMsg.type}`}>{reviewMsg.text}</p>}
            <button className="btn btn-primary">Publier</button>
            <p className="muted small">Vous pouvez noter un produit une fois votre commande livrée. Un nouvel envoi remplace votre avis.</p>
          </form>
        )}
        {!user && <p className="muted"><Link to="/connexion">Connectez-vous</Link> pour donner votre avis.</p>}
      </section>
    </>
  );
}
