import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { fcfa, formatDate } from '../utils.js';

export default function MyOrders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/orders/mine')
      .then((r) => setOrders(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    try {
      await api.put(`/orders/${id}`, { status: 'Annulée' });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <>
      <h1>Mes commandes</h1>
      {location.state?.created && (
        <p className="alert alert-ok">Commande #{location.state.created} enregistrée. Nous vous contacterons pour la livraison.</p>
      )}
      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="empty">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="empty">Vous n'avez pas encore passé de commande. <Link to="/produits">Voir les produits</Link></p>
      ) : (
        <div className="stack">
          {orders.map((o) => (
            <article className="card order" key={o._id}>
              <div className="order-head">
                <div>
                  <strong>Commande #{o.orderNumber}</strong>
                  <div className="muted small">{formatDate(o.createdAt)}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <ul className="order-items">
                {o.items.map((i) => (
                  <li key={i.product}>
                    <span>{i.name} × {i.quantity}</span>
                    <span>{fcfa(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="order-foot">
                <span className="muted small">Livraison : {o.shippingAddress.address}, {o.shippingAddress.city}</span>
                <strong>
                  Total : {fcfa(o.totalAmount)}
                  {o.discount > 0 && <span className="muted small"> (code {o.couponCode} : − {fcfa(o.discount)})</span>}
                </strong>
              </div>
              {o.status === 'En attente' && (
                <button className="btn btn-ghost btn-small" onClick={() => cancel(o._id)}>Annuler la commande</button>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
