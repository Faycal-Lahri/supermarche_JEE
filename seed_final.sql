SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
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

-- =====================================================
-- CATEGORIES COMPLETES (structure logique supermarche)
-- =====================================================
INSERT INTO categorie (id_categorie, nom_categorie, description, id_categorie_parent) VALUES
-- Rayons parents
(1,  'Fruits & Legumes',      'Produits frais du marche',         NULL),
(2,  'Viandes & Poissons',    'Boucherie et poissonnerie fraiche', NULL),
(3,  'Produits Laitiers',     'Fromages, yaourts, cremerie',       NULL),
(4,  'Boulangerie',           'Pain, viennoiseries, patisseries',  NULL),
(5,  'Epicerie',              'Conserves, pates, huiles',          NULL),
(6,  'Boissons',              'Eaux, jus, sodas, vins, bieres',    NULL),
(7,  'Surgeles',              'Produits congeles',                 NULL),
(8,  'Bio & Sante',           'Certifies bio, nutrition',          NULL),

-- Sous-cat Fruits & Legumes
(9,  'Fruits Frais',          'Pommes, poires, agrumes...',        1),
(10, 'Legumes Frais',         'Carottes, courgettes, salades...',  1),
(11, 'Herbes Aromatiques',    'Basilic, persil, thym...',          1),

-- Sous-cat Viandes & Poissons
(12, 'Boeuf & Veau',          'Steaks, roti, cote...',             2),
(13, 'Volailles',             'Poulet, dinde, canard...',          2),
(14, 'Poissons & Fruits de mer','Saumon, cabillaud, crevettes...', 2),

-- Sous-cat Produits Laitiers
(15, 'Fromages',              'Camembert, comte, brie...',         3),
(16, 'Yaourts & Desserts',    'Yaourts nature, cremes...',         3),
(17, 'Beurre & Cremes',       'Beurre doux, demi-sel, creme...',  3),

-- Sous-cat Epicerie
(18, 'Pates & Riz',           'Spaghetti, penne, riz basmati...',  5),
(19, 'Conserves & Bocaux',    'Tomates, haricots, lentilles...',   5),
(20, 'Huiles & Condiments',   'Huile olive, vinaigre, moutarde..',  5),

-- Sous-cat Boissons
(21, 'Eaux & Soft Drinks',    'Eau plate, gazeuse, jus...',        6),
(22, 'Vins & Bieres',         'Bordeaux, roses, bieres artisanales',6),
(23, 'Cafes & Thes',          'Cafes en grains, thes fins...',     6),

-- Sous-cat Bio
(24, 'Produits Bio',          'Certifies Agriculture Biologique',  8),
(25, 'Nutrition & Sport',     'Proteines, cereales, barres...',    8);

