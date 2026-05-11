-- ============================================================
-- PROMOTIONS — supermarche_jee
-- Ajouter des vraies promotions en BDD
-- ============================================================

USE supermarche_jee;

-- Ajouter colonne prix_promo si elle n'existe pas
ALTER TABLE produit 
  ADD COLUMN IF NOT EXISTS prix_promo DECIMAL(10,2) NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS en_promotion TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS date_debut_promo DATE NULL,
  ADD COLUMN IF NOT EXISTS date_fin_promo DATE NULL;

-- Activer des promotions sur ~25 produits (IDs 1 à 25)
-- Réduction de 10 à 30%
UPDATE produit SET 
  prix_promo = ROUND(prix * 0.80, 2),   -- -20%
  en_promotion = 1,
  date_debut_promo = CURDATE(),
  date_fin_promo = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
WHERE id_produit IN (1, 5, 9, 13, 17, 21, 25, 29, 33);

UPDATE produit SET 
  prix_promo = ROUND(prix * 0.85, 2),   -- -15%
  en_promotion = 1,
  date_debut_promo = CURDATE(),
  date_fin_promo = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
WHERE id_produit IN (2, 6, 10, 14, 18, 22, 26, 30, 34);

UPDATE produit SET 
  prix_promo = ROUND(prix * 0.75, 2),   -- -25%
  en_promotion = 1,
  date_debut_promo = CURDATE(),
  date_fin_promo = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
WHERE id_produit IN (3, 7, 11, 15, 19, 23, 27, 31, 35);

UPDATE produit SET 
  prix_promo = ROUND(prix * 0.82, 2),   -- -18%
  en_promotion = 1,
  date_debut_promo = CURDATE(),
  date_fin_promo = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
WHERE id_produit IN (4, 8, 12, 16, 20, 24, 28, 32, 36);

-- Vérification
SELECT id_produit, nom_produit, prix, prix_promo, en_promotion,
  ROUND((1 - prix_promo/prix)*100) AS pct_reduction
FROM produit 
WHERE en_promotion = 1
ORDER BY id_produit
LIMIT 20;
