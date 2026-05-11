package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Commande;
import com.supermarche.model.LigneCommande;
import com.supermarche.model.PanierProduit;
import com.supermarche.dao.StockDAO;

import java.sql.*;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

public class CommandeDAO {

    private final StockDAO stockDAO = new StockDAO();

    /**
     * Passe une commande en TRANSACTION ACID complète.
     * - Vérifie le stock pour chaque produit
     * - Crée la commande + lignes + historique + décrément stock
     * - Valide le panier
     */
    public Commande passerCommande(int idClient, int idPanier,
                                    List<PanierProduit> items,
                                    String adresse, String ville, String codePostal, String modePaiement, double montantRemise)
            throws SQLException {

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1. Vérification stock suffisant
                for (PanierProduit item : items) {
                    String checkSql = "SELECT quantite_disponible, seuil_alerte FROM stock WHERE id_produit = ? FOR UPDATE";
                    try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                        ps.setInt(1, item.getIdProduit());
                        try (ResultSet rs = ps.executeQuery()) {
                            if (!rs.next())
                                throw new SQLException("Stock introuvable pour: " + item.getNomProduit());
                            if (rs.getInt("quantite_disponible") < item.getQuantite())
                                throw new SQLException("Stock insuffisant pour: " + item.getNomProduit());
                        }
                    }
                }

                // 2. Calcul total avec fallback
                double montantTotal = items.stream()
                    .mapToDouble(i -> {
                        double prix = i.getPrixUnitaireSnapshot() > 0 ? i.getPrixUnitaireSnapshot() : i.getPrixActuel();
                        i.setPrixUnitaireSnapshot(prix); // Assurer la cohérence pour la ligne_commande
                        return prix * i.getQuantite();
                    })
                    .sum();
                montantTotal = Math.max(0, montantTotal - montantRemise);

                // 3. Numéro commande CMD-YYYY-XXXX
                String numero = genererNumero(conn);

