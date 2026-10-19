import { fcfa } from '../utils.js';

// Histogramme SVG des ventes par jour (sans dépendance externe)
export default function SalesChart({ data }) {
  const W = 640, H = 230, L = 8, R = 8, T = 16, B = 28;
  const max = Math.max(...data.map((d) => d.total), 1);
  const bw = (W - L - R) / data.length;
  const total = data.reduce((s, d) => s + d.total, 0);
  const short = (d) => d.slice(8, 10) + '/' + d.slice(5, 7);

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Ventes des ${data.length} derniers jours : ${fcfa(total)}`}>
        {[0, 0.5, 1].map((r) => {
          const y = T + (H - T - B) * (1 - r);
          return <line key={r} x1={L} x2={W - R} y1={y} y2={y} className="chart-grid" />;
        })}
        {data.map((d, i) => {
          const h = ((H - T - B) * d.total) / max;
          return (
            <g key={d.date}>
              <rect x={L + i * bw + 2} y={H - B - h} width={Math.max(bw - 4, 1)} height={h} rx="2" className="chart-bar">
                <title>{`${short(d.date)} : ${fcfa(d.total)} (${d.orders} commande${d.orders > 1 ? 's' : ''})`}</title>
              </rect>
              {i % 5 === 0 && <text x={L + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="chart-label">{short(d.date)}</text>}
            </g>
          );
        })}
        <text x={L} y={T - 4} className="chart-label">{fcfa(max)}</text>
      </svg>
      <figcaption className="muted small">Ventes par jour, 30 derniers jours (commandes annulées exclues) — total {fcfa(total)}</figcaption>
    </figure>
  );
}
