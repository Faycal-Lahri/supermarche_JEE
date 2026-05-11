-- Migration 001 : Ajout colonne photo_profil
-- À exécuter une seule fois sur la base existante
ALTER TABLE utilisateur 
ADD COLUMN IF NOT EXISTS photo_profil VARCHAR(512) 
DEFAULT NULL AFTER telephone;
