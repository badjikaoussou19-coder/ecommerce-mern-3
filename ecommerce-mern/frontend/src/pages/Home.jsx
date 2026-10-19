import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data.slice(0, 8))).catch(() => {});
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/produits?search=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <section className="hero">
        <h1>Trouvez ce qu'il vous faut, payez en FCFA, recevez chez vous.</h1>
        <form className="hero-search" onSubmit={submit}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit, par exemple « casque »" aria-label="Rechercher un produit" />
          <button className="btn btn-accent">Rechercher</button>
        </form>
        <div className="chips">
          {categories.map((c) => (
            <Link key={c._id} to={`/produits?category=${c._id}`} className="chip">{c.name}</Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Derniers produits</h2>
          <Link to="/produits">Voir tout le catalogue</Link>
        </div>
        {products.length === 0 ? (
          <p className="empty">Aucun produit pour le moment.</p>
        ) : (
          <div className="grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </section>
    </>
  );
}
