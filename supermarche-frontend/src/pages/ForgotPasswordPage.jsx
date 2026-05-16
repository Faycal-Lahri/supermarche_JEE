import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { error, success } = useToast();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return error("Veuillez saisir votre adresse email");
    setLoading(true);
    try {
      const data = await authApi.passwordReset({ action: 'send_code', email });
      success(data.data?.message || "Code envoyé à votre adresse email !");
      setStep(2);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (step === 2) {
      if (!code) return error("Veuillez saisir le code à 6 chiffres");
      if (code.length !== 6) return error("Le code doit contenir 6 chiffres");
      
      setLoading(true);
      try {
        await authApi.passwordReset({ action: 'verify_code', email, code });
        setStep(3);
      } catch (err) {
        error(err.message || "Code incorrect");
      } finally {
        setLoading(false);
      }
      return;
    }
    
    if (step === 3) {
      if (newPassword !== confirmPassword) return error("Les mots de passe ne correspondent pas");
      if (newPassword.length < 6) return error("Le mot de passe doit faire au moins 6 caractères");
      
      setLoading(true);
      try {
        const data = await authApi.passwordReset({ action: 'reset_password', email, code, new_password: newPassword });
        success("Mot de passe modifié avec succès ! Un email de confirmation a été envoyé.");
        navigate('/connexion');
      } catch (err) {
        error(err.message);
      } finally {
        setLoading(false);
      }
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
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>Mot de passe oublié ?</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>Pas de panique, réinitialisez-le en quelques secondes.</p>
        </div>
      </div>

      {/* Côté droit — Formulaire (no scroll) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', background: '#F5F5F7', color: '#1D1D1F', overflow: 'hidden' }}>
        <div className="hide-desktop" style={{ marginBottom: 20 }}>
          <Link to="/connexion" style={{ color: '#1D1D1F', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
            <span className="material-symbols-outlined">arrow_back</span> Retour
          </Link>
        </div>

        <div style={{ maxWidth: 440, margin: 'auto', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: '#1D1D1F', color: '#fff', marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>shopping_basket</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 8 }}>
              {step === 1 ? 'Mot de passe oublié' : step === 2 ? 'Code de vérification' : 'Nouveau mot de passe'}
            </h1>
            <p style={{ fontSize: 15, color: '#6E6E73' }}>Étape {step} sur 3</p>
          </div>

          <form onSubmit={step === 1 ? handleSendCode : handleResetPassword} style={{ display: 'grid', gap: 16 }}>
            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 24, textAlign: 'center' }}>
                  Entrez votre adresse email. Nous vous enverrons un code à 6 chiffres pour réinitialiser votre mot de passe.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Email</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="apple-input" placeholder="vous@email.com" style={inputStyle} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 24, textAlign: 'center' }}>
                  Entrez le code à 6 chiffres qui vous a été envoyé à <strong>{email}</strong>
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Code de vérification</label>
                  <input required type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} className="apple-input" placeholder="123456" style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: 20, fontWeight: 700 }} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input required type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="apple-input" style={{ ...inputStyle, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#8E8E93', display: 'flex' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>Confirmer le mot de passe</label>
                  <input required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="apple-input" style={inputStyle} />
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
                {step === 1 ? (loading ? 'Envoi...' : 'Envoyer le code') : step === 2 ? 'Vérifier' : (loading ? 'Modification...' : 'Modifier')}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: '#6E6E73' }}>
            Je me souviens de mon mot de passe ! <Link to="/connexion" style={{ color: '#0071E3', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
