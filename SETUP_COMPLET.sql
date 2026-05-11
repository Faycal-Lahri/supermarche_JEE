-- ═══════════════════════════════════════════════════════════
--  SETUP COMPLET — L'Épicerie Moderne
--  Exécuter CE FICHIER UNIQUE dans MySQL Workbench ou DBeaver
--  Il crée la base, TOUTES les tables et insère les données
--
--  Comptes créés :
--  ┌─────────────────────────────┬──────────────┬────────────────┐
--  │ Email                       │ Mot de passe │ Rôle           │
--  ├─────────────────────────────┼──────────────┼────────────────┤
--  │ admin@supermarche.com       │ admin123     │ super_admin    │
--  │ sophie.martin@email.fr      │ mdp123456    │ admin_produits │
--  │ marc.dupuis@supermarche.com │ stock2026    │ admin_stock    │
--  └─────────────────────────────┴──────────────┴────────────────┘
-- ═══════════════════════════════════════════════════════════

-- 1) BASE DE DONNÉES
CREATE DATABASE IF NOT EXISTS supermarche_jee
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE supermarche_jee;

-- 2) TABLES (CREATE IF NOT EXISTS — sans casser les données existantes)

CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(100) NOT NULL,
    prenom         VARCHAR(100),
    email          VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe   VARCHAR(255) NOT NULL,
    telephone      VARCHAR(20),
    role           ENUM('client','admin_produits','admin_stock','super_admin') NOT NULL DEFAULT 'client',
    photo_profil   VARCHAR(512) DEFAULT NULL,
    statut         ENUM('actif','suspendu','supprime') NOT NULL DEFAULT 'actif',
    date_creation  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS administrateur (
    id_administrateur INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur    INT NOT NULL UNIQUE,
    type_admin        ENUM('super','produits','stock') NOT NULL DEFAULT 'produits',
    date_creation     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS client (
    id_client      INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL UNIQUE,
    cin            VARCHAR(20),
    adresse        VARCHAR(255),
    ville          VARCHAR(100),
    code_postal    VARCHAR(10),
    date_creation  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_client_user FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categorie (
    id_categorie        INT AUTO_INCREMENT PRIMARY KEY,
    nom_categorie       VARCHAR(100) NOT NULL,
    description         TEXT,
    id_categorie_parent INT DEFAULT NULL,
    CONSTRAINT fk_cat_parent FOREIGN KEY (id_categorie_parent) REFERENCES categorie(id_categorie) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS produit (
    id_produit    INT AUTO_INCREMENT PRIMARY KEY,
    id_categorie  INT,
    nom_produit   VARCHAR(255) NOT NULL,
    description   TEXT,
    prix          DECIMAL(10,2) NOT NULL,
    image_produit VARCHAR(512),
    actif         BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produit_cat FOREIGN KEY (id_categorie) REFERENCES categorie(id_categorie) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stock (
    id_stock             INT AUTO_INCREMENT PRIMARY KEY,
    id_produit           INT NOT NULL UNIQUE,
    quantite_disponible  INT NOT NULL DEFAULT 0,
    seuil_alerte         INT NOT NULL DEFAULT 10,
    statut_stock         ENUM('disponible','alerte','rupture') NOT NULL DEFAULT 'disponible',
    date_mise_a_jour     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_produit FOREIGN KEY (id_produit) REFERENCES produit(id_produit) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS historique_stock (
    id_historique  INT AUTO_INCREMENT PRIMARY KEY,
    id_produit     INT NOT NULL,
    type_mouvement ENUM('entree','sortie','ajustement') NOT NULL,
    quantite       INT NOT NULL,
    quantite_avant INT NOT NULL,
    quantite_apres INT NOT NULL,
    id_admin       INT DEFAULT NULL,
    id_commande    INT DEFAULT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hs_produit FOREIGN KEY (id_produit) REFERENCES produit(id_produit) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS panier (
    id_panier     INT AUTO_INCREMENT PRIMARY KEY,
    id_client     INT,
    session_id    VARCHAR(128),
    statut_panier ENUM('actif','valide','abandonne') NOT NULL DEFAULT 'actif',
    montant_total DECIMAL(10,2) DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_statut   TIMESTAMP NULL,
    CONSTRAINT fk_panier_client FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS panier_produit (
    id_panier              INT NOT NULL,
    id_produit             INT NOT NULL,
    quantite               INT NOT NULL DEFAULT 1,
    prix_unitaire_snapshot DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_panier, id_produit),
    CONSTRAINT fk_pp_panier  FOREIGN KEY (id_panier)  REFERENCES panier(id_panier)  ON DELETE CASCADE,
    CONSTRAINT fk_pp_produit FOREIGN KEY (id_produit) REFERENCES produit(id_produit) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commande (
    id_commande           INT AUTO_INCREMENT PRIMARY KEY,
    numero_commande       VARCHAR(30) NOT NULL UNIQUE,
    id_client             INT NOT NULL,
    id_panier             INT DEFAULT NULL,
    date_commande         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut_commande       ENUM('en_attente','confirmee','en_preparation','en_livraison','livree','annulee') NOT NULL DEFAULT 'en_attente',
    montant_total         DECIMAL(10,2) NOT NULL,
    adresse_livraison     VARCHAR(255),
    ville_livraison       VARCHAR(100),
    code_postal_livraison VARCHAR(10),
    mode_paiement         ENUM('carte','a_la_livraison','paypal') DEFAULT 'a_la_livraison',
    est_paye              BOOLEAN NOT NULL DEFAULT FALSE,
    note                  TEXT,
    raison_annulation     TEXT,
    annule_par            VARCHAR(50),
    date_annulation       TIMESTAMP NULL,
    CONSTRAINT fk_cmd_client FOREIGN KEY (id_client) REFERENCES client(id_client)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ligne_commande (
    id_ligne_commande    INT AUTO_INCREMENT PRIMARY KEY,
    id_commande          INT NOT NULL,
    id_produit           INT DEFAULT NULL,
    nom_produit_snapshot VARCHAR(255) NOT NULL,
    quantite             INT NOT NULL,
    prix_unitaire        DECIMAL(10,2) NOT NULL,
    sous_total           DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_lc_commande FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE,
    CONSTRAINT fk_lc_produit  FOREIGN KEY (id_produit)  REFERENCES produit(id_produit)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS paiement (
    id_paiement      INT AUTO_INCREMENT PRIMARY KEY,
    id_commande      INT NOT NULL UNIQUE,
    methode_paiement VARCHAR(50),
    statut_paiement  ENUM('en_attente','paye','rembourse') NOT NULL DEFAULT 'en_attente',
    date_paiement    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paiement_cmd FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tables Promotions
CREATE TABLE IF NOT EXISTS promotion (
    id_promotion      INT AUTO_INCREMENT PRIMARY KEY,
    nom_promotion     VARCHAR(120) NOT NULL,
    description       TEXT,
    pourcentage       DECIMAL(5,2) NOT NULL,
    date_debut        DATE NOT NULL,
    date_fin          DATE NOT NULL,
    actif             BOOLEAN NOT NULL DEFAULT TRUE,
    id_admin_createur INT DEFAULT NULL,
    date_creation     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_promo_admin FOREIGN KEY (id_admin_createur)
        REFERENCES administrateur(id_administrateur) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS promotion_produit (
    id_promotion INT NOT NULL,
    id_produit   INT NOT NULL,
    PRIMARY KEY (id_promotion, id_produit),
    CONSTRAINT fk_promp_promo  FOREIGN KEY (id_promotion) REFERENCES promotion(id_promotion) ON DELETE CASCADE,
    CONSTRAINT fk_promp_prod   FOREIGN KEY (id_produit)   REFERENCES produit(id_produit)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS code_promo (
    id_code_promo     INT AUTO_INCREMENT PRIMARY KEY,
    code              VARCHAR(50) NOT NULL UNIQUE,
    description       VARCHAR(255),
    type_remise       ENUM('pourcentage','montant') NOT NULL DEFAULT 'pourcentage',
    valeur            DECIMAL(8,2) NOT NULL,
    montant_min       DECIMAL(8,2) DEFAULT 0,
    usage_max         INT DEFAULT NULL,
    usage_count       INT DEFAULT 0,
    date_debut        DATE DEFAULT NULL,
    date_fin          DATE DEFAULT NULL,
    actif             BOOLEAN NOT NULL DEFAULT TRUE,
    id_admin_createur INT DEFAULT NULL,
    date_creation     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_admin FOREIGN KEY (id_admin_createur)
        REFERENCES administrateur(id_administrateur) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usage_code_promo (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    id_code_promo    INT NOT NULL,
    id_client        INT NOT NULL,
    id_commande      INT NOT NULL,
    montant_remise   DECIMAL(8,2) NOT NULL,
    date_utilisation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ucp_code     FOREIGN KEY (id_code_promo) REFERENCES code_promo(id_code_promo),
    CONSTRAINT fk_ucp_client   FOREIGN KEY (id_client)     REFERENCES client(id_client),
    CONSTRAINT fk_ucp_commande FOREIGN KEY (id_commande)   REFERENCES commande(id_commande)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vue produits en promotion
CREATE OR REPLACE VIEW vue_produits_en_promotion AS
SELECT
    p.id_produit,
    p.nom_produit,
    c.nom_categorie,
    p.image_produit,
    p.prix               AS prix_original,
    pr.pourcentage,
    ROUND(p.prix * (1 - pr.pourcentage/100), 2) AS prix_promo,
    pr.id_promotion,
    pr.nom_promotion,
    pr.date_fin,
    s.quantite_disponible
FROM produit p
JOIN promotion_produit pp ON pp.id_produit = p.id_produit
JOIN promotion pr ON pr.id_promotion = pp.id_promotion
LEFT JOIN categorie c ON c.id_categorie = p.id_categorie
LEFT JOIN stock s ON s.id_produit = p.id_produit
WHERE p.actif = TRUE
  AND pr.actif = TRUE
  AND pr.date_debut <= CURDATE()
  AND pr.date_fin   >= CURDATE();

-- ═══════════════════════════════════════════════════════════
-- 3) AJOUT DU 3ème ADMIN MANQUANT (admin_stock)
--    À exécuter APRÈS seed_final.sql (qui crée les id 1 et 2)
-- ═══════════════════════════════════════════════════════════

-- Insertion sécurisée : ignore si l'email existe déjà
INSERT IGNORE INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, role, statut)
VALUES ('Dupuis', 'Marc', 'marc.dupuis@supermarche.com', 'stock2026', '0677000008', 'admin_stock', 'actif');

-- Lier à la table administrateur (récupère l'id auto-généré)
INSERT IGNORE INTO administrateur (id_utilisateur, type_admin)
SELECT id_utilisateur, 'stock'
FROM utilisateur
WHERE email = 'marc.dupuis@supermarche.com';

-- ═══════════════════════════════════════════════════════════
-- 4) DONNÉES DE DÉMONSTRATION (promotions + code promo)
--    Insérer seulement si les tables sont vides
-- ═══════════════════════════════════════════════════════════

-- Promo 1 : Fruits & Légumes -20%
INSERT INTO promotion (nom_promotion, description, pourcentage, date_debut, date_fin, actif, id_admin_createur)
SELECT 'Soldes Fruits Bio', 'Réduction sur les fruits bio de saison', 20.00,
       CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE, id_administrateur
FROM administrateur WHERE type_admin = 'super' LIMIT 1;

-- Associer produits 1-5 (fruits) à la promo
INSERT IGNORE INTO promotion_produit (id_promotion, id_produit)
SELECT (SELECT MAX(id_promotion) FROM promotion WHERE nom_promotion = 'Soldes Fruits Bio'), id_produit
FROM (SELECT 1 AS id_produit UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) src
WHERE EXISTS (SELECT 1 FROM produit WHERE id_produit = src.id_produit);

-- Promo 2 : Boulangerie -15%
INSERT INTO promotion (nom_promotion, description, pourcentage, date_debut, date_fin, actif, id_admin_createur)
SELECT 'Promotion Boulangerie', 'Pains et viennoiseries à prix réduit', 15.00,
       CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), TRUE, id_administrateur
FROM administrateur WHERE type_admin = 'super' LIMIT 1;

INSERT IGNORE INTO promotion_produit (id_promotion, id_produit)
SELECT (SELECT MAX(id_promotion) FROM promotion WHERE nom_promotion = 'Promotion Boulangerie'), id_produit
FROM (SELECT 26 AS id_produit UNION SELECT 27 UNION SELECT 28) src
WHERE EXISTS (SELECT 1 FROM produit WHERE id_produit = src.id_produit);

-- Code promo de bienvenue
INSERT IGNORE INTO code_promo (code, description, type_remise, valeur, montant_min, usage_max, actif, id_admin_createur)
SELECT 'BIENVENUE10', 'Code de bienvenue - 10% de réduction', 'pourcentage', 10.00, 20.00, 100, TRUE, id_administrateur
FROM administrateur WHERE type_admin = 'super' LIMIT 1;

-- Code promo fixe 5€
INSERT IGNORE INTO code_promo (code, description, type_remise, valeur, montant_min, actif, id_admin_createur)
SELECT 'REMISE5', 'Remise fixe de 5€ sur votre commande', 'montant', 5.00, 30.00, TRUE, id_administrateur
FROM administrateur WHERE type_admin = 'super' LIMIT 1;
