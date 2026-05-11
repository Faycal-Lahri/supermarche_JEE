import { useState, useEffect } from 'react';
import { adminUserApi } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Dropdown, Pagination, FilterBar } from '../../components/AdminFilterBar';
import { useConfirm } from '../../components/ConfirmModal';

const PER_PAGE = 10;

// typeAdmin en BDD : 'super' | 'produits' | 'stock' | 'commandes' | 'clients'
const ROLES_CFG = {
  super:      { label: 'Super Administrateur', icon: 'admin_panel_settings', color: '#FF453A', bg: 'rgba(255,69,58,0.1)' },
  produits:   { label: 'Admin Produits',       icon: 'inventory_2',          color: '#BF5AF2', bg: 'rgba(191,90,242,0.1)' },
  stock:      { label: 'Admin Stock',          icon: 'warehouse',             color: '#32ADE6', bg: 'rgba(50,173,230,0.1)' },
  commandes:  { label: 'Admin Commandes',      icon: 'local_shipping',        color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)' },
  clients:    { label: 'Admin Clients',        icon: 'group',                 color: '#30D158', bg: 'rgba(48,209,88,0.1)' },
};

const ROLE_OPTIONS = Object.entries(ROLES_CFG)
  .filter(([k]) => k !== 'super') // ne pas créer de super admin via ce formulaire
  .map(([k, v]) => ({ value: k, label: v.label }));

// Lit le champ dans l'objet (snake_case ou camelCase)
const g = (o, s, c) => o?.[s] ?? o?.[c];

