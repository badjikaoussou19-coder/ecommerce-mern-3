export const fcfa = (n) => `${new Intl.NumberFormat('fr-FR').format(n || 0)} FCFA`;

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

export const STATUSES = ['En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];
