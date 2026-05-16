import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

// Normalise les données utilisateur renvoyées par le backend
// Le backend retourne role='admin' + type_admin='produits'|'stock'|'super'
// On mappe cela vers les rôles précis attendus par le frontend
function normalizeUser(raw) {
  if (!raw) return null;
  const u = { ...raw };
  // Mapper role + type_admin → rôle frontend unifié
  if (u.role === 'admin' || u.role === 'administrateur') {
    const t = u.type_admin || u.typeAdmin || '';
    if (t === 'super')    u.role = 'super_admin';
    else if (t === 'produits') u.role = 'admin_produits';
    else if (t === 'stock')    u.role = 'admin_stock';
    else u.role = 'admin_produits'; // fallback
  }
  // Alias typeAdmin pour les composants qui l'utilisent
  if (!u.typeAdmin && u.type_admin) u.typeAdmin = u.type_admin;
  return u;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    authApi.me()
      .then(json => setUser(normalizeUser(json.data || null)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const json = await authApi.connexion(credentials);
    const normalized = normalizeUser(json.data);
    setUser(normalized);
    return normalized;
  }, []);

  const register = useCallback(async (data) => {
    // data peut contenir 'password' (depuis RegisterPage) ou 'mot_de_passe'
    const mdp = data.mot_de_passe || data.password;
    // Normaliser pour le backend qui attend 'mot_de_passe'
    const payload = { ...data, mot_de_passe: mdp };
    delete payload.password;
    await authApi.inscription(payload);
    // Auto-connexion après inscription réussie
    try {
      const json = await authApi.connexion({ email: data.email, mot_de_passe: mdp });
      const normalized = normalizeUser(json.data);
      setUser(normalized);
      return normalized;
    } catch {
      // Si auto-connexion échoue, l'utilisateur sera redirigé vers /login de toute façon
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.deconnexion().catch(() => {});
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  const isAdmin = user && ['admin_produits','admin_stock','super_admin'].includes(user.role);
  const isSuperAdmin = user?.role === 'super_admin';
  const isClient = user?.role === 'client';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isSuperAdmin, isClient, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
