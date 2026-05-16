import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', confirm: '',
    telephone: '', cin: '', adresse: '', ville: 'Casablanca', code_postal: ''
  });
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.cin) return error("Le numéro CIN est requis");
      setLoading(true);
      try {
        const data = await authApi.inscription({ action: 'check_cin', cin: form.cin });
      } catch (err) {
        setLoading(false);
        return error(err.message || "Erreur de connexion. Impossible de vérifier la CIN.");
      }
      setLoading(false);
    }
    
    if (step === 2) {
      if (form.password !== form.confirm) return error('Les mots de passe ne correspondent pas');
      if (form.password.length < 6) return error('Le mot de passe doit faire au moins 6 caractères');
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) return handleNext(e);
    
    setLoading(true);
    try {
      const { confirm, ...data } = form;
      await register(data);
      success('Compte créé avec succès ! Bienvenue.');
      navigate('/');
    } catch (err) {
      error(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { backgroundColor: '#fff', color: '#000', width: '100%' };

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

      {/* Côté droit — Formulaire (no scroll) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', background: '#F5F5F7', color: '#1D1D1F', overflow: 'hidden' }}>
        <div className="hide-desktop" style={{ marginBottom: 20 }}>
          <Link to="/" style={{ color: '#1D1D1F', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
            <span className="material-symbols-outlined">arrow_back</span> Retour
          </Link>
        </div>

        <div style={{ maxWidth: 440, margin: 'auto', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 8 }}>Créer un compte</h1>
            <p style={{ fontSize: 15, color: '#6E6E73' }}>Étape {step} sur 3</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>1. Infos personnelles</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Prénom *</label>
                    <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} className="apple-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Nom *</label>
                    <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="apple-input" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Téléphone *</label>
                  <input required type="tel" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="apple-input" placeholder="06..." style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Numéro CIN *</label>
                  <input required value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value.toUpperCase() })} className="apple-input" placeholder="AB123456" maxLength={20} style={inputStyle} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>2. Sécurité</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="apple-input" placeholder="vous@email.com" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="apple-input" style={{ ...inputStyle, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#8E8E93', display: 'flex' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Confirmer le mot de passe *</label>
                  <input required type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="apple-input" style={inputStyle} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>3. Localisation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Ville *</label>
                    <select required value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} className="apple-input" style={inputStyle}>
                      <option value="Casablanca">Casablanca</option>
                      <option value="Mohammedia">Mohammedia</option>
                      <option value="Rabat">Rabat</option>
                      <option value="Marrakech">Marrakech</option>
                      <option value="Fès">Fès</option>
                      <option value="Tanger">Tanger</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Code Postal</label>
                    <input value={form.code_postal} onChange={e => setForm({ ...form, code_postal: e.target.value })} className="apple-input" placeholder="20000" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Adresse complète *</label>
                  <textarea required value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} className="apple-input" placeholder="N° de rue, nom de la rue..." style={{ ...inputStyle, height: 80, resize: 'none' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, height: 48, borderRadius: 9999, background: '#E5E5EA', color: '#1D1D1F', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Retour
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 2, height: 48, borderRadius: 9999, background: '#1D1D1F', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', transition: 'transform 200ms' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {step < 3 ? 'Suivant' : (loading ? 'Création...' : 'Créer mon compte')}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: '#6E6E73' }}>
            Déjà client ? <Link to="/connexion" style={{ color: '#0071E3', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
