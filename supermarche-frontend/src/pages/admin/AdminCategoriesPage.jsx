import { useState, useEffect } from 'react';
import { adminCategoriesApi, uploadApi, getImageUrl } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { FilterBar, SearchInput, Dropdown, FormSelect } from '../../components/AdminFilterBar';
import { useConfirm } from '../../components/ConfirmModal';
export default function AdminCategoriesPage() {
  const { success, error } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({ nom_categorie: '', description: '', id_categorie_parent: '', image_categorie: '', image_file: null });

  // Filtering states
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('nom_asc');

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
    setForm({ nom_categorie: '', description: '', id_categorie_parent: '', image_categorie: '', image_file: null });
    setShowModal(true);
  };
  
  const openEdit = (c) => {
    setEditing(c);
    // Lire les deux formats snake_case ET camelCase (le backend peut retourner l'un ou l'autre)
    setForm({ 
      nom_categorie:      c.nom_categorie      || c.nomCategorie      || '',
      description:        c.description        || '',
      id_categorie_parent: String(c.id_categorie_parent || c.idCategorieParent || ''),
      image_categorie:    c.image_categorie    || c.imageCategorie    || '',
      image_file: null,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      let imageUrl = form.image_categorie;
      if (form.image_file) {
        try {
          const uploadRes = await uploadApi.uploadImage(form.image_file);
          const r = uploadRes?.data || uploadRes;
          imageUrl = r?.url || r?.fileName || r?.data?.url || r?.data?.fileName || imageUrl;
        } catch { /* upload optionnel */ }
      }
      const data = { 
        nom_categorie: form.nom_categorie,
        description: form.description,
        image_categorie: imageUrl || undefined,
      };
      if (form.id_categorie_parent) data.id_categorie_parent = parseInt(form.id_categorie_parent);
      
      if (editing) {
        const idCat = editing.id_categorie || editing.idCategorie;
        await adminCategoriesApi.update(idCat, data);
      } else {
        await adminCategoriesApi.create(data);
      }
      
      success(editing ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès');
      setShowModal(false); 
      fetchCats();
    } catch (err) { 
      error(err.message || 'Erreur lors de la sauvegarde'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (c) => {
    const idCat = c.id_categorie || c.idCategorie;
    const nomCat = c.nom_categorie || c.nomCategorie;
    const ok = await confirm({
      title: 'Supprimer la catégorie',
      message: `Voulez-vous vraiment supprimer "${nomCat}" ? Cette action est irréversible.`,
      confirmLabel: 'Oui, supprimer',
      cancelLabel: 'Annuler',
      variant: 'danger'
    });
    if (!ok) return;
    try {
      await adminCategoriesApi.delete(idCat);
      success('Catégorie supprimée');
      fetchCats();
    } catch (err) {
      error(err.message || "Erreur lors de la suppression");
    }
  };

  // Organiser la hiérarchie parent/enfant
  const f = (c) => c.id_categorie || c.idCategorie;
  const nom = (c) => c.nom_categorie || c.nomCategorie || '';
  const desc = (c) => c.description || '';
  const parents = categories.filter(c => !(c.id_categorie_parent || c.idCategorieParent));
  const getChildren = (parentId) => categories.filter(c => (c.id_categorie_parent || c.idCategorieParent) === parentId);

  // Filtrer et trier
  let displayParents = parents.filter(p => {
    const children = getChildren(f(p));
    const term = search.toLowerCase();
    const matchCat = c => nom(c).toLowerCase().includes(term) || desc(c).toLowerCase().includes(term);
    if (matchCat(p)) return true;
    if (children.some(matchCat)) return true;
    return false;
  });

  if (sortField === 'nom_asc') displayParents.sort((a,b) => nom(a).localeCompare(nom(b)));
  if (sortField === 'nom_desc') displayParents.sort((a,b) => nom(b).localeCompare(nom(a)));
  if (sortField === 'id_desc') displayParents.sort((a,b) => f(b) - f(a));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>Catégories</h1>
            <p style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600 }}>Organisation du catalogue ({categories.length} catégories totales)</p>
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 200ms', boxShadow: '0 4px 14px rgba(0,113,227,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#006EDB'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.transform = 'none'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span> Nouvelle catégorie
          </button>
        </header>

        <FilterBar resultCount={displayParents.length} totalCount={parents.length} label="groupes principaux">
          <SearchInput value={search} onChange={setSearch} placeholder="Chercher une catégorie..." />
          <Dropdown value={sortField} onChange={setSortField} icon="sort" placeholder="Trier par"
            options={[
              { value: 'nom_asc', label: 'Nom (A-Z)' },
              { value: 'nom_desc', label: 'Nom (Z-A)' },
              { value: 'id_desc', label: 'Plus récent' },
            ]}
          />
        </FilterBar>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ borderColor: '#0071E3', borderTopColor: 'transparent' }} /></div>
        ) : (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            {displayParents.map(parent => {
              const children = getChildren(f(parent));
              const imgSrc = getImageUrl(parent.image_categorie || parent.imageCategorie);
              return (
                <div key={f(parent)} className="apple-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 20, borderBottom: children.length > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none', marginBottom: children.length > 0 ? 16 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Image catégorie */}
                      <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F5F5F7', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.04)' }}>
                        {imgSrc
                          ? <img src={imgSrc} alt={nom(parent)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#C7C7CC' }}>category</span>
                        }
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h3 style={{ fontSize: 19, fontWeight: 700, color: '#1D1D1F', margin: 0, letterSpacing: '-0.01em' }}>{nom(parent)}</h3>
                        {parent.description && <p style={{ fontSize: 13, color: '#6E6E73', margin: 0, lineHeight: 1.4, maxWidth: 280 }}>{parent.description}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ padding: '2px 8px', background: 'rgba(10,132,255,0.08)', color: '#0A84FF', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {children.length} sous-catégorie{children.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(parent)} style={{ width: 34, height: 34, borderRadius: 10, background: '#F5F5F7', color: '#0A84FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#E5E5EA'} onMouseLeave={e=>e.currentTarget.style.background='#F5F5F7'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                      </button>
                      <button onClick={() => handleDelete(parent)} style={{ width: 34, height: 34, borderRadius: 10, background: '#FFF0F0', color: '#FF453A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#FFE5E5'} onMouseLeave={e=>e.currentTarget.style.background='#FFF0F0'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </div>
                  
                  {children.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {children.map(child => {
                        const childImg = getImageUrl(child.image_categorie || child.imageCategorie);
                        return (
                          <div key={f(child)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#FAFAFC', borderRadius: 14, border: '1px solid rgba(0,0,0,0.02)', transition: 'background 200ms' }} onMouseEnter={e=>e.currentTarget.style.background='#F2F2F7'} onMouseLeave={e=>e.currentTarget.style.background='#FAFAFC'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.04)' }}>
                                {childImg
                                  ? <img src={childImg} alt={nom(child)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#C7C7CC' }}>subdirectory_arrow_right</span>
                                }
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{nom(child)}</div>
                                {child.description && <div style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.3 }}>{child.description}</div>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, opacity: 0.8 }} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.8}>
                              <button onClick={() => openEdit(child)} style={{ width: 32, height: 32, background: 'transparent', border: 'none', color: '#0A84FF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }} onMouseEnter={e=>e.currentTarget.style.background='rgba(10,132,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                              </button>
                              <button onClick={() => handleDelete(child)} style={{ width: 32, height: 32, background: 'transparent', border: 'none', color: '#FF453A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,69,58,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Nom de la catégorie *</label>
                  <input required value={form.nom_categorie} onChange={e=>setForm({...form, nom_categorie:e.target.value})} className="apple-input" placeholder="Ex : Fruits & Légumes" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Catégorie Parente (Optionnel)</label>
                  <FormSelect value={form.id_categorie_parent} onChange={v=>setForm({...form, id_categorie_parent:v})} placeholder="Aucune (Catégorie principale)"
                    options={[
                      { value: '', label: 'Aucune (Catégorie principale)' },
                      ...parents.filter(p => f(p) !== (editing ? f(editing) : -1)).map(p => ({ value: String(f(p)), label: nom(p) }))
                    ]}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Image (Fichier ou URL)</label>
                  {/* Upload fichier */}
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={e=>setForm({...form, image_file:e.target.files[0]})} className="apple-input" style={{ padding: '10px 14px' }} />
                  <div style={{ marginTop: 8 }}>
                    <input type="url" value={form.image_categorie} onChange={e=>setForm({...form, image_categorie:e.target.value, image_file:null})} className="apple-input" placeholder="Ou coller une URL d'image..." />
                  </div>
                  {/* Prévisualisation */}
                  {(form.image_categorie || form.image_file) && (
                    <div style={{ marginTop: 10, width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #EDEDF2' }}>
                      <img src={form.image_file ? URL.createObjectURL(form.image_file) : getImageUrl(form.image_categorie)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e=>e.target.style.display='none'} />
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Description</label>
                  <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="apple-input" placeholder="Description optionnelle..." style={{ height: 80, paddingTop: 12, resize: 'none' }} />
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
