USE supermarche_jee;

-- 1. Administrateur
-- On s'assure que l'utilisateur 1 (Super Admin) existe bien dans la table administrateur
INSERT IGNORE INTO administrateur (id_utilisateur, type_admin) VALUES (1, 'super');

-- On ajoute un administrateur spécifique pour les produits
INSERT IGNORE INTO utilisateur (id_utilisateur, nom, prenom, email, mot_de_passe, telephone, role, statut) VALUES 
(4, 'Admin', 'Produit', 'produit@supermarche.com', 'admin123', '0644444444', 'admin_produits', 'actif');
INSERT IGNORE INTO administrateur (id_utilisateur, type_admin) VALUES (4, 'produits');

-- 2. Panier
-- Création de paniers pour les clients
INSERT IGNORE INTO panier (id_panier, id_client, session_id, statut_panier, montant_total) VALUES 
(1, 1, 'session-abc-123', 'valide', 45.99),
(2, 2, 'session-xyz-987', 'actif', 145.00);

-- Ajout des produits dans les paniers
INSERT IGNORE INTO panier_produit (id_panier, id_produit, quantite, prix_unitaire_snapshot) VALUES 
(1, 1, 2, 15.99), 
(1, 2, 1, 14.01),
(2, 4, 1, 145.00);

-- 3. Commandes
-- Création de commandes basées sur les paniers et les clients
INSERT IGNORE INTO commande (id_commande, numero_commande, id_client, id_panier, statut_commande, montant_total, adresse_livraison, ville_livraison, code_postal_livraison, mode_paiement, est_paye) VALUES 
(1, 'CMD-2026-0001', 1, 1, 'livree', 45.99, '123 Avenue des Champs-Élysées', 'Paris', '75008', 'carte', 1),
(2, 'CMD-2026-0002', 2, NULL, 'en_preparation', 145.00, '45 Rue de la Paix', 'Lyon', '69002', 'a_la_livraison', 0);

-- 4. Lignes de Commande
-- Détails des produits commandés pour garder une trace indélébile (snapshot)
INSERT IGNORE INTO ligne_commande (id_commande, id_produit, nom_produit_snapshot, quantite, prix_unitaire, sous_total) VALUES 
(1, 1, 'Panier Légumes Premium', 2, 15.99, 31.98),
(1, 2, 'Assortiment Viennoiseries', 1, 14.01, 14.01),
(2, 4, 'Côte de Bœuf Wagyu A5', 1, 145.00, 145.00);

-- 5. Paiement
-- Historique et statuts des paiements liés aux commandes
INSERT IGNORE INTO paiement (id_commande, methode_paiement, statut_paiement) VALUES 
(1, 'carte', 'paye'),
(2, 'a_la_livraison', 'en_attente');

-- 6. Historique des Stocks
-- Garder une trace des entrées/sorties pour l'administrateur
INSERT IGNORE INTO historique_stock (id_produit, type_mouvement, quantite, quantite_avant, quantite_apres, id_admin, id_commande) VALUES 
(1, 'sortie', 2, 152, 150, 1, 1),
(2, 'sortie', 1, 51, 50, 1, 1),
(4, 'sortie', 1, 36, 35, 1, 2),
(1, 'entree', 100, 50, 150, 1, NULL);
