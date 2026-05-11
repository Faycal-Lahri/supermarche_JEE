import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, mot_de_passe: password });
      success(`Bienvenue ${res.prenom || ''} !`);
      
      if (res.role && res.role !== 'client') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      error(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-sf)' }}>
      {/* Left side - Image */}
      <div className="hide-mobile" style={{ flex: 1, background: '#000', position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" alt="Supermarché" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60, color: '#fff' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 15, fontWeight: 600 }}>
            <span className="material-symbols-outlined">arrow_back</span> Retour à l'accueil
          </Link>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>L'Épicerie<br/>Moderne.</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>Vos courses fraîches, livrées en 2 heures chrono.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', background: '#fff', position: 'relative' }}>
        <div className="hide-desktop" style={{ marginBottom: 40 }}>
          <Link to="/" style={{ color: '#1D1D1F', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
            <span className="material-symbols-outlined">arrow_back</span> Retour
          </Link>
        </div>

        <div style={{ maxWidth: 400, margin: 'auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 8 }}>Connexion</h1>
            <p style={{ fontSize: 15, color: '#6E6E73' }}>Accédez à votre espace personnel.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Adresse email</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="vous@email.com" />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>Mot de passe</label>
                <Link to="/contact" style={{ fontSize: 13, color: '#0071E3', textDecoration: 'none', fontWeight: 500 }}>Oublié ?</Link>
              </div>
              <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', height: 48, borderRadius: 9999, background: '#1D1D1F', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', marginTop: 12, transition: 'transform 200ms, background 200ms' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = '#000'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#1D1D1F'; }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: '#6E6E73' }}>
            Nouveau client ? <Link to="/register" style={{ color: '#0071E3', fontWeight: 600, textDecoration: 'none' }}>Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
