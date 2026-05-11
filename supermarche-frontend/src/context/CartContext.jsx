import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { panierApi, promotionsPublicApi } from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoMap, setPromoMap] = useState(new Map()); // idProduit → { prix_promo, pourcentage, ... }
  const syncing = useRef(false);

  // Charger les promotions actives une fois
  useEffect(() => {
    promotionsPublicApi.getProduits()
      .then(r => {
        const promos = r.data || r || [];
        if (Array.isArray(promos)) {
          setPromoMap(new Map(promos.map(p => [p.id_produit || p.idProduit, p])));
        }
      }).catch(() => {});
  }, []);

  // Fetch silencieux (sans activer loading = pas de clignotement)
  const syncCart = useCallback(async () => {
    if (!user || user.role !== 'client') { setItems([]); return; }
    if (syncing.current) return;
    syncing.current = true;
    try {
      const json = await panierApi.get();
      setItems(json.data?.produits || json.data?.lignes || []);
    } catch { /* silence */ }
    finally { syncing.current = false; }
  }, [user]);

  // Premier chargement (avec loader)
  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'client') { setItems([]); return; }
    setLoading(true);
    try {
      const json = await panierApi.get();
      setItems(json.data?.produits || json.data?.lignes || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // Mise à jour optimiste : UI immédiate + sync silencieuse
  const addToCart = async (id_produit, quantite = 1) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour ajouter au panier.');
    }
    const numId = Number(id_produit);
    // Update optimiste
    setItems(prev => {
      const exists = prev.find(i => (i.id_produit || i.idProduit) === numId);
      if (exists) return prev.map(i => (i.id_produit || i.idProduit) === numId ? { ...i, quantite: i.quantite + quantite } : i);
      return [...prev, { id_produit: numId, quantite, prix_unitaire_snapshot: 0 }];
    });
    try {
      await panierApi.ajouter({ id_produit: numId, quantite });
      syncCart(); // sync silencieuse pour corriger les prix/noms
    } catch (e) {
      syncCart(); // rollback optimiste
      throw e;
    }
  };

  const updateQty = async (id_produit, quantite) => {
    if (quantite <= 0) return removeFromCart(id_produit);
    setItems(prev => prev.map(i => (i.id_produit || i.idProduit) === id_produit ? { ...i, quantite } : i));
    await panierApi.modifier({ id_produit, quantite });
    syncCart();
  };

  const removeFromCart = async (id_produit) => {
    setItems(prev => prev.filter(i => (i.id_produit || i.idProduit) !== id_produit));
    await panierApi.supprimer({ id_produit });
    syncCart();
  };

  const clearCart = () => setItems([]);

  /**
   * Pour chaque article, le prix effectif = le MINIMUM entre :
   * - le snapshot sauvegardé en base
   * - le prix_promo actuel si une promo existe (au cas où l'article
   *   aurait été ajouté avant la promo)
   */
  const getEffectivePrix = useCallback((item) => {
    const pid = item.id_produit || item.idProduit;
    const snapshot = parseFloat(item.prix_unitaire_snapshot || item.prixUnitaireSnapshot || 0);
    const promo = promoMap.get(pid);
    if (promo) {
      const prixPromo = parseFloat(promo.prix_promo || 0);
      if (prixPromo > 0 && prixPromo < snapshot) return prixPromo;
    }
    return snapshot;
  }, [promoMap]);

  // Total = somme des prix effectifs (promo appliquée si dispo)
  const total = items.reduce((sum, i) => sum + getEffectivePrix(i) * i.quantite, 0);
  const count = items.reduce((sum, i) => sum + i.quantite, 0);

  return (
    <CartContext.Provider value={{ items, loading, total, count, promoMap, getEffectivePrix, addToCart, updateQty, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
