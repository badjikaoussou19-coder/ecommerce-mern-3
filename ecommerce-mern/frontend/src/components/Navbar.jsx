import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">Boutik</Link>
        <nav className="nav-links">
          <NavLink to="/produits">Produits</NavLink>
          {user && !isAdmin && <NavLink to="/mes-commandes">Mes commandes</NavLink>}
          {user && !isAdmin && <NavLink to="/favoris">Favoris</NavLink>}
          {isAdmin && <NavLink to="/admin">Administration</NavLink>}
        </nav>
        <div className="nav-actions">
          {!isAdmin && (
            <NavLink to="/panier" className="cart-link">
              Panier{count > 0 && <span className="badge-count">{count}</span>}
            </NavLink>
          )}
          {user ? (
            <>
              <NavLink to="/profil" className="user-name">{user.name.split(' ')[0]}</NavLink>
              <button className="btn btn-ghost" onClick={handleLogout}>Déconnexion</button>
            </>
          ) : (
            <>
              <NavLink to="/connexion">Connexion</NavLink>
              <Link to="/inscription" className="btn btn-primary">Créer un compte</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
