import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api.js';
import AdminNav from '../../components/AdminNav.jsx';
import ProductImage from '../../components/ProductImage.jsx';
import { fcfa } from '../../utils.js';

const EMPTY = { name: '', description: '', price: '', stock: '', category: '', image: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [newCat, setNewCat] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  const load = () => {
    api.get('/products').then((r) => setProducts(r.data)).catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  };
  useEffect(load, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reset = () => {
    setForm(EMPTY);
    setEditId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editId) await api.put(`/products/${editId}`, body);
      else await api.post('/products', body);
      setMsg({ type: 'ok', text: editId ? 'Produit modifié.' : 'Produit ajouté.' });
      reset();
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  const edit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      category: p.category?._id || '',
      image: p.image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (p) => {
    if (!window.confirm(`Supprimer « ${p.name} » ?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    setUploading(true);
    try {
      const r = await api.post('/products/upload', data);
      setForm((f) => ({ ...f, image: r.data.url }));
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    } finally {
      setUploading(false);
    }
  };

  const addCategory = async () => {
    if (!newCat.trim()) return;
    try {
      const r = await api.post('/categories', { name: newCat.trim() });
      setNewCat('');
      setCategories((c) => [...c, r.data]);
      setForm((f) => ({ ...f, category: r.data._id }));
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  return (
    <>
      <AdminNav />
      <h1>Gestion des produits</h1>

      <form className="card form-grid" onSubmit={submit}>
        <h2>{editId ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
        <label>Nom<input name="name" value={form.name} onChange={change} required /></label>
        <label>Prix (FCFA)<input type="number" min="0" name="price" value={form.price} onChange={change} required /></label>
        <label>Stock<input type="number" min="0" name="stock" value={form.stock} onChange={change} required /></label>
        <label>
          Catégorie
          <select name="category" value={form.category} onChange={change} required>
            <option value="">Choisir…</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
        <div className="inline-add">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nouvelle catégorie" aria-label="Nouvelle catégorie" />
          <button type="button" className="btn btn-small" onClick={addCategory}>Créer la catégorie</button>
        </div>
        <label className="span-2">Description<textarea name="description" rows="3" value={form.description} onChange={change} /></label>
        <label>Image (fichier)<input type="file" accept="image/*" onChange={upload} /></label>
        <label>ou lien de l'image<input name="image" value={form.image} onChange={change} placeholder="https://…" /></label>
        {uploading && <p className="muted span-2">Envoi de l'image…</p>}
        {form.image && <ProductImage product={{ name: form.name || 'Aperçu', image: form.image }} className="thumb" />}
        {msg.text && <p className={`alert alert-${msg.type} span-2`}>{msg.text}</p>}
        <div className="row span-2">
          <button className="btn btn-primary">{editId ? 'Enregistrer les modifications' : 'Ajouter le produit'}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={reset}>Annuler</button>}
        </div>
      </form>

      <h2>Catalogue ({products.length})</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th></th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><ProductImage product={p} className="thumb" /></td>
                <td>{p.name}</td>
                <td>{p.category?.name}</td>
                <td>{fcfa(p.price)}</td>
                <td className={p.stock === 0 ? 'text-red' : ''}>{p.stock}</td>
                <td className="actions">
                  <button className="btn btn-small" onClick={() => edit(p)}>Modifier</button>
                  <button className="btn btn-small btn-danger" onClick={() => remove(p)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
