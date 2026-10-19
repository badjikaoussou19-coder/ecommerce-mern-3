const COLORS = {
  'En attente': 'tag-amber',
  'Confirmée': 'tag-blue',
  'Expédiée': 'tag-violet',
  'Livrée': 'tag-green',
  'Annulée': 'tag-red',
};

export default function StatusBadge({ status }) {
  return <span className={`tag ${COLORS[status] || ''}`}>{status}</span>;
}
