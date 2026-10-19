import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    password: '',
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const { password, ...rest } = form;
      await updateProfile(password ? { ...rest, password } : rest);
      setForm((f) => ({ ...f, password: '' }));
      setMsg({ type: 'ok', text: 'Profil mis à jour.' });
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  return (
    <div className="auth card">
      <h1>Mon profil</h1>
      <form className="form" onSubmit={submit}>
        <label>Nom complet<input name="name" value={form.name} onChange={change} required /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
        <label>Téléphone<input name="phone" value={form.phone} onChange={change} /></label>
        <label>Adresse<input name="address" value={form.address} onChange={change} /></label>
        <label>Nouveau mot de passe (laisser vide pour ne pas changer)<input type="password" name="password" value={form.password} onChange={change} minLength={6} /></label>
        {msg.text && <p className={`alert alert-${msg.type}`}>{msg.text}</p>}
        <button className="btn btn-primary block">Enregistrer</button>
      </form>
    </div>
  );
}
