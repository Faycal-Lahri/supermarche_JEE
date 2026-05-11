import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', confirm: '',
    telephone: '', cin: '', adresse: '', ville: 'Casablanca'
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return error('Les mots de passe ne correspondent pas');
    if (form.password.length < 6) return error('Le mot de passe doit faire au moins 6 caractères');
    
    setLoading(true);
    try {
      const { confirm, ...data } = form;
      await register(data);
      success('Compte créé avec succès ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      error(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'var(--font-sf)', overflow: 'hidden' }}>
      
      {/* Côté gauche — Image */}
      <div className="hide-mobile" style={{ flex: 1, background: '#000', position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"
          alt="Supermarché"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60, color: '#fff' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 15, fontWeight: 600 }}>
            <span className="material-symbols-outlined">arrow_back</span> Retour à l'accueil
          </Link>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>Rejoignez-nous.</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>Créez un compte pour profiter de la livraison en 2h.</p>
        </div>
      </div>

      {/* Côté droit — Formulaire (scrollable) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', background: '#fff', overflowY: 'auto' }}>
        <div className="hide-desktop" style={{ marginBottom: 40 }}>
          <Link to="/" style={{ color: '#1D1D1F', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
            <span className="material-symbols-outlined">arrow_back</span> Retour à l'accueil
          </Link>
        </div>

        <div style={{ maxWidth: 440, margin: 'auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 8 }}>Créer un compte</h1>
            <p style={{ fontSize: 15, color: '#6E6E73' }}>Remplissez vos informations personnelles.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            {/* Prénom + Nom */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Prénom *</label>
                <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Nom *</label>
                <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="vous@email.com" />
            </div>

            {/* Téléphone */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Téléphone *</label>
              <input required type="tel" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="06..." />
            </div>

            {/* CIN */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Numéro CIN *</label>
              <input
                required
                value={form.cin}
                onChange={e => setForm({ ...form, cin: e.target.value.toUpperCase() })}
                className="apple-input"
                style={{ width: '100%', background: '#F5F5F7', border: 'none' }}
                placeholder="AB123456"
                maxLength={20}
              />
              <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>
                Carte Nationale d'Identité — requis pour la livraison
              </div>
            </div>
            
            {/* Mot de passe */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Mot de passe *</label>
                <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Confirmer *</label>
                <input required type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
              </div>
            </div>

            <div style={{ height: 1, background: '#EDEDF2', margin: '8px 0' }} />

            {/* Ville */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Ville *</label>
              <select required value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }}>
                <option value="Casablanca">Casablanca</option>
                <option value="Mohammedia">Mohammedia</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Fès">Fès</option>
                <option value="Tanger">Tanger</option>
              </select>
            </div>

            {/* Adresse */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Adresse complète *</label>
              <input required value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="N° de rue, nom de la rue..." />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: 48, borderRadius: 9999, background: '#0071E3', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', marginTop: 24, transition: 'transform 200ms' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: '#6E6E73' }}>
            Déjà un compte ? <Link to="/login" style={{ color: '#0071E3', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
