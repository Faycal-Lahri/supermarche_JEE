import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import ClientOrdersPage from './ClientOrdersPage';
import { clientApi, profilApi } from '../api/api';

const TABS = [
  { key: 'infos',     icon: 'person',        label: 'Mes informations' },
  { key: 'adresse',   icon: 'location_on',   label: 'Adresse de livraison' },
  { key: 'securite',  icon: 'lock',          label: 'Sécurité' },
  { key: 'commandes', icon: 'receipt_long',  label: 'Mes commandes' },
];

export default function ProfilePage({ defaultTab = 'infos' }) {
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', adresse: '', ville: '', code_postal: ''
  });
  const [adresseForm, setAdresseForm] = useState({ adresse: '', ville: '', code_postal: '' });
  const [savingAdresse, setSavingAdresse] = useState(false);

  // ── Sécurité ──
  const [mdpForm, setMdpForm] = useState({ ancien_mdp: '', nouveau_mdp: '', confirm_mdp: '' });
  const [savingMdp, setSavingMdp] = useState(false);
  const [showMdp, setShowMdp] = useState({ ancien: false, nouveau: false, confirm: false });

  useEffect(() => {
    if (!user) navigate('/login');
    else {
      setForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        ville: user.ville || '',
        code_postal: user.code_postal || ''
      });
      setAdresseForm({
        adresse: user.adresse || '',
        ville: user.ville || '',
        code_postal: user.code_postal || ''
      });
    }
  }, [user, navigate]);

  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profilApi.modifier(form);
      success('Profil mis à jour avec succès.');
      setIsEditing(false);
    } catch (err) {
      error(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdresse = async (e) => {
    e.preventDefault();
    setSavingAdresse(true);
    try {
      await profilApi.modifier(adresseForm);
      success('Adresse mise à jour avec succès.');
    } catch (err) {
      error(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSavingAdresse(false);
    }
  };

  const handleChangeMdp = async (e) => {
    e.preventDefault();
    if (mdpForm.nouveau_mdp !== mdpForm.confirm_mdp) return error('Les mots de passe ne correspondent pas');
    if (mdpForm.nouveau_mdp.length < 6) return error('Minimum 6 caractères');
    setSavingMdp(true);
    try {
      await profilApi.mdp({ ancien_mdp: mdpForm.ancien_mdp, nouveau_mdp: mdpForm.nouveau_mdp });
      success('Mot de passe modifié. Reconnectez-vous dans 2 secondes...');
      setMdpForm({ ancien_mdp: '', nouveau_mdp: '', confirm_mdp: '' });
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err) {
      error(err.message || 'Mot de passe actuel incorrect');
    } finally {
      setSavingMdp(false);
    }
  };

  // Indicateur force du mot de passe
  const strength = !mdpForm.nouveau_mdp ? 0
    : mdpForm.nouveau_mdp.length < 6 ? 1
    : /[A-Z]/.test(mdpForm.nouveau_mdp) && /[0-9]/.test(mdpForm.nouveau_mdp) ? 3
    : 2;
  const strengthConfig = {
    0: { label: '', color: '#EDEDF2', width: '0%' },
    1: { label: 'Faible', color: '#FF453A', width: '33%' },
    2: { label: 'Moyen', color: '#FF9F0A', width: '66%' },
    3: { label: 'Fort', color: '#30D158', width: '100%' }
  }[strength];

  if (!user) return null;

  const fieldStyle = { width: '100%', background: '#F5F5F7', border: 'none' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const readonlyStyle = { fontSize: 16, color: '#1D1D1F', fontWeight: 500, padding: '12px 16px', background: '#F5F5F7', borderRadius: 12 };

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-sf)' }}>
      <ClientNavbar />
      <div className="apple-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'flex-start' }}>
          
          {/* ── SIDEBAR ── */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', position: 'sticky', top: 90 }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 80, height: 80, borderRadius: 40, background: 'linear-gradient(135deg, #0071E3, #34AADC)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(0,113,227,0.25)' }}>
                {(user.prenom?.[0] || '').toUpperCase()}{(user.nom?.[0] || '').toUpperCase()}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F' }}>{user.prenom} {user.nom}</div>
              <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 2 }}>{user.email}</div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: 14, border: 'none',
                    background: tab === t.key ? 'rgba(0,113,227,0.1)' : 'transparent',
                    color: tab === t.key ? '#0071E3' : '#1D1D1F',
                    fontSize: 14, fontWeight: tab === t.key ? 700 : 500,
                    cursor: 'pointer', transition: 'all 200ms',
                    display: 'flex', alignItems: 'center', gap: 12
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: tab === t.key ? "'FILL' 1" : "'FILL' 0" }}>
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
            
            <div style={{ height: 1, background: '#EDEDF2', margin: '20px 0' }} />
            
            <button
              onClick={() => { logout(); success('Déconnexion réussie'); navigate('/'); }}
              style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 14, border: 'none', background: 'rgba(255,69,58,0.08)', color: '#FF453A', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 200ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,69,58,0.08)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span> Déconnexion
            </button>
          </div>

          {/* ── CONTENU ── */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', minHeight: 500 }}>
            
            {/* ══ ONGLET INFOS ══ */}
            {tab === 'infos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', margin: 0 }}>Informations personnelles</h2>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 16px', borderRadius: 9999, border: 'none', background: '#F5F5F7', color: '#1D1D1F', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span> Modifier
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 16px', borderRadius: 9999, border: 'none', background: 'rgba(255,69,58,0.1)', color: '#FF453A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Annuler
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div><label style={labelStyle}>Prénom</label><input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} className="apple-input" style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Nom</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="apple-input" style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Email</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="apple-input" style={fieldStyle} /></div>
                      <div><label style={labelStyle}>Téléphone</label><input type="tel" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="apple-input" style={fieldStyle} /></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 24px', borderRadius: 9999, border: 'none', background: '#0071E3', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>}
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div><label style={labelStyle}>Prénom</label><div style={readonlyStyle}>{user.prenom}</div></div>
                    <div><label style={labelStyle}>Nom</label><div style={readonlyStyle}>{user.nom}</div></div>
                    <div><label style={labelStyle}>Email</label><div style={readonlyStyle}>{user.email}</div></div>
                    <div><label style={labelStyle}>Téléphone</label><div style={readonlyStyle}>{user.telephone || 'Non renseigné'}</div></div>
                  </div>
                )}
              </div>
            )}

            {/* ══ ONGLET ADRESSE ══ */}
            {tab === 'adresse' && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 32 }}>Adresse de livraison</h2>
                <form onSubmit={handleSaveAdresse} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={labelStyle}>Adresse complète</label>
                    <input value={adresseForm.adresse} onChange={e => setAdresseForm({ ...adresseForm, adresse: e.target.value })} className="apple-input" style={fieldStyle} placeholder="N° et rue" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <label style={labelStyle}>Ville</label>
                      <input value={adresseForm.ville} onChange={e => setAdresseForm({ ...adresseForm, ville: e.target.value })} className="apple-input" style={fieldStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Code Postal</label>
                      <input value={adresseForm.code_postal} onChange={e => setAdresseForm({ ...adresseForm, code_postal: e.target.value })} className="apple-input" style={fieldStyle} />
                    </div>
                  </div>

                  {/* Carte aperçu adresse */}
                  {adresseForm.adresse && (
                    <div style={{ padding: 20, background: '#F5F5F7', borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span className="material-symbols-outlined" style={{ color: '#0071E3', fontSize: 24, marginTop: 2 }}>location_on</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{adresseForm.adresse}</div>
                        <div style={{ fontSize: 14, color: '#6E6E73' }}>{adresseForm.code_postal} {adresseForm.ville}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={savingAdresse} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 24px', borderRadius: 9999, border: 'none', background: '#0071E3', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: savingAdresse ? 0.7 : 1 }}>
                      {savingAdresse ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>}
                      Enregistrer l'adresse
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ══ ONGLET SÉCURITÉ ══ */}
            {tab === 'securite' && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 32 }}>Sécurité</h2>
                
                <div style={{ background: '#F5F5F7', borderRadius: 20, padding: 32, marginBottom: 32 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', marginBottom: 24 }}>Changer le mot de passe</h3>
                  <form onSubmit={handleChangeMdp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    {/* Mot de passe actuel */}
                    <div>
                      <label style={labelStyle}>Mot de passe actuel</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          required
                          type={showMdp.ancien ? 'text' : 'password'}
                          value={mdpForm.ancien_mdp}
                          onChange={e => setMdpForm({ ...mdpForm, ancien_mdp: e.target.value })}
                          className="apple-input"
                          style={{ width: '100%', background: '#fff', border: 'none', paddingRight: 48 }}
                        />
                        <button type="button" onClick={() => setShowMdp(s => ({ ...s, ancien: !s.ancien }))}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showMdp.ancien ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Nouveau mot de passe */}
                    <div>
                      <label style={labelStyle}>Nouveau mot de passe</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          required
                          type={showMdp.nouveau ? 'text' : 'password'}
                          value={mdpForm.nouveau_mdp}
                          onChange={e => setMdpForm({ ...mdpForm, nouveau_mdp: e.target.value })}
                          className="apple-input"
                          style={{ width: '100%', background: '#fff', border: 'none', paddingRight: 48 }}
                        />
                        <button type="button" onClick={() => setShowMdp(s => ({ ...s, nouveau: !s.nouveau }))}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showMdp.nouveau ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                      {/* Indicateur force */}
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 4, background: '#EDEDF2', borderRadius: 9999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: strengthConfig.width, background: strengthConfig.color, transition: 'all 400ms', borderRadius: 9999 }} />
                        </div>
                        {strength > 0 && (
                          <div style={{ fontSize: 11, color: strengthConfig.color, marginTop: 4, fontWeight: 600 }}>
                            {strengthConfig.label}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirmer */}
                    <div>
                      <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          required
                          type={showMdp.confirm ? 'text' : 'password'}
                          value={mdpForm.confirm_mdp}
                          onChange={e => setMdpForm({ ...mdpForm, confirm_mdp: e.target.value })}
                          className="apple-input"
                          style={{ width: '100%', background: '#fff', border: 'none', paddingRight: 48 }}
                        />
                        <button type="button" onClick={() => setShowMdp(s => ({ ...s, confirm: !s.confirm }))}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showMdp.confirm ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                      {mdpForm.confirm_mdp && mdpForm.nouveau_mdp !== mdpForm.confirm_mdp && (
                        <div style={{ fontSize: 12, color: '#FF453A', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" disabled={savingMdp} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 24px', borderRadius: 9999, border: 'none', background: '#0071E3', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: savingMdp ? 0.7 : 1 }}>
                        {savingMdp ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </form>
                </div>

                {/* Zone danger */}
                <div style={{ marginTop: 24, padding: 24, background: 'rgba(255,69,58,0.05)', border: '1px solid rgba(255,69,58,0.15)', borderRadius: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FF453A', marginBottom: 8 }}>Zone de danger</h3>
                  <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 16 }}>
                    La suppression de votre compte est irréversible. Toutes vos données seront effacées.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer définitivement votre compte ?')) {
                        profilApi.supprimer()
                          .then(() => { logout(); navigate('/'); })
                          .catch(() => error('Erreur lors de la suppression'));
                      }
                    }}
                    style={{ height: 40, padding: '0 20px', borderRadius: 9999, background: 'transparent', border: '1.5px solid #FF453A', color: '#FF453A', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 200ms' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FF453A'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF453A'; }}
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}

            {/* ══ ONGLET COMMANDES ══ */}
            {tab === 'commandes' && <ClientOrdersPage />}
          </div>
        </div>
      </div>
    </div>
  );
}
