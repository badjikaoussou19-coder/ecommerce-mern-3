import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas');
    setLoading(true);
    try {
      const { confirm, ...data } = form;
      await register(data);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth card">
      <h1>Créer un compte</h1>
      <form className="form" onSubmit={submit}>
        <label>Nom complet<input name="name" value={form.name} onChange={change} required autoFocus /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
        <label>Téléphone<input name="phone" value={form.phone} onChange={change} /></label>
        <label>Mot de passe (6 caractères minimum)<input type="password" name="password" value={form.password} onChange={change} required minLength={6} /></label>
        <label>Confirmer le mot de passe<input type="password" name="confirm" value={form.confirm} onChange={change} required /></label>
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary block" disabled={loading}>{loading ? 'Création…' : 'Créer mon compte'}</button>
      </form>
      <p className="muted">Vous avez déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
    </div>
  );
}
