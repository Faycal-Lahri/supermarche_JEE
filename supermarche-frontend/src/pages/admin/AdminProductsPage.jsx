import { useState, useEffect } from 'react';
import { adminProduitsApi, categoriesApi, uploadApi } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Dropdown, Pagination, SearchInput, FilterBar } from '../../components/AdminFilterBar';
import { useConfirm } from '../../components/ConfirmModal';

const PER_PAGE = 7;

export default function AdminProductsPage() {
  const { success, error } = useToast();
  const { confirm: cfm, ConfirmDialog } = useConfirm();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('nom');
  const [page, setPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nom_produit:'', description:'', prix:'', id_categorie:'', image_produit:'', image_file: null, actif:true, quantite_initiale:0, seuil_alerte:10 });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([adminProduitsApi.getAll(), categoriesApi.getAll()])
      .then(([pr, cr]) => {
        setProduits(Array.isArray(pr.data || pr) ? (pr.data || pr) : []);
        setCategories(Array.isArray(cr.data || cr) ? (cr.data || cr) : []);
      })
      .catch(() => error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ nom_produit:'', description:'', prix:'', id_categorie: categories[0]?.id_categorie || categories[0]?.idCategorie || '', image_produit:'', image_file: null, actif:true, quantite_initiale:0, seuil_alerte:10 });
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nom_produit: p.nom_produit || p.nomProduit || '',
      description: p.description || '',
      prix: p.prix || '',
      id_categorie: p.id_categorie || p.idCategorie || '',
      image_produit: p.image_produit || p.imageProduit || '',
      image_file: null,
      actif: p.actif !== false,
      quantite_initiale: 0,
      seuil_alerte: p.seuil_alerte || p.seuilAlerte || 10
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    setSaving(true);
    try {
      let finalImageUrl = form.image_produit;
      if (form.image_file) {
        const uploadRes = await uploadApi.uploadImage(form.image_file);
        if (uploadRes?.data?.data?.fileName) {
          finalImageUrl = uploadRes.data.data.fileName;
        }
      }

      const data = { ...form, prix: parseFloat(form.prix), id_categorie: parseInt(form.id_categorie), image_produit: finalImageUrl };
      delete data.image_file;

      if (editing) await adminProduitsApi.update(editing.id_produit || editing.idProduit, data);
      else await adminProduitsApi.create(data);
      success(editing ? 'Produit modifié avec succès' : 'Produit ajouté avec succès');
      setShowModal(false); 
      fetchAll();
    } catch (err) { 
      error(err.message || 'Erreur lors de la sauvegarde'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (p) => {
    const ok = await cfm({ 
      title: 'Désactiver le produit', 
      message: `Voulez-vous vraiment désactiver "${p.nom_produit || p.nomProduit}" ? Il n'apparaîtra plus dans le catalogue client.`, 
      confirmLabel: 'Oui, désactiver', 
      cancelLabel: 'Annuler', 
      variant: 'warning' 
    });
    if (!ok) return;
    try { 
      await adminProduitsApi.delete(p.id_produit || p.idProduit); 
      success('Produit désactivé'); 
      fetchAll(); 
    } catch (err) { 
      error(err.message); 
    }
  };

  const filtered = produits
    .filter(p => ((p.nom_produit||p.nomProduit||'')).toLowerCase().includes(search.toLowerCase()))
    .filter(p => !filterCat || String(p.id_categorie || p.idCategorie) === filterCat)
    .filter(p => filterStatus === '' ? true : filterStatus === 'actif' ? p.actif!==false : p.actif===false)
    .sort((a, b) => {
      if (sortField === 'prix_asc')   return (a.prix||0) - (b.prix||0);
      if (sortField === 'prix_desc')  return (b.prix||0) - (a.prix||0);
      if (sortField === 'stock_asc')  return (a.quantite_disponible||a.quantiteDisponible||0) - (b.quantite_disponible||b.quantiteDisponible||0);
      if (sortField === 'stock_desc') return (b.quantite_disponible||b.quantiteDisponible||0) - (a.quantite_disponible||a.quantiteDisponible||0);
      return ((a.nom_produit||a.nomProduit||'')).localeCompare((b.nom_produit||b.nomProduit||''));
    });

  useEffect(() => setPage(1), [search, filterCat, filterStatus, sortField]);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7', fontFamily: 'var(--font-sf)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.03em', marginBottom: 4 }}>Produits</h1>
            <p style={{ fontSize: 13, color: '#6E6E73', fontWeight: 600 }}>Gérez votre catalogue ({produits.length} produits)</p>
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', background: '#0071E3', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 200ms', boxShadow: '0 4px 14px rgba(0,113,227,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#006EDB'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0071E3'; e.currentTarget.style.transform = 'none'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span> Nouveau produit
          </button>
        </header>

        <FilterBar resultCount={filtered.length} totalCount={produits.length} label="produits">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un produit..." />
          <Dropdown value={filterCat} onChange={setFilterCat} options={categories.map(c => ({ value: String(c.id_categorie || c.idCategorie), label: c.nom_categorie || c.nomCategorie }))} placeholder="Catégorie" icon="category" />
          <Dropdown value={filterStatus} onChange={setFilterStatus} options={[{value:'actif',label:'✓ Actifs'},{value:'inactif',label:'○ Inactifs'}]} placeholder="Statut" icon="visibility" />
          <Dropdown value={sortField} onChange={setSortField} options={[ {value:'nom',label:'Nom A→Z'}, {value:'prix_asc',label:'Prix ↑'}, {value:'prix_desc',label:'Prix ↓'}, {value:'stock_asc',label:'Stock ↑'}, {value:'stock_desc',label:'Stock ↓'} ]} placeholder="Trier par" icon="sort" />
          
          {(search || filterCat || filterStatus || sortField !== 'nom') && (
            <button onClick={() => { setSearch(''); setFilterCat(''); setFilterStatus(''); setSortField('nom'); }} style={{ background: 'transparent', border: 'none', color: '#FF453A', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span> Effacer
            </button>
          )}
        </FilterBar>

        <div className="apple-card" style={{ padding: '0 0 24px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EDEDF2' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', width: 60 }}>Img</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(PER_PAGE)].map((_, i) => (
                <tr key={i}><td colSpan={6} style={{ padding: '16px 24px' }}><div style={{ height: 20, background: '#F5F5F7', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td></tr>
              )) : paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center', color: '#6E6E73', fontSize: 15 }}>Aucun produit trouvé</td></tr>
              ) : paginated.map((p) => {
                const stock = p.quantite_disponible || p.quantiteDisponible || 0;
                const seuil = p.seuil_alerte || p.seuilAlerte || 10;
                const stockColor = stock === 0 ? '#FF453A' : stock <= seuil ? '#FF9F0A' : '#30D158';
                
                return (
                  <tr key={p.id_produit || p.idProduit} style={{ borderBottom: '1px solid #EDEDF2', transition: 'background 200ms', opacity: p.actif===false ? 0.6 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F5F5F7', overflow: 'hidden' }}>
                        <img src={p.image_produit || p.imageProduit || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{p.nom_produit || p.nomProduit}</div>
                      {p.actif === false && <span style={{ fontSize: 11, color: '#FF453A', fontWeight: 600 }}>Désactivé</span>}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 14, color: '#6E6E73' }}>{p.nom_categorie || p.nomCategorie}</td>
                    <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{Number(p.prix||0).toFixed(2)} €</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1D1D1F' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: stockColor }} />
                        {stock}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <button onClick={() => openEdit(p)} style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F7', color: '#0A84FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Modifier">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                        </button>
                        {p.actif !== false && (
                          <button onClick={() => handleDelete(p)} style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F7', color: '#FF453A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Désactiver">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility_off</span>
                          </button>
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
      
      {/* MODAL FORM */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', animation: 'fadeIn 200ms' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 24, width: '100%', maxWidth: 500, boxShadow: '0 24px 48px rgba(0,0,0,0.2)', animation: 'slideUp 300ms cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #EDEDF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F' }}>{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F5F5F7', border: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6E6E73' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '24px 32px' }}>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Nom du produit</label>
                  <input required value={form.nom_produit} onChange={e=>setForm({...form, nom_produit:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Prix (€)</label>
                    <input required type="number" step="0.01" min="0" value={form.prix} onChange={e=>setForm({...form, prix:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Catégorie</label>
                    <select required value={form.id_categorie} onChange={e=>setForm({...form, id_categorie:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }}>
                      <option value="">Sélectionner</option>
                      {categories.map(c => <option key={c.id_categorie || c.idCategorie} value={c.id_categorie || c.idCategorie}>{c.nom_categorie || c.nomCategorie}</option>)}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Image (Fichier)</label>
                  <input type="file" accept=".png, .jpg, .jpeg" onChange={e=>setForm({...form, image_file:e.target.files[0]})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none', padding: '10px 14px' }} />
                  {form.image_produit && !form.image_file && <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>Image actuelle : {form.image_produit}</div>}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Description</label>
                  <textarea required value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="apple-input" style={{ width: '100%', height: 80, background: '#F5F5F7', border: 'none', paddingTop: 12, resize: 'none' }} />
                </div>
                
                {!editing && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Stock initial</label>
                      <input required type="number" min="0" value={form.quantite_initiale} onChange={e=>setForm({...form, quantite_initiale:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 8 }}>Seuil alerte</label>
                      <input required type="number" min="1" value={form.seuil_alerte} onChange={e=>setForm({...form, seuil_alerte:e.target.value})} className="apple-input" style={{ width: '100%', background: '#F5F5F7', border: 'none' }} />
                    </div>
                  </div>
                )}
                
                {editing && (
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.actif} onChange={e=>setForm({...form, actif:e.target.checked})} style={{ width: 18, height: 18, accentColor: '#0071E3' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#1D1D1F' }}>Produit actif (visible)</span>
                    </label>
                  </div>
                )}
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
