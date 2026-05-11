import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    authApi.me()
      .then(json => setUser(json.data || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const json = await authApi.connexion(credentials);
    setUser(json.data);
    return json.data;
  }, []);

  const register = useCallback(async (data) => {
    await authApi.inscription(data);
    const json = await authApi.connexion({ email: data.email, mot_de_passe: data.mot_de_passe });
    setUser(json.data);
    return json.data;
  }, []);

  const logout = useCallback(async () => {
    await authApi.deconnexion().catch(() => {});
    setUser(null);
  }, []);

  const isAdmin = user && ['admin_produits','admin_stock','super_admin'].includes(user.role);
  const isSuperAdmin = user?.role === 'super_admin';
  const isClient = user?.role === 'client';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isSuperAdmin, isClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
