-- Migration 002 : Ajout colonnes code promo et remise dans commande
-- À exécuter une seule fois sur la base existante
ALTER TABLE commande
  ADD COLUMN IF NOT EXISTS code_promo_utilise VARCHAR(50)     DEFAULT NULL AFTER mode_paiement,
  ADD COLUMN IF NOT EXISTS montant_remise     DECIMAL(10,2)   DEFAULT 0.00 AFTER code_promo_utilise;
