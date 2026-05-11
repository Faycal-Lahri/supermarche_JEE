USE supermarche_jee;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE panier_produit;
TRUNCATE TABLE panier;
TRUNCATE TABLE paiement;
TRUNCATE TABLE ligne_commande;
TRUNCATE TABLE historique_stock;
TRUNCATE TABLE commande;
TRUNCATE TABLE stock;
TRUNCATE TABLE produit;
TRUNCATE TABLE categorie;
TRUNCATE TABLE client;
TRUNCATE TABLE administrateur;
TRUNCATE TABLE utilisateur;
SET FOREIGN_KEY_CHECKS = 1;

-- CATEGORIES
INSERT INTO categorie (id_categorie, nom_categorie, description, id_categorie_parent) VALUES
(1, 'Épicerie Fine', 'Truffes, Caviars et mets d\'exception', NULL),
(2, 'Viandes d\'Exception', 'Wagyu, Kobe, Volailles de Bresse', NULL),
(3, 'Cave à Vins & Spiritueux', 'Grands crus classés et champagnes millésimés', NULL),
(4, 'Fruits & Légumes Rares', 'Produits de la terre sélectionnés avec soin', NULL),
(5, 'High-Tech & Lifestyle', 'Accessoires et objets connectés très haut de gamme', NULL),
(6, 'Soins & Beauté', 'Cosmétiques de luxe et parfums', NULL);

-- PRODUITS
INSERT INTO produit (id_produit, id_categorie, nom_produit, description, prix, image_produit) VALUES
(1, 1, 'Caviar Beluga Iranien 50g', 'Le caviar le plus prestigieux au monde, aux grains gris clair', 350.00, 'https://images.unsplash.com/photo-1620800632349-f1e102209a36?auto=format&fit=crop&q=80&w=800'),
(2, 1, 'Truffe Blanche d\'Alba 100g', 'L\'or blanc de la gastronomie italienne, parfum envoûtant', 450.00, 'https://images.unsplash.com/photo-1605333393962-e64e1da78c18?auto=format&fit=crop&q=80&w=800'),
(3, 1, 'Safran d\'Iran Coupe Pushal 5g', 'L\'épice la plus rare du monde, pureté garantie', 85.00, 'https://images.unsplash.com/photo-1596647225129-e85df649f80a?auto=format&fit=crop&q=80&w=800'),
(4, 1, 'Miel de Manuka IAA 18+', 'Un nectar précieux de Nouvelle-Zélande', 120.00, 'https://images.unsplash.com/photo-1587049352847-4d4b1ed7355a?auto=format&fit=crop&q=80&w=800'),
(5, 1, 'Foie Gras d\'Oie Entier 200g', 'Foie gras artisanal issu d\'élevages traditionnels', 140.00, 'https://images.unsplash.com/photo-1606822350854-e6e23298132d?auto=format&fit=crop&q=80&w=800'),

