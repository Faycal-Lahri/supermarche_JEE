USE supermarche_jee;

-- Delete existing stock to avoid duplicates
DELETE FROM stock;

-- Insert stock for all products 1 to 15
INSERT INTO stock (id_produit, quantite_disponible, seuil_alerte, statut_stock) VALUES
(1, 150, 10, 'disponible'),
(2, 50, 10, 'disponible'),
(3, 200, 20, 'disponible'),
(4, 35, 5, 'disponible'),
(5, 80, 10, 'disponible'),
(6, 12, 5, 'disponible'),
(7, 45, 10, 'disponible'),
(8, 24, 6, 'disponible'),
(9, 60, 12, 'disponible'),
(10, 5, 2, 'alerte'),
(11, 100, 15, 'disponible'),
(12, 40, 10, 'disponible'),
(13, 85, 15, 'disponible'),
(14, 30, 5, 'disponible'),
(15, 18, 5, 'disponible');

-- Users and Clients
INSERT IGNORE INTO utilisateur (id_utilisateur, nom, prenom, email, mot_de_passe, telephone, role, statut) VALUES
(1, 'Admin', 'Super', 'admin@supermarche.com', 'admin123', '0600000000', 'super_admin', 'actif'),
(2, 'Client', 'Premium', 'client@test.com', 'client123', '0611111111', 'client', 'actif'),
(3, 'Dupont', 'Jean', 'jean.dupont@email.com', 'password123', '0622222222', 'client', 'actif');

INSERT IGNORE INTO client (id_client, id_utilisateur, cin, adresse, ville, code_postal) VALUES
(1, 2, 'AB123456', '123 Avenue des Champs-Élysées', 'Paris', '75008'),
(2, 3, 'CD789012', '45 Rue de la Paix', 'Lyon', '69002');
