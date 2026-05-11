SET NAMES utf8mb4;
USE supermarche_jee;

-- Add 60 more products (IDs 41-100)
INSERT INTO produit (id_produit,id_categorie,nom_produit,description,prix,image_produit,actif) VALUES
-- Fruits suite (cat 9)
(41,9,'Ananas Victoria','Ananas de la Reunion, sucre et parfume. Sans fibres dures, ideal nature.',3.50,'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?auto=format&fit=crop&q=80&w=800',1),
(42,9,'Mangue Alphonso 1kg','Mangue indienne variete Alphonso, reine des mangues. Pulpe onctueuse.',5.90,'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800',1),
(43,9,'Kiwis Gold x4','Kiwis a chair jaune, deux fois plus sucres que le kiwi vert.',3.20,'https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&q=80&w=800',1),
(44,9,'Raisin Blanc Muscat 500g','Raisin Muscat de Hambourg, grains fermes et sucres. Vendanges manuelles.',4.80,'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=800',1),
(45,9,'Pasteque Mini 1kg','Mini pasteque sans pepins, chair rouge gorgee de soleil. Rafraichissante.',3.90,'https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&q=80&w=800',1),
(46,9,'Peches Blanches x4','Peches blanches de vigne, peau veloutee, chair juteuse. Maturite parfaite.',3.60,'https://images.unsplash.com/photo-1595421933521-e47c7e9c2e23?auto=format&fit=crop&q=80&w=800',1),
(47,9,'Cerises Burlat 500g','Cerises burlat du Gard, calibre extra. Gout sucre avec note acidulee.',5.50,'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&q=80&w=800',1),
(48,9,'Figues Fraiches x4','Figues violettes de Provence, miel naturel en bouche. Saison limitee.',4.20,'https://images.unsplash.com/photo-1601379329542-31c59347e2b4?auto=format&fit=crop&q=80&w=800',1),
-- Legumes suite (cat 10)
(49,10,'Brocoli Bio 400g','Brocoli vert extra-frais, riche en vitamines. A cuire al dente pour garder ses nutriments.',2.50,'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?auto=format&fit=crop&q=80&w=800',1),
(50,10,'Epinards Frais 200g','Pousses d epinards tendres, ideales en salade ou sautes au beurre.',2.90,'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',1),
(51,10,'Poivrons Tricolores x3','Un rouge, un jaune, un vert. Croquants et sucres, parfaits en wok.',3.20,'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800',1),
(52,10,'Concombres Bio x2','Concombres bio croquants, ideaux pour tzatziki et salades estivales.',1.90,'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&q=80&w=800',1),
(53,10,'Aubergines Rondes x2','Aubergines rondes violettes, ideal pour ratatouille et caviar.',2.40,'https://images.unsplash.com/photo-1639181010073-1e6b78f1fd94?auto=format&fit=crop&q=80&w=800',1),
(54,10,'Pommes de Terre Grenaille 500g','Pommes de terre grenaille a la peau fine. A rotir entieres avec herbes.',1.80,'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800',1),
(55,10,'Oignons Doux 1kg','Oignons doux des Cevennes, sans piquant excessif. Ideaux crus et cuits.',1.60,'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=800',1),
(56,10,'Ail Rose de Lautrec Tete','Ail rose Label Rouge de Lautrec. Saveur douce et parfumee, conservation longue.',1.90,'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=800',1),
(57,11,'Basilic Frais Pot','Pot de basilic frais, parfum intense. Pour pesto, pizzas et salades caprese.',2.50,'https://images.unsplash.com/photo-1465358523009-2e3c8e8e6b23?auto=format&fit=crop&q=80&w=800',1),
(58,11,'Coriandre Fraiche Botte','Botte de coriandre fraiche. Indispensable pour les cuisines asiatiques et mexicaines.',1.80,'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&q=80&w=800',1),
-- Viandes suite (cat 12)
(59,12,'Filet de Boeuf 300g','Filet de boeuf mature 21 jours, le morceau le plus tendre. Pour les grandes occasions.',22.90,'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800',1),
(60,12,'Côtelettes d Agneau x4','Cotes d agneau tendres, provenance France. A griller avec herbes de Provence.',13.50,'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=800',1),
(61,12,'Lardons Fumes 200g','Lardons de poitrine fumee artisanale. Pour gratins, salades et pasta.',2.80,'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=800',1),
(62,12,'Merguez Agneau x6','Merguez artisanales 100% agneau, epices orientales. Ideales au barbecue.',5.90,'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800',1),
(63,13,'Dinde Escalope x2 300g','Escalopes de dinde fines, tendres et maigres. A cuisiner en 10 minutes.',5.40,'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800',1),
(64,13,'Canard Magret 350g','Magret de canard fermier des Landes. A cuire cote peau d abord.',8.90,'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800',1),
-- Poissons suite (cat 14)
(65,14,'Cabillaud Dos 300g','Dos de cabillaud ultra frais, chair blanche et feuilletee. Sans aretes.',9.50,'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=800',1),
(66,14,'Thon Rouge Steak 200g','Steak de thon rouge de Mediterranee. A mi-cuisson pour garder le moelleux.',11.90,'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',1),
(67,14,'Moules Bouchot 1kg','Moules de bouchot Label Rouge, chair pleine et iodee. Pretes a cuire.',4.90,'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=800',1),
-- Fromages suite (cat 15)
(68,15,'Mozzarella di Bufala 125g','Mozzarella de bufflonne AOP Campanie. Fondante, lactee, parfaite caprese.',3.90,'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800',1),
(69,15,'Roquefort AOP 100g','Roquefort Societé AOP, affine en caves naturelles. Persille crémeux et puissant.',4.50,'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800',1),
(70,15,'Chevre Frais 150g','Buche de chevre frais, lactique et douce. Sur du pain grille avec miel.',3.20,'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=800',1),
-- Yaourts suite (cat 16)
(71,16,'Fromage Blanc 0% 500g','Fromage blanc battu leger, riche en proteines. Ideal petit-dejeuner et desserts.',2.20,'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&q=80&w=800',1),
(72,16,'Creme Dessert Chocolat x4','Cremes dessert saveur chocolat noir. Onctueux, sans colorants artificiels.',2.90,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800',1),
(73,16,'Lait Entier Bio 1L','Lait entier bio de vaches elevees en plein air. Non homogeneise, creme naturelle.',1.80,'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800',1),
(74,16,'Oeufs Bio Label Rouge x12','12 oeufs de poules elevees en plein air, nourries bio. Jaune intense.',4.50,'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800',1),
-- Boulangerie suite (cat 4)
(75,4,'Pain Complet aux Graines','Pain complet avec graines de tournesol et sesame. Riche en fibres.',2.80,'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',1),
(76,4,'Brioche Feuilletee 400g','Brioche au beurre AOP, moelleuse et filante. La reine des brioches du dimanche.',4.50,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',1),
(77,4,'Pain de Campagne 600g','Miche de campagne au levain naturel, mie irreguliere et savoureuse.',3.80,'https://images.unsplash.com/photo-1549931319-a545dcf3bc7e?auto=format&fit=crop&q=80&w=800',1),
-- Epicerie suite (cat 18-20)
(78,18,'Tagliatelles Fraiches 250g','Pates fraiches aux oeufs artisanales. Cuisson 3 minutes, texture al dente.',3.20,'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=800',1),
(79,18,'Couscous Fin 500g','Semoule de ble dur extra-fine. Gonfle a la perfection en 5 minutes.',1.80,'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',1),
(80,19,'Pois Chiches Bio 400g','Pois chiches cuits bio en conserve. Directs en houmous ou salades.',1.50,'https://images.unsplash.com/photo-1612257999756-5b0c4174b3bd?auto=format&fit=crop&q=80&w=800',1),
(81,19,'Haricots Blancs 400g','Haricots blancs cuisines, tendres et savoureux. Base du cassoulet traditionnel.',1.20,'https://images.unsplash.com/photo-1546470427-0d4b304f7fc6?auto=format&fit=crop&q=80&w=800',1),
(82,20,'Vinaigre Balsamique Modene 250ml','Vinaigre balsamique IGP Modene. 5 ans de vieillissement, doux et sirupeux.',6.90,'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',1),
(83,20,'Sauce Soja 150ml','Sauce soja japonaise naturellement fermentee 18 mois. Umami intense.',3.50,'https://images.unsplash.com/photo-1535485822756-c3af3a21c90c?auto=format&fit=crop&q=80&w=800',1),
(84,20,'Miel de Lavande 250g','Miel de fleurs de lavande de Provence, recolte artisanal. Floral et doux.',8.50,'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&q=80&w=800',1),
(85,20,'Confiture Abricot 370g','Confiture extra d abricots du Roussillon. 70% de fruits, peu de sucre.',4.20,'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800',1),
-- Boissons suite (cat 21-23)
(86,21,'Limonade Artisanale 75cl','Limonade artisanale au citron de Menton. Piquante et rafraichissante.',3.80,'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&q=80&w=800',1),
(87,21,'Smoothie Mangue Passion 500ml','Smoothie 100% pur jus, sans sucre ajoute. Mangue Alphonso et fruit de la passion.',4.50,'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=800',1),
(88,22,'Champagne Brut 75cl','Champagne brut NV, assemblage Pinot Noir et Chardonnay. Bulles fines et elegantes.',24.90,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',1),
(89,22,'Biere Artisanale IPA 33cl','IPA artisanale brasserie locale. Amere, fruitee, aromes d agrumes et pin.',2.80,'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?auto=format&fit=crop&q=80&w=800',1),
(90,23,'Cafe en Grains 250g','Cafe 100% Arabica Guatemala, torrefaction artisanale. Notes chocolat et caramel.',9.90,'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=800',1),
(91,23,'The Earl Grey Bio 40 sachets','The noir bergamote bio. Feuilles selectionnees, infusion 4 minutes.',5.50,'https://images.unsplash.com/photo-1597481499666-5492831427f4?auto=format&fit=crop&q=80&w=800',1),
(92,23,'Lait d Amande 1L','Boisson a l amande sans sucre ajoute. Alternative vegetale onctueuse.',2.90,'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',1),
-- Bio suite (cat 24-25)
(93,24,'Granola Noisette Bio 500g','Granola croustillant aux noisettes et miel. Sans additifs, au four artisanal.',5.90,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',1),
(94,24,'Flocons d Avoine Bio 500g','Avoine complete bio, gros flocons. Porridge energetique du matin.',2.40,'https://images.unsplash.com/photo-1584398800886-2e1e9a9a2041?auto=format&fit=crop&q=80&w=800',1),
(95,24,'Huile de Coco Bio 250ml','Huile de coco vierge premiere pression. Ideal cuisine haute temperature.',7.90,'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',1),
(96,25,'Proteine Whey Vanille 500g','Proteine de lactosérum bio, gout vanille naturelle. 24g de proteine par dose.',28.90,'https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=800',1),
(97,25,'Barres Energetiques x6','6 barres aux fruits et noix, sans gluten. Ideal avant le sport.',9.50,'https://images.unsplash.com/photo-1490914327404-5c4e7c3e02d6?auto=format&fit=crop&q=80&w=800',1),
(98,8,'Spiruline Bio 100g','Spiruline en poudre certifie bio. Superaliment riche en proteines et vitamines.',14.90,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',1),
-- Surgeles (cat 7)
(99,7,'Pizza Margherita 400g','Pizza surgele, base tomate, mozarella fior di latte. Au four 12 minutes.',4.90,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',1),
(100,7,'Glace Vanille 500ml','Glace a la vanille de Madagascar, gousses entieres. Onctuosite cremiere.',5.50,'https://images.unsplash.com/photo-1500935623401-3ded52a7c0c4?auto=format&fit=crop&q=80&w=800',1);

-- Stocks for new products
INSERT INTO stock (id_produit,quantite_disponible,seuil_alerte,statut_stock) VALUES
(41,85,12,'disponible'),(42,40,8,'disponible'),(43,120,15,'disponible'),
(44,60,10,'disponible'),(45,45,8,'disponible'),(46,55,10,'disponible'),
(47,30,6,'disponible'),(48,25,5,'disponible'),(49,90,15,'disponible'),
(50,70,12,'disponible'),(51,80,12,'disponible'),(52,100,15,'disponible'),
(53,65,10,'disponible'),(54,200,25,'disponible'),(55,180,25,'disponible'),
(56,150,20,'disponible'),(57,60,10,'disponible'),(58,50,8,'disponible'),
(59,15,3,'disponible'),(60,20,4,'disponible'),(61,90,15,'disponible'),
(62,45,8,'disponible'),(63,70,12,'disponible'),(64,25,5,'disponible'),
(65,30,6,'disponible'),(66,20,4,'disponible'),(67,55,10,'disponible'),
(68,50,8,'disponible'),(69,40,8,'disponible'),(70,65,10,'disponible'),
(71,100,15,'disponible'),(72,80,12,'disponible'),(73,200,30,'disponible'),
(74,120,20,'disponible'),(75,90,15,'disponible'),(76,60,10,'disponible'),
(77,75,12,'disponible'),(78,80,12,'disponible'),(79,150,20,'disponible'),
(80,200,25,'disponible'),(81,180,25,'disponible'),(82,70,10,'disponible'),
(83,90,15,'disponible'),(84,45,8,'disponible'),(85,55,10,'disponible'),
(86,100,15,'disponible'),(87,80,12,'disponible'),(88,30,5,'disponible'),
(89,150,20,'disponible'),(90,60,10,'disponible'),(91,80,12,'disponible'),
(92,120,20,'disponible'),(93,70,12,'disponible'),(94,160,25,'disponible'),
(95,50,8,'disponible'),(96,35,6,'disponible'),(97,60,10,'disponible'),
(98,40,6,'disponible'),(99,80,12,'disponible'),(100,45,8,'disponible');

-- Add AdminClientsPage missing route fix
SELECT COUNT(*) AS total_produits FROM produit;
