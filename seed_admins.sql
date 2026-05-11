-- ============================================================
-- SEED ADMINS — supermarche_jee
-- 
-- ⚠️  Le PasswordUtil supporte les mots de passe en TEXTE CLAIR
--     (fallback dev). Ces comptes fonctionneront immédiatement.
--
-- Comptes créés :
--   Email                   | Mot de passe    | Rôle
--   ----------------------- | --------------- | ----------------
--   super@epicerie.fr       | SuperAdmin2026! | super_admin
--   produits@epicerie.fr    | Produits2026!   | admin_produits
--   stock@epicerie.fr       | Stock2026!      | admin_stock
-- ============================================================

USE supermarche_jee;

-- ── 1. Super Administrateur ──────────────────────────────────
INSERT INTO utilisateur 
  (nom, prenom, email, mot_de_passe, telephone, role, statut)
VALUES 
  ('Martin', 'Sophie', 'super@epicerie.fr',
   'SuperAdmin2026!',
   '0600000001', 'super_admin', 'actif')
ON DUPLICATE KEY UPDATE
  nom = 'Martin', prenom = 'Sophie', role = 'super_admin', statut = 'actif';

SET @id_super = (SELECT id_utilisateur FROM utilisateur WHERE email = 'super@epicerie.fr' LIMIT 1);

INSERT INTO administrateur (id_utilisateur, type_admin) 
VALUES (@id_super, 'super')
ON DUPLICATE KEY UPDATE type_admin = 'super';

-- ── 2. Admin Produits & Catégories ───────────────────────────
INSERT INTO utilisateur 
  (nom, prenom, email, mot_de_passe, telephone, role, statut)
VALUES 
  ('Dupuis', 'Léa', 'produits@epicerie.fr',
   'Produits2026!',
   '0600000002', 'admin_produits', 'actif')
ON DUPLICATE KEY UPDATE
  nom = 'Dupuis', prenom = 'Léa', role = 'admin_produits', statut = 'actif';

SET @id_produits = (SELECT id_utilisateur FROM utilisateur WHERE email = 'produits@epicerie.fr' LIMIT 1);

INSERT INTO administrateur (id_utilisateur, type_admin) 
VALUES (@id_produits, 'produits')
ON DUPLICATE KEY UPDATE type_admin = 'produits';

-- ── 3. Admin Stock & Commandes ────────────────────────────────
INSERT INTO utilisateur 
  (nom, prenom, email, mot_de_passe, telephone, role, statut)
VALUES 
  ('Bernard', 'Thomas', 'stock@epicerie.fr',
   'Stock2026!',
   '0600000003', 'admin_stock', 'actif')
ON DUPLICATE KEY UPDATE
  nom = 'Bernard', prenom = 'Thomas', role = 'admin_stock', statut = 'actif';

SET @id_stock = (SELECT id_utilisateur FROM utilisateur WHERE email = 'stock@epicerie.fr' LIMIT 1);

INSERT INTO administrateur (id_utilisateur, type_admin) 
VALUES (@id_stock, 'stock')
ON DUPLICATE KEY UPDATE type_admin = 'stock';

-- ── Vérification finale ───────────────────────────────────────
SELECT 
  u.id_utilisateur,
  u.prenom,
  u.nom,
  u.email,
  u.role,
  u.statut,
  a.type_admin,
  a.id_administrateur
FROM utilisateur u
JOIN administrateur a ON u.id_utilisateur = a.id_utilisateur
ORDER BY u.id_utilisateur;