(6, 2, 'Côte de Bœuf Wagyu A5 500g', 'Un persillage extrême pour une tendreté incomparable', 280.00, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800'),
(7, 2, 'Poularde de Bresse AOC', 'La reine des volailles, élevée en liberté', 85.00, 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800'),
(8, 2, 'Jambon Ibérique Bellota 100g', 'Affiné 48 mois, découpé à la main', 55.00, 'https://images.unsplash.com/photo-1628185584852-6725baea7b4e?auto=format&fit=crop&q=80&w=800'),
(9, 2, 'Entrecôte Black Angus USA 400g', 'Viande d\'exception, persillage généreux', 95.00, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800'),
(10, 2, 'Filet Mignon de Porc Noir', 'Une tendreté rare, goût noisette', 75.00, 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&q=80&w=800'),

(11, 3, 'Château Margaux 2015', 'Premier grand cru classé, Bordeaux', 1250.00, 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?auto=format&fit=crop&q=80&w=800'),
(12, 3, 'Dom Pérignon P2 2002', 'Champagne mythique, plénitude 2', 450.00, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=800'),
(13, 3, 'Whisky Macallan 25 ans', 'Un single malt d\'une profondeur absolue', 2800.00, 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?auto=format&fit=crop&q=80&w=800'),
(14, 3, 'Cognac Louis XIII', 'Le chef-d\'œuvre de la maison Rémy Martin', 3200.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800'),
(15, 3, 'Saké Dassai 23', 'Un saké japonais poli à l\'extrême', 140.00, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=800'),

(16, 4, 'Melon Yubari King (Le duo)', 'Les melons les plus chers du monde, cultivés au Japon', 450.00, 'https://images.unsplash.com/photo-1569485761376-7786f4a3a60a?auto=format&fit=crop&q=80&w=800'),
(17, 4, 'Fraises Blanches White Jewel 250g', 'Fraises japonaises extrêmement rares et sucrées', 85.00, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800'),
(18, 4, 'Raisin Ruby Roman (Grappe)', 'Des grains géants, gorgés de soleil', 250.00, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=800'),
(19, 4, 'Mangue Miyazaki 1kg', 'La mangue de l\'œuf du soleil', 180.00, 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800'),
(20, 4, 'Tomates Ibérico', 'Récoltées à maturité parfaite en Andalousie', 45.00, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800'),

(21, 5, 'Casque Audio Or Massif 18k', 'Qualité sonore studio, design intemporel or massif', 4500.00, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'),
(22, 5, 'Machine à Expresso Lelit Bianca', 'La perfection italienne pour un café divin', 2800.00, 'https://images.unsplash.com/photo-1585258667503-455b85a111a8?auto=format&fit=crop&q=80&w=800'),
(23, 5, 'Enceinte Phantom Devialet', 'Un son d\'une clarté et d\'une puissance monumentales', 2900.00, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800'),
(24, 5, 'Montre Connectée Titane', 'Une alliance parfaite entre horlogerie suisse et tech', 1850.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'),
(25, 5, 'Robot Pâtissier Platinum', 'Le chef d\'œuvre de la cuisine moderne', 1250.00, 'https://images.unsplash.com/photo-1595180665798-2bb1d2c60ff3?auto=format&fit=crop&q=80&w=800'),

(26, 6, 'Crème Visage Or Noir', 'Soin rajeunissant à la poussière d\'astéroïde', 650.00, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800'),
(27, 6, 'Parfum Signature Oudh', 'Un sillage impérial et envoûtant', 420.00, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'),
(28, 6, 'Sérum d\'Éclat Diamant', 'Purifie et illumine le teint', 380.00, 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800'),
(29, 6, 'Set de Pinceaux Artisanaux', 'En poils naturels, forgés à la main', 190.00, 'https://images.unsplash.com/photo-1512496015851-a1c84c172288?auto=format&fit=crop&q=80&w=800'),
(30, 6, 'Huile Essentielle Rose de Damas', 'Extrait pur, distillation ancestrale', 240.00, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800');

-- STOCKS
INSERT INTO stock (id_produit, quantite_disponible, seuil_alerte, statut_stock) VALUES
(1, 15, 2, 'disponible'), (2, 8, 2, 'disponible'), (3, 50, 10, 'disponible'), (4, 25, 5, 'disponible'), (5, 40, 10, 'disponible'),
(6, 12, 3, 'disponible'), (7, 30, 5, 'disponible'), (8, 100, 20, 'disponible'), (9, 45, 10, 'disponible'), (10, 20, 5, 'disponible'),
(11, 5, 2, 'disponible'), (12, 10, 2, 'disponible'), (13, 2, 1, 'alerte'), (14, 4, 1, 'disponible'), (15, 18, 4, 'disponible'),
(16, 2, 1, 'alerte'), (17, 10, 2, 'disponible'), (18, 5, 1, 'disponible'), (19, 15, 3, 'disponible'), (20, 80, 10, 'disponible'),
(21, 3, 1, 'disponible'), (22, 12, 2, 'disponible'), (23, 20, 4, 'disponible'), (24, 45, 5, 'disponible'), (25, 30, 5, 'disponible'),
(26, 60, 10, 'disponible'), (27, 85, 15, 'disponible'), (28, 40, 5, 'disponible'), (29, 150, 20, 'disponible'), (30, 25, 5, 'disponible');

-- UTILISATEURS & CLIENTS
INSERT INTO utilisateur (id_utilisateur, nom, prenom, email, mot_de_passe, telephone, role, statut) VALUES
(1, 'Admin', 'Super', 'admin@supermarche.com', 'admin123', '0600000000', 'super_admin', 'actif'),
(2, 'Bezos', 'Jeff', 'jeff@amazon.com', 'client123', '0611111111', 'client', 'actif'),
(3, 'Arnault', 'Bernard', 'bernard@lvmh.com', 'password123', '0622222222', 'client', 'actif');

INSERT INTO administrateur (id_utilisateur, type_admin) VALUES (1, 'super');

INSERT INTO client (id_client, id_utilisateur, cin, adresse, ville, code_postal) VALUES
(1, 2, 'AB123456', '123 Avenue des Champs-Élysées', 'Paris', '75008'),
(2, 3, 'CD789012', '45 Rue de la Paix', 'Paris', '75002');

-- PANIERS
INSERT INTO panier (id_panier, id_client, session_id, statut_panier, montant_total) VALUES 
(1, 1, 'session-jeff-123', 'valide', 350.00),
(2, 2, 'session-bernard-123', 'actif', 4050.00);

-- PANIER_PRODUITS
INSERT INTO panier_produit (id_panier, id_produit, quantite, prix_unitaire_snapshot) VALUES 
(1, 1, 1, 350.00), 
(2, 11, 1, 1250.00),
(2, 22, 1, 2800.00);

-- COMMANDES
INSERT INTO commande (id_commande, numero_commande, id_client, id_panier, statut_commande, montant_total, adresse_livraison, ville_livraison, code_postal_livraison, mode_paiement, est_paye) VALUES 
(1, 'CMD-2026-JEFF01', 1, 1, 'livree', 350.00, '123 Avenue des Champs-Élysées', 'Paris', '75008', 'carte', 1);

-- LIGNES DE COMMANDE
INSERT INTO ligne_commande (id_commande, id_produit, nom_produit_snapshot, quantite, prix_unitaire, sous_total) VALUES 
(1, 1, 'Caviar Beluga Iranien 50g', 1, 350.00, 350.00);

-- PAIEMENT
INSERT INTO paiement (id_commande, methode_paiement, statut_paiement) VALUES 
(1, 'carte', 'paye');
