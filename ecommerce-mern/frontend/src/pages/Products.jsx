import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';

  const [input, setInput] = useState(search);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setInput(search);
    setLoading(true);
    api
      .get('/products', { params: { search, category } })
      .then((r) => {
        setProducts(r.data);
        setError('');
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [search, category]);

  const update = (next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p);
  };

  return (
    <>
      <h1>Produits</h1>
      <form className="toolbar" onSubmit={(e) => { e.preventDefault(); update({ search: input.trim() }); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Rechercher par nom" aria-label="Rechercher par nom" />
        <button className="btn btn-primary">Rechercher</button>
        {(search || category) && (
          <button type="button" className="btn btn-ghost" onClick={() => setParams({})}>Réinitialiser</button>
        )}
      </form>

      <div className="chips">
        <button className={`chip ${!category ? 'active' : ''}`} onClick={() => update({ category: '' })}>Toutes</button>
        {categories.map((c) => (
          <button key={c._id} className={`chip ${category === c._id ? 'active' : ''}`} onClick={() => update({ category: c._id })}>
            {c.name}
          </button>
        ))}
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="empty">Chargement…</p>
      ) : products.length === 0 ? (
        <p className="empty">Aucun produit ne correspond à votre recherche.</p>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}
    </>
  );
}