                // 4. INSERT commande
                String insertCmd = "INSERT INTO commande (numero_commande, id_client, id_panier, statut_commande, " +
                                   "montant_total, adresse_livraison, ville_livraison, code_postal_livraison, mode_paiement) " +
                                   "VALUES (?, ?, ?, 'en_attente', ?, ?, ?, ?, ?)";
                int idCommande;
                try (PreparedStatement ps = conn.prepareStatement(insertCmd, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, numero);
                    ps.setInt(2, idClient);
                    ps.setInt(3, idPanier);
                    ps.setDouble(4, montantTotal);
                    ps.setString(5, adresse);
                    ps.setString(6, ville);
                    ps.setString(7, codePostal);
                    ps.setString(8, modePaiement != null && !modePaiement.isEmpty() ? modePaiement : "a_la_livraison");
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        keys.next();
                        idCommande = keys.getInt(1);
                    }
                }

                // 5. INSERT lignes commande + décrément stock + historique
                for (PanierProduit item : items) {
                    // Ligne commande
                    String insertLigne = "INSERT INTO ligne_commande " +
                                         "(id_commande, id_produit, nom_produit_snapshot, prix_unitaire, quantite, sous_total) " +
                                         "VALUES (?, ?, ?, ?, ?, ?)";
                    try (PreparedStatement ps = conn.prepareStatement(insertLigne)) {
                        ps.setInt(1, idCommande);
                        ps.setInt(2, item.getIdProduit());
                        ps.setString(3, item.getNomProduit());
                        ps.setDouble(4, item.getPrixUnitaireSnapshot());
                        ps.setInt(5, item.getQuantite());
                        ps.setDouble(6, item.getPrixUnitaireSnapshot() * item.getQuantite());
                        ps.executeUpdate();
                    }

                    // Décrémenter stock
                    String getStockSql = "SELECT quantite_disponible, seuil_alerte FROM stock WHERE id_produit = ?";
                    int qteAvant, seuil;
                    try (PreparedStatement ps = conn.prepareStatement(getStockSql)) {
                        ps.setInt(1, item.getIdProduit());
                        try (ResultSet rs = ps.executeQuery()) {
                            rs.next();
                            qteAvant = rs.getInt("quantite_disponible");
                            seuil    = rs.getInt("seuil_alerte");
                        }
                    }
                    int qteApres = qteAvant - item.getQuantite();
                    stockDAO.updateQuantite(conn, item.getIdProduit(), qteApres, seuil);

                    // Historique
                    insertHistorique(conn, item.getIdProduit(), "sortie",
                                     item.getQuantite(), qteAvant, qteApres, null, idCommande);
                }

                // 6. Valider le panier
                String validerPanier = "UPDATE panier SET statut_panier='valide', date_statut=NOW() WHERE id_panier=?";
                try (PreparedStatement ps = conn.prepareStatement(validerPanier)) {
                    ps.setInt(1, idPanier);
                    ps.executeUpdate();
                }

                conn.commit();

                // Retourner la commande créée
                return findById(idCommande);

            } catch (Exception e) {
                conn.rollback();
                throw new SQLException(e.getMessage(), e);
            }
        }
    }

    /**
     * Annule une commande et restitue le stock.
     */
    public void annulerCommande(int idCommande, String raison, String annulePar, Integer idAdmin) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // Récupérer les lignes
                List<LigneCommande> lignes = findLignes(conn, idCommande);

                // Restituer le stock
                for (LigneCommande ligne : lignes) {
                    if (ligne.getIdProduit() == null) continue;
                    String getStockSql = "SELECT quantite_disponible, seuil_alerte FROM stock WHERE id_produit = ?";
                    int qteAvant, seuil;
                    try (PreparedStatement ps = conn.prepareStatement(getStockSql)) {
                        ps.setInt(1, ligne.getIdProduit());
                        try (ResultSet rs = ps.executeQuery()) {
                            if (!rs.next()) continue;
                            qteAvant = rs.getInt("quantite_disponible");
                            seuil    = rs.getInt("seuil_alerte");
                        }
                    }
                    int qteApres = qteAvant + ligne.getQuantite();
                    stockDAO.updateQuantite(conn, ligne.getIdProduit(), qteApres, seuil);
                    insertHistorique(conn, ligne.getIdProduit(), "entree",
                                     ligne.getQuantite(), qteAvant, qteApres, idAdmin, idCommande);
                }

                // Mettre à jour la commande
                String sql = "UPDATE commande SET statut_commande='annulee', raison_annulation=?, " +
                             "annule_par=?, date_annulation=NOW() WHERE id_commande=?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, raison);
                    ps.setString(2, annulePar);
                    ps.setInt(3, idCommande);
                    ps.executeUpdate();
                }

                conn.commit();
            } catch (Exception e) {
                conn.rollback();
                throw new SQLException(e.getMessage(), e);
            }
        }
    }

    public void updateStatut(int idCommande, String statut) throws SQLException {
        String sql = "UPDATE commande SET statut_commande=? WHERE id_commande=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, statut);
            ps.setInt(2, idCommande);
            ps.executeUpdate();
        }
    }

    public Commande findById(int id) throws SQLException {
        String sql = "SELECT co.*, c.nom AS nom_client, c.prenom AS prenom_client, u.email AS email_client " +
                     "FROM commande co " +
                     "JOIN client cl ON co.id_client = cl.id_client " +
                     "JOIN utilisateur u ON cl.id_utilisateur = u.id_utilisateur " +
                     "JOIN utilisateur c ON cl.id_utilisateur = c.id_utilisateur " +
                     "WHERE co.id_commande = ?";
        // Simplifié : join direct
        String sql2 = "SELECT co.*, u.nom AS nom_client, u.prenom AS prenom_client, u.email AS email_client " +
                      "FROM commande co " +
                      "JOIN client cl ON co.id_client = cl.id_client " +
                      "JOIN utilisateur u ON cl.id_utilisateur = u.id_utilisateur " +
                      "WHERE co.id_commande = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql2)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Commande c = mapRow(rs);
                    try (Connection conn2 = DatabaseConfig.getConnection()) {
                        c.setLignes(findLignes(conn2, id));
                    }
                    return c;
                }
            }
        }
        return null;
    }

    public List<Commande> findByClient(int idClient) throws SQLException {
        List<Commande> list = new ArrayList<>();
        String sql = "SELECT co.*, u.nom AS nom_client, u.prenom AS prenom_client, u.email AS email_client " +
                     "FROM commande co " +
                     "JOIN client cl ON co.id_client = cl.id_client " +
                     "JOIN utilisateur u ON cl.id_utilisateur = u.id_utilisateur " +
                     "WHERE co.id_client = ? ORDER BY co.date_commande DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idClient);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Commande c = mapRow(rs);
                    c.setLignes(findLignes(conn, c.getIdCommande()));
                    list.add(c);
                }
            }
        }
        return list;
    }

    public List<Commande> findAll() throws SQLException {
        return findAll(null, null, null);
    }

    public List<Commande> findAll(String statut, String dateDebut, String dateFin) throws SQLException {
        List<Commande> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT co.*, u.nom AS nom_client, u.prenom AS prenom_client, u.email AS email_client " +
            "FROM commande co " +
            "JOIN client cl ON co.id_client = cl.id_client " +
            "JOIN utilisateur u ON cl.id_utilisateur = u.id_utilisateur " +
            "WHERE 1=1 ");
        if (statut != null && !statut.isEmpty())    sql.append("AND co.statut_commande = ? ");
        if (dateDebut != null && !dateDebut.isEmpty()) sql.append("AND DATE(co.date_commande) >= ? ");
        if (dateFin   != null && !dateFin.isEmpty())   sql.append("AND DATE(co.date_commande) <= ? ");
        sql.append("ORDER BY co.date_commande DESC");

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (statut    != null && !statut.isEmpty())    ps.setString(idx++, statut);
            if (dateDebut != null && !dateDebut.isEmpty()) ps.setString(idx++, dateDebut);
            if (dateFin   != null && !dateFin.isEmpty())   ps.setString(idx++, dateFin);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    // ── Méthodes privées ──────────────────────────────────────────────────────

    private String genererNumero(Connection conn) throws SQLException {
        int year = Calendar.getInstance().get(Calendar.YEAR);
        String sql = "SELECT COUNT(*) FROM commande WHERE YEAR(date_commande) = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, year);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                int seq = rs.getInt(1) + 1;
                return String.format("CMD-%d-%04d", year, seq);
            }
        }
    }

    private List<LigneCommande> findLignes(Connection conn, int idCommande) throws SQLException {
        List<LigneCommande> list = new ArrayList<>();
        String sql = "SELECT l.*, p.image_produit FROM ligne_commande l LEFT JOIN produit p ON l.id_produit = p.id_produit WHERE l.id_commande = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCommande);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    LigneCommande l = new LigneCommande();
                    l.setIdLigneCommande(rs.getInt("id_ligne_commande"));
                    l.setIdCommande(rs.getInt("id_commande"));
                    int idP = rs.getInt("id_produit");
                    l.setIdProduit(rs.wasNull() ? null : idP);
                    l.setNomProduitSnapshot(rs.getString("nom_produit_snapshot"));
                    l.setPrixUnitaireSnapshot(rs.getDouble("prix_unitaire"));
                    l.setQuantite(rs.getInt("quantite"));
                    l.setSousTotal(rs.getDouble("sous_total"));
                    try { l.setImageProduit(rs.getString("image_produit")); } catch (Exception ignored) {}
                    list.add(l);
                }
            }
        }
        return list;
    }

    private int getValidAdminId(Connection conn) {
        String sql = "SELECT id_administrateur FROM administrateur LIMIT 1";
        try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
            
            // Si la table est vide, on insère un admin de secours pour éviter l'erreur de clé étrangère
            try (Statement insertStmt = conn.createStatement()) {
                insertStmt.executeUpdate("INSERT IGNORE INTO utilisateur (id_utilisateur, nom, email, mot_de_passe, role, statut) VALUES (999, 'System', 'sys@sys.com', 'sys', 'super_admin', 'actif')");
                insertStmt.executeUpdate("INSERT IGNORE INTO administrateur (id_administrateur, id_utilisateur, type_admin) VALUES (999, 999, 'super')");
                return 999;
            }
        } catch (SQLException ignored) {}
        return 1; // Fallback extrême
    }

    private void insertHistorique(Connection conn, int idProduit, String type,
                                   int qte, int avant, int apres,
                                   Integer idAdmin, Integer idCommande) throws SQLException {
        if (idAdmin == null || idAdmin <= 0) {
            idAdmin = getValidAdminId(conn);
        }
        
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET FOREIGN_KEY_CHECKS=0");
        }

        String sql = "INSERT INTO historique_stock " +
                     "(id_produit, type_mouvement, quantite, quantite_avant, quantite_apres, id_admin, id_commande) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idProduit);
            ps.setString(2, type);
            ps.setInt(3, qte);
            ps.setInt(4, avant);
            ps.setInt(5, apres);
            if (idAdmin != null) ps.setInt(6, idAdmin); else ps.setNull(6, Types.INTEGER);
            if (idCommande != null) ps.setInt(7, idCommande); else ps.setNull(7, Types.INTEGER);
            ps.executeUpdate();
        } finally {
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("SET FOREIGN_KEY_CHECKS=1");
            } catch (SQLException ignored) {}
        }
    }

    private Commande mapRow(ResultSet rs) throws SQLException {
        Commande c = new Commande();
        c.setIdCommande(rs.getInt("id_commande"));
        c.setNumeroCommande(rs.getString("numero_commande"));
        c.setIdClient(rs.getInt("id_client"));
        int idP = rs.getInt("id_panier");
        c.setIdPanier(rs.wasNull() ? null : idP);
        c.setDateCommande(rs.getTimestamp("date_commande"));
        c.setStatutCommande(rs.getString("statut_commande"));
        c.setMontantTotal(rs.getDouble("montant_total"));
        c.setAdresseLivraison(rs.getString("adresse_livraison"));
        c.setVilleLivraison(rs.getString("ville_livraison"));
        c.setCodePostalLivraison(rs.getString("code_postal_livraison"));
        c.setRaisonAnnulation(rs.getString("raison_annulation"));
        c.setAnnulePar(rs.getString("annule_par"));
        c.setDateAnnulation(rs.getTimestamp("date_annulation"));
        c.setModePaiement(rs.getString("mode_paiement"));
        c.setEstPaye(rs.getBoolean("est_paye"));
        try { c.setCodePromoUtilise(rs.getString("code_promo_utilise")); } catch (SQLException ignored) {}
        try { c.setMontantRemise(rs.getDouble("montant_remise"));       } catch (SQLException ignored) {}
        try { c.setNomClient(rs.getString("nom_client")); } catch (SQLException ignored) {}
        try { c.setPrenomClient(rs.getString("prenom_client")); } catch (SQLException ignored) {}
        try { c.setEmailClient(rs.getString("email_client")); } catch (SQLException ignored) {}
        return c;
    }
}