-- =====================================================
-- PRODUITS 40 (sans accents speciaux dans les noms)
-- =====================================================
INSERT INTO produit (id_produit, id_categorie, nom_produit, description, prix, image_produit, actif) VALUES
-- Fruits (cat 9)
(1,  9,  'Fraises Bio 500g',
     'Cultivees en plein air, recoltees a maturite. Gout incomparable, sans pesticides.',
     4.50, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800', 1),
(2,  9,  'Avocats Hass murs x2',
     'Lot de 2 avocats Hass prets a consommer. Chair onctueuse, ideale pour guacamole.',
     3.20, 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&q=80&w=800', 1),
(3,  9,  'Pommes Pink Lady 1kg',
     'Croquantes et sucrees, origine Provence. Ideales pour le gouter ou les desserts.',
     3.90, 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&q=80&w=800', 1),
(4,  9,  'Oranges Sanguines 1kg',
     'Oranges de Sicile juteuses a la pulpe rouge. Riches en vitamine C.',
     4.20, 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=800', 1),
(5,  9,  'Bananes Bio 1kg',
     'Bananes du commerce equitable, mures a point. Douceur naturelle garantie.',
     2.15, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=800', 1),
(6,  9,  'Myrtilles 125g',
     'Myrtilles sauvages extra-fraiches. Antioxydants naturels, saveur intense.',
     3.99, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=800', 1),
(7,  9,  'Framboises Fraiches 125g',
     'Framboises de France recoltees le matin. Parfum delicat et gout acidule.',
     3.49, 'https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&q=80&w=800', 1),
(8,  9,  'Citrons de Menton 500g',
     'Citrons AOP de Menton, chair juteuse et ecorce parfumee. Reference gastronomique.',
     2.80, 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=800', 1),

-- Legumes (cat 10)
(9,  10, 'Carottes Nouvelles Bio 1kg',
     'Carottes primeur cultivees sans engrais chimique. Texture tendre et sucree.',
     1.99, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800', 1),
(10, 10, 'Tomates Coeur de Boeuf 500g',
     'Tomates anciennes variete coeur de boeuf. Charnu, juteux, peu de graines.',
     3.50, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800', 1),
(11, 10, 'Salade Iceberg',
     'Salade croquante et fraiche. Parfaite pour vos salades composees.',
     1.29, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800', 1),
(12, 10, 'Courgettes Bio 500g',
     'Courgettes tendres de culture biologique. A sauter, gratiner ou spiraliser.',
     2.40, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=800', 1),
(13, 10, 'Champignons de Paris 250g',
     'Champignons blancs extra-fermes. Cueillis frais, livres le meme jour.',
     2.80, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', 1),

-- Viandes (cat 12)
(14, 12, 'Steak Hache 5% MG x4',
     '4 steaks haches 480g. Pur boeuf façonne main, ideal pour burgers et grillades.',
     7.90, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800', 1),
(15, 12, 'Cote de Boeuf Angus 500g',
     'Cote de boeuf maturee 28 jours. Gout intense, tendresse exceptionnelle.',
     18.90, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800', 1),
(16, 12, 'Roti de Veau Fermier 600g',
     'Veau fermier du terroir, tendre et parfume. Ideal pour les repas du dimanche.',
     14.50, 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&q=80&w=800', 1),

-- Volailles (cat 13)
(17, 13, 'Poulet Fermier Entier 1.5kg',
     'Label Rouge, eleve en plein air 81 jours. Saveur incomparable au four.',
     9.90, 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800', 1),
(18, 13, 'Filets de Poulet x2 400g',
     'Filets de poulet fermier prets a cuisiner. Tendres, maigres et savoureux.',
     6.50, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800', 1),

-- Poissons (cat 14)
(19, 14, 'Saumon Atlantique 400g',
     'Filet de saumon frais du jour. Riche en omega-3, idéal grille ou en papillote.',
     8.90, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800', 1),
(20, 14, 'Crevettes Royales 200g',
     'Crevettes decortiquees, pretes a cuisiner. Ideal pour les poeles et woks.',
     7.50, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=800', 1),

-- Fromages (cat 15)
(21, 15, 'Camembert de Normandie AOP 250g',
     'Veritable camembert au lait cru, croute fleurie. Cremeux a coeur a maturite.',
     4.90, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800', 1),
(22, 15, 'Comte Affine 18 mois 200g',
     'Comte selectiomme, affine 18 mois en cave. Gout fruité et notes de noisette.',
     5.40, 'https://images.unsplash.com/photo-1612892483236-52d32a0e0ac1?auto=format&fit=crop&q=80&w=800', 1),
(23, 15, 'Brie de Meaux AOP 200g',
     'Brie au lait cru, a texture fondante. Saveur douce legerement noisetee.',
     4.20, 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=800', 1),

-- Yaourts (cat 16)
(24, 16, 'Yaourt Nature Entier x4',
     '4 pots de 125g. Yaourt brasse onctueux, riche en calcium. Sans sucres ajoutes.',
     2.50, 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&q=80&w=800', 1),
(25, 17, 'Beurre Doux AOP Charentes 250g',
     'Beurre doux AOC Charentes-Poitou. Goûter sa richesse sur du pain frais.',
     2.90, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=800', 1),

-- Boulangerie (cat 4)
(26, 4, 'Pain au Levain Artisanal 400g',
     'Pain au levain naturel, cuit dans four à bois. Croute doree, mie alveolée.',
     3.50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', 1),
(27, 4, 'Croissants Pur Beurre x4',
     '4 croissants feuilletés au beurre AOP. Dores, croquants dehors, tendres dedans.',
     4.80, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800', 1),
(28, 4, 'Baguette Tradition 250g',
     'La vraie baguette française façon boulanger. Farineuse et croustillante.',
     1.20, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7e?auto=format&fit=crop&q=80&w=800', 1),

-- Epicerie - Pates (cat 18)
(29, 18, 'Pates Spaghetti Bio 500g',
     'Spaghetti 100% ble dur biologique. Cuisson al dente en 9 minutes.',
     2.20, 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=800', 1),
(30, 18, 'Riz Basmati Long 1kg',
     'Riz à grains longs, parfum delicat de jasmin. Parfait pour currys et biryani.',
     3.40, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800', 1),

-- Conserves (cat 19)
(31, 19, 'Tomates Pelees Entieres 400g',
     'Tomates entières pelees, cultivees sous le soleil du Sud. Base ideale des sauces.',
     1.15, 'https://images.unsplash.com/photo-1546470427-0d4b304f7fc6?auto=format&fit=crop&q=80&w=800', 1),
(32, 19, 'Lentilles Vertes du Puy 500g',
     'Lentilles AOP Label Rouge du Puy-en-Velay. Ne passez pas à travers la cuisson.',
     2.90, 'https://images.unsplash.com/photo-1612257999756-5b0c4174b3bd?auto=format&fit=crop&q=80&w=800', 1),

-- Huiles (cat 20)
(33, 20, 'Huile Olive Extra Vierge 750ml',
     'Premiere pression a froid, origine Grece. Acidite inférieure a 0.5%.',
     10.90, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800', 1),
(34, 20, 'Moutarde de Dijon Forte 200g',
     'Moutarde forte maison Fallot depuis 1840. Piquante et savoureuse.',
     2.40, 'https://images.unsplash.com/photo-1589635328936-98ab3fa80cf2?auto=format&fit=crop&q=80&w=800', 1),

-- Boissons - Eaux (cat 21)
(35, 21, 'Eau Gazeuse 1L',
     'Eau minérale naturellement petillante, source italienne. Ideale a table.',
     1.99, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&q=80&w=800', 1),
(36, 21, 'Jus Orange Presse 1L',
     'Pur jus frais presse, sans sucre ajoute. Vitamines intactes, gout authentique.',
     3.60, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800', 1),

-- Vins (cat 22)
(37, 22, 'Bordeaux Rouge Chateau 75cl',
     'Bordeaux AOC millesime 2020. Notes de fruits rouges, tanins souples.',
     12.90, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800', 1),
(38, 22, 'Rose Provence AOP 75cl',
     'Rose sec et leger, idéal pour les repas estivaux. Fruité et elegant.',
     9.50, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800', 1),

-- Bio (cat 24)
(39, 24, 'Quinoa Blanc Bio 500g',
     'Quinoa certifie AB, riche en proteines vegetales. Sans gluten, tres digestible.',
     4.90, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800', 1),
(40, 24, 'Chocolat Noir 85% Bio 100g',
     'Feves selectionnees, cacao grand cru. Amertume maitrisee, notes terroir.',
     3.90, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=800', 1);

-- =====================================================
-- STOCKS (tous disponibles sauf 1 en alerte)
-- =====================================================
INSERT INTO stock (id_produit, quantite_disponible, seuil_alerte, statut_stock) VALUES
(1,95,15,'disponible'),(2,60,10,'disponible'),(3,200,20,'disponible'),
(4,150,20,'disponible'),(5,300,30,'disponible'),(6,45,10,'disponible'),
(7,30,8,'disponible'),(8,80,12,'disponible'),(9,250,25,'disponible'),
(10,120,20,'disponible'),(11,80,15,'disponible'),(12,65,12,'disponible'),
(13,90,15,'disponible'),(14,50,10,'disponible'),(15,20,5,'disponible'),
(16,18,4,'disponible'),(17,35,8,'disponible'),(18,70,12,'disponible'),
(19,25,6,'disponible'),(20,40,8,'disponible'),(21,60,10,'disponible'),
(22,55,10,'disponible'),(23,45,8,'disponible'),(24,100,20,'disponible'),
(25,85,15,'disponible'),(26,40,8,'disponible'),(27,60,12,'disponible'),
(28,200,30,'disponible'),(29,180,25,'disponible'),(30,210,25,'disponible'),
(31,300,40,'disponible'),(32,150,20,'disponible'),(33,80,12,'disponible'),
(34,120,20,'disponible'),(35,400,50,'disponible'),(36,90,15,'disponible'),
(37,60,10,'disponible'),(38,75,12,'disponible'),(39,70,12,'disponible'),
(40,4,5,'alerte');

-- =====================================================
-- UTILISATEURS
-- =====================================================
INSERT INTO utilisateur (id_utilisateur, nom, prenom, email, mot_de_passe, telephone, role, statut) VALUES
(1,'Admin','Super','admin@supermarche.com','admin123','0600000001','super_admin','actif'),
(2,'Martin','Sophie','sophie.martin@email.fr','mdp123456','0611000002','admin_produits','actif'),
(8,'Dupuis','Marc','marc.dupuis@supermarche.com','stock2026','0677000008','admin_stock','actif'),
(3,'Dupont','Claire','claire.dupont@email.fr','claire2026','0622000003','client','actif'),
(4,'Bernard','Thomas','thomas.bernard@email.fr','thomas2026','0633000004','client','actif'),
(5,'Leroy','Amina','amina.leroy@email.fr','amina2026','0644000005','client','actif'),
(6,'Rousseau','Lucas','lucas.rousseau@email.fr','lucas2026','0655000006','client','actif'),
(7,'Moreau','Fatima','fatima.moreau@email.fr','fatima2026','0666000007','client','actif');

INSERT INTO administrateur (id_utilisateur, type_admin) VALUES (1,'super'),(2,'produits'),(8,'stock');

INSERT INTO client (id_client, id_utilisateur, cin, adresse, ville, code_postal) VALUES
(1,3,'AB234567','12 Rue de la Liberte','Paris','75011'),
(2,4,'CD345678','8 Avenue Jean Jaures','Lyon','69007'),
(3,5,'EF456789','45 Boulevard des Capucines','Marseille','13001'),
(4,6,'GH567890','3 Rue Victor Hugo','Bordeaux','33000'),
(5,7,'IJ678901','22 Allee des Roses','Toulouse','31000');

-- =====================================================
-- PANIERS
-- =====================================================
INSERT INTO panier (id_panier, id_client, session_id, statut_panier, montant_total) VALUES
(1,1,'sess-claire-001','actif',42.75),
(2,2,'sess-thomas-001','actif',28.40),
(3,3,'sess-amina-001','valide',67.90),
(4,4,'sess-lucas-001','valide',19.60),
(5,5,'sess-fatima-001','abandonne',12.00);

INSERT INTO panier_produit (id_panier, id_produit, quantite, prix_unitaire_snapshot) VALUES
(1,1,2,4.50),(1,14,1,7.90),(1,26,1,3.50),(1,33,1,10.90),(1,40,1,3.90),
(2,3,1,3.90),(2,21,1,4.90),(2,28,2,1.20),(2,36,1,3.60),(2,24,2,2.50),
(3,15,1,18.90),(3,37,1,12.90),(3,22,1,5.40),(3,33,1,10.90),(3,9,2,1.99),
(4,5,2,2.15),(4,10,1,3.50),(4,29,1,2.20),(4,31,2,1.15),(4,34,1,2.40),
(5,40,1,3.90),(5,39,1,4.90),(5,24,1,2.50);

-- =====================================================
-- COMMANDES
-- =====================================================
INSERT INTO commande (id_commande,numero_commande,id_client,id_panier,statut_commande,montant_total,adresse_livraison,ville_livraison,code_postal_livraison,mode_paiement,est_paye) VALUES
(1,'CMD-2026-0001',3,3,'livree',67.90,'45 Boulevard des Capucines','Marseille','13001','carte',1),
(2,'CMD-2026-0002',4,4,'livree',19.60,'3 Rue Victor Hugo','Bordeaux','33000','a_la_livraison',1),
(3,'CMD-2026-0003',1,NULL,'en_preparation',35.80,'12 Rue de la Liberte','Paris','75011','carte',1),
(4,'CMD-2026-0004',2,NULL,'confirmee',55.20,'8 Avenue Jean Jaures','Lyon','69007','carte',1),
(5,'CMD-2026-0005',5,NULL,'en_attente',24.70,'22 Allee des Roses','Toulouse','31000','a_la_livraison',0);

INSERT INTO ligne_commande (id_commande,id_produit,nom_produit_snapshot,quantite,prix_unitaire,sous_total) VALUES
(1,15,'Cote de Boeuf Angus 500g',1,18.90,18.90),
(1,37,'Bordeaux Rouge Chateau 75cl',1,12.90,12.90),
(1,22,'Comte Affine 18 mois 200g',1,5.40,5.40),
(1,33,'Huile Olive Extra Vierge 750ml',1,10.90,10.90),
(1,9,'Carottes Nouvelles Bio 1kg',2,1.99,3.98),
(2,5,'Bananes Bio 1kg',2,2.15,4.30),
(2,10,'Tomates Coeur de Boeuf 500g',1,3.50,3.50),
(2,29,'Pates Spaghetti Bio 500g',1,2.20,2.20),
(2,31,'Tomates Pelees Entieres 400g',2,1.15,2.30),
(2,34,'Moutarde de Dijon Forte 200g',1,2.40,2.40),
(3,1,'Fraises Bio 500g',2,4.50,9.00),
(3,26,'Pain au Levain Artisanal 400g',1,3.50,3.50),
(3,14,'Steak Hache 5% MG x4',1,7.90,7.90),
(4,19,'Saumon Atlantique 400g',2,8.90,17.80),
(4,21,'Camembert de Normandie AOP 250g',1,4.90,4.90),
(4,36,'Jus Orange Presse 1L',2,3.60,7.20),
(5,39,'Quinoa Blanc Bio 500g',1,4.90,4.90),
(5,40,'Chocolat Noir 85% Bio 100g',2,3.90,7.80);

INSERT INTO paiement (id_commande,methode_paiement,statut_paiement) VALUES
(1,'carte','paye'),(2,'a_la_livraison','paye'),(3,'carte','paye'),
(4,'carte','paye'),(5,'a_la_livraison','en_attente');

INSERT INTO historique_stock (id_produit,type_mouvement,quantite,quantite_avant,quantite_apres,id_admin,id_commande) VALUES
(15,'sortie',1,21,20,1,1),(37,'sortie',1,61,60,1,1),
(5,'sortie',2,302,300,1,2),(1,'sortie',2,97,95,1,3),
(19,'sortie',2,27,25,1,4),(1,'entree',50,45,95,1,NULL),
(3,'entree',100,100,200,1,NULL),(28,'entree',100,100,200,1,NULL),
(31,'entree',200,100,300,1,NULL),(40,'ajustement',2,2,4,2,NULL);