export default function SuperAdminPage() {
  const { success, error } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage]           = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null); // null = création, objet = édition
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ nom: '', prenom: '', email: '', password: '', type_admin: '' });

  const fetchAdmins = () => {
    setLoading(true);
    adminUserApi.getAllAdmins()
      .then(res => setAdmins(Array.isArray(res.data || res) ? (res.data || res) : []))
      .catch(() => error('Erreur chargement administrateurs'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchAdmins(); }, []);
  useEffect(() => { setPage(1); }, [filterRole]);

  const openCreate = () => {
    setEditAdmin(null);
    setForm({ nom: '', prenom: '', email: '', password: '', type_admin: '' });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditAdmin(a);
    const typeAdmin = g(a, 'type_admin', 'typeAdmin') || '';
    setForm({ nom: a.nom || '', prenom: a.prenom || '', email: a.email || '', password: '', type_admin: typeAdmin });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.type_admin) { error('Veuillez sélectionner un rôle'); return; }
    setSaving(true);
    try {
      if (editAdmin) {
        const idAdmin = g(editAdmin, 'id_administrateur', 'idAdministrateur');
        await adminUserApi.updateAdmin(idAdmin, { type_admin: form.type_admin });
        success('Rôle mis à jour');
      } else {
        await adminUserApi.createAdmin(form);
        success('Administrateur créé avec succès');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    const typeAdmin = g(a, 'type_admin', 'typeAdmin');
    if (typeAdmin === 'super') { error('Impossible de supprimer un Super Administrateur'); return; }
    const ok = await confirm({
      title: 'Révoquer les accès',
      message: `Voulez-vous vraiment supprimer le compte de ${a.prenom || ''} ${a.nom} ?`,
      confirmLabel: 'Oui, supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const idUtil = g(a, 'id_utilisateur', 'idUtilisateur');
      await adminUserApi.deleteAdmin(idUtil);
      success('Administrateur supprimé');
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Erreur suppression');
    }
  };

  const filtered = admins.filter(a => {
    if (!filterRole) return true;
    return (g(a, 'type_admin', 'typeAdmin') || '') === filterRole;
  });
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Header */}
        <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>Contrôle d'accès</h1>
            <p style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600 }}>Gestion des privilèges ({admins.length} administrateurs)</p>
          </div>
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 22px', background: '#1D1D1F', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span> Nouvel administrateur
          </button>
        </header>

        {/* Filtres */}
        <FilterBar resultCount={filtered.length} totalCount={admins.length} label="comptes admin">
          <Dropdown
            value={filterRole}
            onChange={setFilterRole}
            options={Object.entries(ROLES_CFG).map(([k, v]) => ({ value: k, label: v.label }))}
            placeholder="Filtrer par rôle"
            icon="admin_panel_settings"
          />
          {filterRole && (
            <button onClick={() => setFilterRole('')} style={{ background: 'transparent', border: 'none', color: '#FF453A', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span> Effacer
            </button>
          )}
        </FilterBar>

        {/* Table */}
        <div className="apple-card" style={{ padding: '0 0 20px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EDEDF2' }}>
                {['Identité', 'Rôle assigné', 'Création', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '14px 24px', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={4} style={{ padding: '14px 24px' }}><div style={{ height: 20, background: '#F5F5F7', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center', color: '#6E6E73' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 8, color: '#EDEDF2' }}>admin_panel_settings</span>
                  Aucun administrateur trouvé
                </td></tr>
              ) : paginated.map((a) => {
                const typeAdmin = g(a, 'type_admin', 'typeAdmin') || 'produits';
                const cfg       = ROLES_CFG[typeAdmin] || ROLES_CFG.produits;
                const isSuperAdmin = typeAdmin === 'super';
                const dateRaw   = g(a, 'date_creation', 'dateCreation');
                const idAdmin   = g(a, 'id_administrateur', 'idAdministrateur');

                return (
                  <tr key={idAdmin || a.email} style={{ borderBottom: '1px solid #EDEDF2', transition: 'background 200ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Identité */}
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: isSuperAdmin ? 'rgba(255,69,58,0.1)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: isSuperAdmin ? '#FF453A' : '#1D1D1F', flexShrink: 0 }}>
                          {(a.prenom?.[0] || '').toUpperCase()}{(a.nom?.[0] || '').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', marginBottom: 2 }}>
                            {a.prenom} {a.nom}
                            {isSuperAdmin && <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(255,69,58,0.1)', color: '#FF453A', padding: '2px 7px', borderRadius: 9999, fontWeight: 700 }}>SUPER</span>}
                          </div>
                          <div style={{ fontSize: 12, color: '#6E6E73', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>mail</span> {a.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Rôle */}
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </td>
                    {/* Date création */}
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#6E6E73' }}>
                      {dateRaw ? new Date(dateRaw).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        {/* Modifier le rôle */}
                        {!isSuperAdmin && (
                          <button onClick={() => openEdit(a)} title="Modifier le rôle" style={{ height: 34, padding: '0 12px', borderRadius: 9999, background: 'rgba(0,113,227,0.08)', border: 'none', color: '#0071E3', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span> Modifier
                          </button>
                        )}
                        {/* Supprimer */}
                        {!isSuperAdmin && (
                          <button onClick={() => handleDelete(a)} title="Supprimer" style={{ width: 34, height: 34, borderRadius: 9999, background: 'rgba(255,69,58,0.08)', border: 'none', color: '#FF453A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                          </button>
                        )}
                        {isSuperAdmin && (
                          <span style={{ fontSize: 12, color: '#8E8E93', fontStyle: 'italic' }}>Protégé</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* Modal Création / Édition */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && setShowModal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 480, boxShadow: '0 40px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

            {/* Header modal */}
            <div style={{ padding: '24px 32px', background: '#1D1D1F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                {editAdmin ? 'Modifier le rôle' : 'Nouvel administrateur'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Prénom + Nom (seulement à la création) */}
              {!editAdmin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[['prenom', 'Prénom'], ['nom', 'Nom']].map(([k, l]) => (
                    <div key={k}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</label>
                      <input required value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #EDEDF2', padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              )}
              {!editAdmin && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email (identifiant de connexion)</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #EDEDF2', padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mot de passe (min. 6 caractères)</label>
                    <input required type="password" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%', height: 44, borderRadius: 12, border: '1.5px solid #EDEDF2', padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </>
              )}

              {/* Rôle */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rôle / Privilèges</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ROLE_OPTIONS.map(opt => {
                    const cfg = ROLES_CFG[opt.value];
                    const sel = form.type_admin === opt.value;
                    return (
                      <button type="button" key={opt.value} onClick={() => setForm({ ...form, type_admin: opt.value })}
                        style={{ padding: '12px 14px', borderRadius: 14, border: `2px solid ${sel ? cfg.color : '#EDEDF2'}`, background: sel ? cfg.bg : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 200ms', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: sel ? cfg.color : '#8E8E93', fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: sel ? cfg.color : '#6E6E73' }}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: 46, borderRadius: 9999, background: '#F5F5F7', border: 'none', fontSize: 14, fontWeight: 600, color: '#1D1D1F', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={saving || !form.type_admin} style={{ flex: 2, height: 46, borderRadius: 9999, background: !form.type_admin ? '#EDEDF2' : '#1D1D1F', border: 'none', fontSize: 14, fontWeight: 700, color: !form.type_admin ? '#8E8E93' : '#fff', cursor: !form.type_admin ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving && <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>autorenew</span>}
                  {saving ? 'Enregistrement...' : (editAdmin ? 'Mettre à jour' : 'Créer l\'accès')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
