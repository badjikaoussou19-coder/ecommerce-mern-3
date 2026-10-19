import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api.js';
import AdminNav from '../../components/AdminNav.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { fcfa, formatDate, STATUSES } from '../../utils.js';

// Actions possibles selon le statut actuel
const ACTIONS = [
  { label: 'Confirmer', status: 'Confirmée', from: ['En attente'] },
  { label: 'Expédier', status: 'Expédiée', from: ['Confirmée'] },
  { label: 'Livrer', status: 'Livrée', from: ['Expédiée'] },
  { label: 'Annuler', status: 'Annulée', from: ['En attente', 'Confirmée', 'Expédiée'], danger: true },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/orders', { params: { status: filter } })
      .then((r) => setOrders(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [filter]);

  const setStatus = async (order, status) => {
    if (status === 'Annulée' && !window.confirm(`Annuler la commande #${order.orderNumber} ? Le stock sera remis en vente.`)) return;
    try {
      await api.put(`/orders/${order._id}`, { status });
      setError('');
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <>
      <AdminNav />
      <h1>Gestion des commandes</h1>
      <div className="toolbar">
        <label className="inline">
          Statut
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tous</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <p className="empty">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="empty">Aucune commande.</p>
      ) : (
        <div className="stack">
          {orders.map((o) => (
            <article className="card order" key={o._id}>
              <div className="order-head">
                <div>
                  <strong>Commande #{o.orderNumber}</strong>
                  <div className="muted small">{o.user?.name} — {formatDate(o.createdAt)}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="order-foot">
                <strong>
                  Total : {fcfa(o.totalAmount)}
                  {o.discount > 0 && <span className="muted small"> (code {o.couponCode} : − {fcfa(o.discount)})</span>}
                </strong>
                <button className="btn btn-ghost btn-small" onClick={() => setOpen(open === o._id ? null : o._id)}>
                  {open === o._id ? 'Masquer le détail' : 'Voir le détail'}
                </button>
              </div>

              {open === o._id && (
                <div className="order-detail">
                  <ul className="order-items">
                    {o.items.map((i) => (
                      <li key={i.product}>
                        <span>{i.name} × {i.quantity}</span>
                        <span>{fcfa(i.price * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="small">
                    <strong>{o.shippingAddress.fullName}</strong> — {o.shippingAddress.phone}<br />
                    {o.shippingAddress.address}, {o.shippingAddress.city}<br />
                    <span className="muted">{o.user?.email}</span>
                  </p>
                </div>
              )}

              <div className="row">
                {ACTIONS.filter((a) => a.from.includes(o.status)).map((a) => (
                  <button key={a.status} className={`btn btn-small ${a.danger ? 'btn-danger' : ''}`} onClick={() => setStatus(o, a.status)}>
                    {a.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
