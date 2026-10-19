import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fcfa } from '../utils.js';

export default function Cart() {
  const { items, remove, setQuantity, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [couponMsg, setCouponMsg] = useState('');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
  });

  const applyCoupon = async (e) => {
    e.preventDefault();
    setCouponMsg('');
    try {
      const { data } = await api.post('/coupons/validate', { code: codeInput, subtotal: total });
      setCoupon({ code: data.code, discount: data.discount });
      setCodeInput('');
    } catch (err) {
      setCoupon(null);
      setCouponMsg(errMsg(err));
    }
  };

  // le panier change : on revérifie le code (minimum de commande, montant de la remise)
  useEffect(() => {
    if (!coupon) return;
    api
      .post('/coupons/validate', { code: coupon.code, subtotal: total })
      .then(({ data }) => setCoupon({ code: data.code, discount: data.discount }))
      .catch((err) => {
        setCoupon(null);
        setCouponMsg(errMsg(err));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const discount = coupon?.discount || 0;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const order = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: form,
        couponCode: coupon?.code,
      });
      clear();
      navigate('/mes-commandes', { state: { created: data.orderNumber } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <h1>Mon panier</h1>
        <p className="empty">Votre panier est vide. <Link to="/produits">Parcourir les produits</Link></p>
      </>
    );
  }

  return (
    <>
      <h1>Mon panier</h1>
      <div className="cart-layout">
        <div className="card cart-list">
          {items.map((i) => (
            <div className="cart-row" key={i._id}>
              <ProductImage product={i} className="thumb" />
              <div className="cart-info">
                <Link to={`/produits/${i._id}`}><strong>{i.name}</strong></Link>
                <span className="muted">{fcfa(i.price)} × {i.quantity}</span>
              </div>
              <div className="qty">
                <button onClick={() => setQuantity(i._id, i.quantity - 1)} aria-label="Diminuer la quantité">−</button>
                <span>{i.quantity}</span>
                <button onClick={() => setQuantity(i._id, i.quantity + 1)} aria-label="Augmenter la quantité">+</button>
              </div>
              <strong className="line-total">{fcfa(i.price * i.quantity)}</strong>
              <button className="btn btn-ghost btn-small" onClick={() => remove(i._id)}>Supprimer</button>
            </div>
          ))}
        </div>

        <aside className="card summary">
          <h2>Récapitulatif</h2>
          {user && (
            coupon ? (
              <p className="alert alert-ok coupon-applied">
                Code <strong>{coupon.code}</strong> appliqué
                <button className="btn btn-ghost btn-small" onClick={() => setCoupon(null)}>Retirer</button>
              </p>
            ) : (
              <form className="coupon-form" onSubmit={applyCoupon}>
                <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Code promo" aria-label="Code promo" />
                <button className="btn btn-small" disabled={!codeInput.trim()}>Appliquer</button>
              </form>
            )
          )}
          {couponMsg && <p className="alert alert-error">{couponMsg}</p>}
          {discount > 0 && (
            <>
              <div className="total-row muted"><span>Sous-total</span><span>{fcfa(total)}</span></div>
              <div className="total-row text-green"><span>Remise</span><span>− {fcfa(discount)}</span></div>
            </>
          )}
          <div className="total-row"><span>Total</span><strong>{fcfa(total - discount)}</strong></div>

          {!checkout ? (
            user ? (
              <button className="btn btn-primary block" onClick={() => setCheckout(true)}>Passer la commande</button>
            ) : (
              <button className="btn btn-primary block" onClick={() => navigate('/connexion', { state: { from: '/panier' } })}>
                Se connecter pour commander
              </button>
            )
          ) : (
            <form onSubmit={order} className="form">
              <h3>Adresse de livraison</h3>
              <label>Nom complet<input name="fullName" value={form.fullName} onChange={change} required /></label>
              <label>Téléphone<input name="phone" value={form.phone} onChange={change} required /></label>
              <label>Adresse<input name="address" value={form.address} onChange={change} required /></label>
              <label>Ville<input name="city" value={form.city} onChange={change} required /></label>
              {error && <p className="alert alert-error">{error}</p>}
              <button className="btn btn-primary block" disabled={loading}>{loading ? 'Envoi…' : 'Confirmer la commande'}</button>
            </form>
          )}
          <button className="btn btn-ghost block" onClick={clear}>Vider le panier</button>
        </aside>
      </div>
    </>
  );
}
