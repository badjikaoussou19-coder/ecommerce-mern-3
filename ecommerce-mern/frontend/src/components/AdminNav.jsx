import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="subnav">
      <NavLink to="/admin" end>Tableau de bord</NavLink>
      <NavLink to="/admin/produits">Produits</NavLink>
      <NavLink to="/admin/commandes">Commandes</NavLink>
      <NavLink to="/admin/promos">Codes promo</NavLink>
    </nav>
  );
}
