const BASE_URL = '/supermarche-jee/api';

const request = async (method, url, data = null) => {
  const options = {
    method,
    credentials: 'include',
    headers: {},
  };
  if (data) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }
  const res = await fetch(`${BASE_URL}${url}`, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
  return json;
};

export const api = {
  get:    (url)       => request('GET',    url),
  post:   (url, data) => request('POST',   url, data),
  put:    (url, data) => request('PUT',    url, data),
  delete: (url)       => request('DELETE', url),
};

/* ── Auth ── */
export const authApi = {
  inscription:  (data) => api.post('/auth/inscription', data),
  connexion:    (data) => api.post('/auth/connexion', data),
  deconnexion:  ()     => api.post('/auth/deconnexion'),
  me:           ()     => api.get('/auth/me'),
};

/* ── Produits ── */
export const produitsApi = {
  getAll:        (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/produits${q ? '?' + q : ''}`);
  },
  getById:       (id)  => api.get(`/produits/${id}`),
};

/* ── Catégories ── */
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

/* ── Panier ── */
export const panierApi = {
  get:       ()           => api.get('/panier'),
  ajouter:   (data)       => api.post('/panier/ajouter', data),
  modifier:  (data)       => api.put('/panier/modifier', data),
  supprimer: (data)       => api.post('/panier/supprimer', data), // POST with body — DELETE+body unreliable
};

/* ── Produits avec sous-catégories ── */
export const produitsParCategorie = async (idCategorie, toutes) => {
  // Si on a les sous-cats, chercher aussi en elles
  const subIds = toutes
    ? toutes.filter(c => (c.id_categorie_parent || c.idCategorieParent) === idCategorie).map(c => c.id_categorie || c.idCategorie)
    : [];
  if (subIds.length > 0) {
    // fetch all and filter client-side
    const all = await request('GET', `/produits`);
    const data = all.data || all || [];
    return data.filter(p => {
      const cat = p.id_categorie || p.idCategorie;
      return cat === idCategorie || subIds.includes(cat);
    });
  }
  const r = await request('GET', `/produits?categorie=${idCategorie}`);
  return r.data || r || [];
};

/* ── Commandes client ── */
export const commandeApi = {
  passer:      (data) => api.post('/commandes/passer', data),
  historique:  ()     => api.get('/commandes/historique'),
  getById:     (id)   => api.get(`/commandes/${id}`),
};

// Alias used in new pages
export const commandesApi = {
  create:      (data) => api.post('/commandes/passer', data),
  getAll:      ()     => api.get('/commandes/historique'),
  getById:     (id)   => api.get(`/commandes/${id}`),
};

/* ── Profil ── */
export const profilApi = {
  get:        ()     => api.get('/profil'),
  modifier:   (data) => api.put('/profil/modifier', data),
  mdp:        (data) => api.put('/profil/mdp', data),
  supprimer:  ()     => api.delete('/profil/supprimer'),
};

// Alias used in new pages
export const clientApi = {
  getProfil:          ()         => api.get('/profil'),
  updateProfil:       (data)     => api.put('/profil/modifier', data),
  getCommandes:       ()         => api.get('/commandes/historique'),
  annulerCommande:    (id, data) => api.put(`/commandes/${id}/annuler`, data),
};

/* ── Admin Produits ── */
export const adminProduitsApi = {
  getAll:   ()           => api.get('/admin/produits'),
  create:   (data)       => api.post('/admin/produits', data),
  update:   (id, data)   => api.put(`/admin/produits/${id}`, data),
  delete:   (id)         => api.delete(`/admin/produits/${id}`),
};

/* ── Admin Catégories ── */
export const adminCategoriesApi = {
  getAll:  ()         => api.get('/admin/categories'),
  create:  (data)     => api.post('/admin/categories', data),
  update:  (id, data) => api.put(`/admin/categories/${id}`, data),
  delete:  (id)       => api.delete(`/admin/categories/${id}`),
};

/* ── Admin Stock ── */
export const adminStockApi = {
  getDashboard:       ()         => api.get('/admin/stock'),
  getAlertes:         ()         => api.get('/admin/stock/alertes'),
  getHistorique:      ()         => api.get('/admin/stock/historique'),
  reapprovisionner:   (data)     => api.put('/admin/stock/reapprovisionner', data),
  exportCsv:          ()         => api.get('/admin/stock/export'),
  getEtatStock:       ()         => api.get('/admin/stock'),
  // delta = quantité à AJOUTER (positive) ou RETIRER (négative)
  updateStock:        (id, delta) => api.put('/admin/stock/reapprovisionner', { id_produit: id, quantite_ajout: delta }),
};

/* ── Admin Commandes ── */
export const adminCommandesApi = {
  getAll:    (params = {})   => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== '' && v !== null))
    ).toString();
    return api.get(`/admin/commandes${q ? '?' + q : ''}`);
  },
  getById:   (id)            => api.get(`/admin/commandes/${id}`),
  statut:    (id, data)      => api.put(`/admin/commandes/${id}/statut`, data),
  updateStatut: (id, statut) => api.put(`/admin/commandes/${id}/statut`, { statut }),
  annuler:   (id, data)      => api.put(`/admin/commandes/${id}/annuler`, data),
  annulerCommande: (id)      => api.put(`/admin/commandes/${id}/annuler`, {}),
};

/* ── Admin Clients ── */
export const adminClientsApi = {
  getAll:         ()           => api.get('/admin/clients'),
  getById:        (id)         => api.get(`/admin/clients/${id}`),
  getCommandes:   (id)         => api.get(`/admin/clients/${id}/commandes`),
  statut:         (id, data)   => api.put(`/admin/clients/${id}/statut`, data),
  updateProfile:  (id, data)   => api.put(`/admin/clients/${id}/profil`, data),
  resetPassword:  (id, data)   => api.put(`/admin/clients/${id}/reset-password`, data),
  delete:         (id)         => api.delete(`/admin/clients/${id}`),
};

// Alias pour AdminClientsPage
export const adminClientApi = {
  getAll:         ()           => api.get('/admin/clients'),
  // statut = 'actif' | 'suspendu' — le backend attend la clé "statut" (string)
  updateStatus:   (id, statut) => api.put(`/admin/clients/${id}/statut`, { statut }),
  getCommandes:   (id)         => api.get(`/admin/clients/${id}/commandes`),
};

/* ── Super Admin ── */
export const superAdminApi = {
  dashboard:     ()         => api.get('/superadmin/dashboard'),
  getAdmins:     ()         => api.get('/superadmin/admins'),
  createAdmin:   (data)     => api.post('/superadmin/admins', data),
  updateRole:    (id, data) => api.put(`/superadmin/admins/${id}/role`, data),
  deleteAdmin:   (id)       => api.delete(`/superadmin/admins/${id}`),
};

// Alias pour SuperAdminPage
export const adminUserApi = {
  getAllAdmins:  ()           => api.get('/superadmin/admins'),
  createAdmin:  (data)        => api.post('/superadmin/admins', data),
  updateAdmin:  (id, data)    => api.put(`/superadmin/admins/${id}/role`, data),
  deleteAdmin:  (id)          => api.delete(`/superadmin/admins/${id}`),
};

// Alias pour Client Commandes
export const publicCommandesApi = {
  create:        (data) => api.post('/commandes/passer', data),
  getMesCommandes: ()     => api.get('/commandes/historique'),
  getById:       (id)   => api.get(`/commandes/${id}`),
};

/* ── Promotions (Admin) ── */
export const adminPromotionsApi = {
  getAll:      ()           => api.get('/admin/promotions'),
  getActives:  ()           => api.get('/admin/promotions/actives'),
  getProduits: ()           => api.get('/admin/promotions/produits'),
  create:      (data)       => api.post('/admin/promotions', data),
  update:      (id, data)   => api.put(`/admin/promotions/${id}`, data),
  toggle:      (id, data)   => api.put(`/admin/promotions/${id}/toggle`, data),
  delete:      (id)         => api.delete(`/admin/promotions/${id}`),
};

/* ── Codes Promo (Super Admin) ── */
export const adminCodesPromoApi = {
  getAll:  ()         => api.get('/admin/codes-promo'),
  create:  (data)     => api.post('/admin/codes-promo', data),
  toggle:  (id, data) => api.put(`/admin/codes-promo/${id}/toggle`, data),
  delete:  (id)       => api.delete(`/admin/codes-promo/${id}`),
};

/* ── Code Promo (Client) ── */
export const promoApi = {
  valider: (data) => api.post('/promo/valider', data),
};

/* ── Promotions publiques (Client — sans authentification requise) ── */
export const promotionsPublicApi = {
  getProduits: () => api.get('/promotions/produits'),
  getActives:  () => api.get('/promotions/actives'),
};

/* ── Upload ── */
export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(
      `${BASE_URL}/upload`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData
        // PAS de Content-Type → le browser gère automatiquement le boundary multipart
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Erreur upload');
    return json;
  }
};
