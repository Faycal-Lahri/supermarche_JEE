import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { profilApi } from '../../api/api';
import { CSS } from './dashboards/SharedComponents';

export default function AdminProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { success, error } = useToast();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: ''
  });

  const [mdpForm, setMdpForm] = useState({ ancien_mdp: '', nouveau_mdp: '', confirm_mdp: '' });
  const [savingMdp, setSavingMdp] = useState(false);
  const [showMdp, setShowMdp] = useState({ ancien: false, nouveau: false, confirm: false });

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profilApi.modifier(form);
      updateUser({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
      });
      success('Profil mis à jour avec succès.');
    } catch (err) {
      error(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeMdp = async (e) => {
    e.preventDefault();
    if (mdpForm.nouveau_mdp !== mdpForm.confirm_mdp) return error('Les mots de passe ne correspondent pas');
    if (mdpForm.nouveau_mdp.length < 6) return error('Minimum 6 caractères');
    setSavingMdp(true);
    try {
      await profilApi.mdp({ ancien_mdp: mdpForm.ancien_mdp, nouveau_mdp: mdpForm.nouveau_mdp });
      success('Mot de passe modifié. Veuillez vous reconnecter.');
      setMdpForm({ ancien_mdp: '', nouveau_mdp: '', confirm_mdp: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      error(err.message || 'Mot de passe actuel incorrect');
    } finally {
      setSavingMdp(false);
    }
  };

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E5EA', background: '#fff', fontSize: 14, color: '#1D1D1F', outline: 'none', transition: 'border-color 200ms', fontFamily: 'inherit' };
  
  const F = { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', ...F }}>
      <style>{CSS}
      {`
        .input-focus:focus { border-color: #007AFF !important; box-shadow: 0 0 0 3px rgba(0,122,255,0.1); }
      `}
      </style>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1D1D1F', letterSpacing: '-0.04em', marginBottom: 8 }}>Mon Profil</h1>
          <p style={{ fontSize: 14, color: '#6E6E73', fontWeight: 500 }}>Gérez vos informations personnelles et paramètres de sécurité.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          
          {/* ── INFORMATIONS PERSONNELLES ── */}
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#007AFF', fontVariationSettings: "'FILL' 1" }}>person</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1D1D1F', margin: 0 }}>Informations Personnelles</h2>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Prénom</label>
                  <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} className="input-focus" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="input-focus" style={inputStyle} />
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>Adresse Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-focus" style={inputStyle} />
              </div>
              
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input type="tel" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="input-focus" style={inputStyle} placeholder="+33 6 00 00 00 00" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 24px', borderRadius: 9999, border: 'none', background: '#1D1D1F', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 150ms' }} onMouseEnter={e => e.currentTarget.style.background = '#3c3c43'} onMouseLeave={e => e.currentTarget.style.background = '#1D1D1F'}>
                  {saving ? <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>

          {/* ── SÉCURITÉ & MOT DE PASSE ── */}
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#FF3B30', fontVariationSettings: "'FILL' 1" }}>lock</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1D1D1F', margin: 0 }}>Sécurité</h2>
            </div>
            
            <form onSubmit={handleChangeMdp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <label style={labelStyle}>Mot de passe actuel</label>
                <div style={{ position: 'relative' }}>
                  <input required type={showMdp.ancien ? 'text' : 'password'} value={mdpForm.ancien_mdp} onChange={e => setMdpForm({ ...mdpForm, ancien_mdp: e.target.value })} className="input-focus" style={{...inputStyle, paddingRight: 48}} />
                  <button type="button" onClick={() => setShowMdp(s => ({ ...s, ancien: !s.ancien }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showMdp.ancien ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input required type={showMdp.nouveau ? 'text' : 'password'} value={mdpForm.nouveau_mdp} onChange={e => setMdpForm({ ...mdpForm, nouveau_mdp: e.target.value })} className="input-focus" style={{...inputStyle, paddingRight: 48}} />
                  <button type="button" onClick={() => setShowMdp(s => ({ ...s, nouveau: !s.nouveau }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showMdp.nouveau ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input required type={showMdp.confirm ? 'text' : 'password'} value={mdpForm.confirm_mdp} onChange={e => setMdpForm({ ...mdpForm, confirm_mdp: e.target.value })} className="input-focus" style={{...inputStyle, paddingRight: 48}} />
                  <button type="button" onClick={() => setShowMdp(s => ({ ...s, confirm: !s.confirm }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showMdp.confirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {mdpForm.confirm_mdp && mdpForm.nouveau_mdp !== mdpForm.confirm_mdp && (
                  <div style={{ fontSize: 12, color: '#FF3B30', marginTop: 8, fontWeight: 600 }}>Les mots de passe ne correspondent pas.</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="submit" disabled={savingMdp} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 24px', borderRadius: 9999, border: 'none', background: '#FF3B30', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: savingMdp ? 0.7 : 1, transition: 'background 150ms' }} onMouseEnter={e => e.currentTarget.style.background = '#d72b22'} onMouseLeave={e => e.currentTarget.style.background = '#FF3B30'}>
                  {savingMdp ? <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>key</span>}
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
