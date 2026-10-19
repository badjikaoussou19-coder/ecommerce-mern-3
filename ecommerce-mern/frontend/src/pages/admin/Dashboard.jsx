import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api.js';
import AdminNav from '../../components/AdminNav.jsx';
import SalesChart from '../../components/SalesChart.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { fcfa, formatDate, STATUSES } from '../../utils.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <>
      <AdminNav />
      <h1>Tableau de bord</h1>
      {error && <p className="alert alert-error">{error}</p>}
      {!stats ? (
        !error && <p className="empty">Chargement…</p>
      ) : (
        <>
          <div className="stats">
            <div className="card stat"><span className="muted">Produits</span><strong>{stats.products}</strong></div>
            <div className="card stat"><span className="muted">Clients</span><strong>{stats.clients}</strong></div>
            <div className="card stat"><span className="muted">Commandes</span><strong>{stats.orders}</strong></div>
            <div className="card stat stat-main"><span>Ventes (hors commandes annulées)</span><strong>{fcfa(stats.sales)}</strong></div>
          </div>

          <h2>Ventes</h2>
          <div className="card chart-card"><SalesChart data={stats.salesByDay} /></div>

          <div className="dash-cols">
            <section>
              <h2>Meilleurs produits</h2>
              {stats.topProducts.length === 0 ? (
                <p className="empty">Pas encore de ventes.</p>
              ) : (
                <div className="card top-list">
                  {stats.topProducts.map((p) => (
                    <div key={p._id} className="top-row">
                      <div className="top-label"><span>{p.name}</span><span className="muted small">{p.quantity} vendu{p.quantity > 1 ? 's' : ''} · {fcfa(p.revenue)}</span></div>
                      <div className="bar"><span style={{ width: `${(p.revenue / stats.topProducts[0].revenue) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2>Commandes par statut</h2>
              <div className="card top-list">
                {STATUSES.map((st) => (
                  <div key={st} className="top-row status-row"><StatusBadge status={st} /><strong>{stats.ordersByStatus[st] || 0}</strong></div>
                ))}
              </div>
            </section>
          </div>

          <h2>Dernières commandes</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="empty">Aucune commande pour le moment.</p>
          ) : (
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr><th>N°</th><th>Client</th><th>Date</th><th>Total</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o._id}>
                      <td>#{o.orderNumber}</td>
                      <td>{o.user?.name || '—'}</td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>{fcfa(o.totalAmount)}</td>
                      <td><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
