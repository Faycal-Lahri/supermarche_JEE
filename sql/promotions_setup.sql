-- ════════════════════════════════════════════════════════════
--  PROMOTIONS SETUP — L'Épicerie Moderne
--  Run this file once to create tables and insert seed data
-- ════════════════════════════════════════════════════════════

-- ── 1. Table promotion ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotion (
    id_promotion     INT AUTO_INCREMENT PRIMARY KEY,
    nom_promotion    VARCHAR(120) NOT NULL,
    description      TEXT,
    pourcentage      DECIMAL(5,2) NOT NULL COMMENT 'ex: 20.00 = 20%',
    date_debut       DATE NOT NULL,
    date_fin         DATE NOT NULL,
    actif            BOOLEAN NOT NULL DEFAULT TRUE,
    id_admin_createur INT,
    date_creation    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_promo_admin FOREIGN KEY (id_admin_createur) REFERENCES administrateur(id_administrateur) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 2. Table promotion_produit (liaison M-N) ─────────────────
CREATE TABLE IF NOT EXISTS promotion_produit (
    id_promotion INT NOT NULL,
    id_produit   INT NOT NULL,
    PRIMARY KEY (id_promotion, id_produit),
    CONSTRAINT fk_pp_promo   FOREIGN KEY (id_promotion) REFERENCES promotion(id_promotion) ON DELETE CASCADE,
    CONSTRAINT fk_pp_produit FOREIGN KEY (id_produit)   REFERENCES produit(id_produit)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 3. Table code_promo ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS code_promo (
    id_code_promo    INT AUTO_INCREMENT PRIMARY KEY,
    code             VARCHAR(50) NOT NULL UNIQUE,
    description      VARCHAR(255),
    type_remise      ENUM('pourcentage','montant') NOT NULL DEFAULT 'pourcentage',
    valeur           DECIMAL(8,2) NOT NULL COMMENT 'Ex: 30 pour 30%',
    montant_min      DECIMAL(8,2) DEFAULT 0  COMMENT 'Montant minimum de commande',
    usage_max        INT DEFAULT NULL        COMMENT 'NULL = illimité',
    usage_count      INT DEFAULT 0,
    date_debut       DATE DEFAULT NULL,
    date_fin         DATE DEFAULT NULL,
    actif            BOOLEAN NOT NULL DEFAULT TRUE,
    id_admin_createur INT,
    date_creation    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_admin FOREIGN KEY (id_admin_createur) REFERENCES administrateur(id_administrateur) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 4. Table usage_code_promo (traçabilité) ─────────────────
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

-- ── 5. Seed: Code promo FAYCAL (30%) ────────────────────────
INSERT IGNORE INTO code_promo (code, description, type_remise, valeur, montant_min, usage_max, actif)
VALUES ('FAYCAL', 'Code VIP — 30% de réduction sur toute commande', 'pourcentage', 30.00, 0.00, NULL, TRUE);

-- ── 6. Seed: Promotions sur les produits existants ──────────
-- Promotion "Soldes d'été" (20%) sur les 5 premiers produits
INSERT IGNORE INTO promotion (nom_promotion, description, pourcentage, date_debut, date_fin, actif)
VALUES ('Soldes d''été', 'Profitez de nos meilleures offres estivales', 20.00,
        CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), TRUE);

-- Associer aux 5 premiers produits actifs
INSERT IGNORE INTO promotion_produit (id_promotion, id_produit)
SELECT LAST_INSERT_ID(), id_produit FROM produit WHERE actif=TRUE ORDER BY id_produit LIMIT 5;

-- Promotion "Coup de coeur" (15%) sur les produits 6-10
INSERT IGNORE INTO promotion (nom_promotion, description, pourcentage, date_debut, date_fin, actif)
VALUES ('Coup de cœur', 'Nos produits chouchous à prix réduit', 15.00,
        CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), TRUE);

INSERT IGNORE INTO promotion_produit (id_promotion, id_produit)
SELECT LAST_INSERT_ID(), id_produit FROM produit WHERE actif=TRUE ORDER BY id_produit LIMIT 5 OFFSET 5;

-- ═══════════════════════════════════════════════════
-- Vue pratique: produits avec leur promotion active
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE VIEW vue_produits_en_promotion AS
SELECT
    p.id_produit,
    p.nom_produit,
    p.prix               AS prix_original,
    pr.pourcentage,
    ROUND(p.prix * (1 - pr.pourcentage/100), 2) AS prix_promo,
    pr.id_promotion,
    pr.nom_promotion,
    pr.date_fin,
    c.nom_categorie,
    p.image_produit,
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
