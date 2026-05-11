import { useState, useEffect } from 'react';
import { adminCategoriesApi } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { useConfirm } from '../../components/ConfirmModal';

export default function AdminCategoriesPage() {
  const { success, error } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({ nom_categorie: '', description: '', id_categorie_parent: '' });

  const fetchCats = () => {
    setLoading(true);
    adminCategoriesApi.getAll()
      .then(res => setCategories(Array.isArray(res.data || res) ? (res.data || res) : []))
      .catch(() => error('Erreur de chargement des catégories'))
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { fetchCats(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ nom_categorie: '', description: '', id_categorie_parent: '' });
    setShowModal(true);
  };
  
  const openEdit = (c) => {
    setEditing(c);
    setForm({ 
      nom_categorie: c.nomCategorie || '', 
      description: c.description || '', 
      id_categorie_parent: c.idCategorieParent || '' 
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.id_categorie_parent) delete data.id_categorie_parent;
      else data.id_categorie_parent = parseInt(data.id_categorie_parent);
      
      if (editing) await adminCategoriesApi.update(editing.idCategorie, data);
      else await adminCategoriesApi.create(data);
      
      success(editing ? 'Catégorie modifiée' : 'Catégorie créée');
      setShowModal(false); 
      fetchCats();
    } catch (err) { 
      error(err.message || 'Erreur lors de la sauvegarde'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (c) => {
    const ok = await confirm({
      title: 'Supprimer la catégorie',
      message: `Voulez-vous vraiment supprimer la catégorie "${c.nomCategorie}" ? Cette action est irréversible.`,
      confirmLabel: 'Oui, supprimer',
      cancelLabel: 'Annuler',
      variant: 'danger'
    });
    if (!ok) return;
    try {
      await adminCategoriesApi.delete(c.idCategorie);
      success('Catégorie supprimée');
      fetchCats();
    } catch (err) {
      error(err.message || "Erreur lors de la suppression");
    }
  };

  // Organize parent/child relationship
  const parents = categories.filter(c => !(c.id_categorie_parent || c.idCategorieParent));
  const getChildren = (parentId) => categories.filter(c => (c.id_categorie_parent || c.idCategorieParent) === parentId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>Catégories</h1>
            <p style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600 }}>Organisation du catalogue ({categories.length} catégories)</p>
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 200ms', boxShadow: '0 4px 14px rgba(0,113,227,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#006EDB'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.transform = 'none'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span> Nouvelle catégorie
          </button>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ borderColor: '#0071E3', borderTopColor: 'transparent' }} /></div>
        ) : (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            {parents.map(parent => {
              const children = getChildren(parent.id_categorie || parent.idCategorie);
              return (
                <div key={parent.id_categorie || parent.idCategorie} className="apple-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1D1D1F', marginBottom: 4 }}>{parent.nom_categorie || parent.nomCategorie}</h3>
                      {parent.description && <p style={{ fontSize: 13, color: '#6E6E73' }}>{parent.description}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(parent)} style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F7', color: '#0A84FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                      </button>
                      <button onClick={() => handleDelete(parent)} style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F7', color: '#FF453A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </div>
                  
                  {children.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {children.map(child => (
                        <div key={child.id_categorie || child.idCategorie} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F5F5F7', borderRadius: 12 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{child.nom_categorie || child.nomCategorie}</div>
                            {child.description && <div style={{ fontSize: 12, color: '#8E8E93' }}>{child.description}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => openEdit(child)} style={{ background: 'transparent', border: 'none', color: '#0A84FF', cursor: 'pointer', display: 'flex', padding: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                            </button>
                            <button onClick={() => handleDelete(child)} style={{ background: 'transparent', border: 'none', color: '#FF453A', cursor: 'pointer', display: 'flex', padding: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 12, background: '#FAFAFC', borderRadius: 12, fontSize: 13, color: '#8E8E93', textAlign: 'center', fontStyle: 'italic' }}>
                      Aucune sous-catégorie
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', animation: 'fadeIn 200ms' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.2)', animation: 'slideUp 300ms cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #EDEDF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F' }}>{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F5F5F7', border: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6E6E73' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '24px 32px' }}>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Nom de la catégorie</label>
                  <input required value={form.nom_categorie} onChange={e=>setForm({...form, nom_categorie:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Catégorie Parente (Optionnel)</label>
                  <select value={form.id_categorie_parent} onChange={e=>setForm({...form, id_categorie_parent:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }}>
                    <option value="">Aucune (Catégorie principale)</option>
                    {parents.filter(p => p.idCategorie !== editing?.idCategorie).map(p => (
                      <option key={p.idCategorie} value={p.idCategorie}>{p.nomCategorie}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Description</label>
                  <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="apple-input" style={{ width: '100%', height: 80, background: '#F5F5F7', border: 'none', paddingTop: 12, resize: 'none' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: 44, borderRadius: 9999, background: '#F5F5F7', color: '#1D1D1F', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 1, height: 44, borderRadius: 9999, background: '#0071E3', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmDialog />
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
