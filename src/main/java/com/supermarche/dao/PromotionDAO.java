package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Promotion;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PromotionDAO {

    // ── Toutes les promotions (admin) ────────────────────────────────────────
    public List<Promotion> findAll() throws SQLException {
        List<Promotion> list = new ArrayList<>();
        String sql = "SELECT pr.*, GROUP_CONCAT(pp.id_produit) AS ids_produits, " +
                     "GROUP_CONCAT(p.nom_produit SEPARATOR '||') AS noms_produits " +
                     "FROM promotion pr " +
                     "LEFT JOIN promotion_produit pp ON pp.id_promotion = pr.id_promotion " +
                     "LEFT JOIN produit p ON p.id_produit = pp.id_produit " +
                     "GROUP BY pr.id_promotion ORDER BY pr.date_creation DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    // ── Promotions actives pour la page client ───────────────────────────────
    public List<Promotion> findActives() throws SQLException {
        List<Promotion> list = new ArrayList<>();
        String sql = "SELECT pr.*, GROUP_CONCAT(pp.id_produit) AS ids_produits, " +
                     "GROUP_CONCAT(p.nom_produit SEPARATOR '||') AS noms_produits " +
                     "FROM promotion pr " +
                     "LEFT JOIN promotion_produit pp ON pp.id_promotion = pr.id_promotion " +
                     "LEFT JOIN produit p ON p.id_produit = pp.id_produit " +
                     "WHERE pr.actif = TRUE AND pr.date_debut <= CURDATE() AND pr.date_fin >= CURDATE() " +
                     "GROUP BY pr.id_promotion ORDER BY pr.date_creation DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    // ── Produits en promotion (vue enrichie pour page client) ────────────────
    public List<java.util.Map<String,Object>> findProduitsEnPromotion() throws SQLException {
        List<java.util.Map<String,Object>> list = new ArrayList<>();
        String sql = "SELECT p.id_produit, p.nom_produit, p.prix AS prix_original, " +
                     "ROUND(p.prix*(1-pr.pourcentage/100),2) AS prix_promo, " +
                     "pr.pourcentage, pr.nom_promotion, pr.id_promotion, pr.date_fin, " +
                     "c.nom_categorie, p.image_produit, s.quantite_disponible " +
                     "FROM produit p " +
                     "JOIN promotion_produit pp ON pp.id_produit = p.id_produit " +
                     "JOIN promotion pr ON pr.id_promotion = pp.id_promotion " +
                     "LEFT JOIN categorie c ON c.id_categorie = p.id_categorie " +
                     "LEFT JOIN stock s ON s.id_produit = p.id_produit " +
                     "WHERE p.actif=TRUE AND pr.actif=TRUE " +
                     "AND pr.date_debut<=CURDATE() AND pr.date_fin>=CURDATE() " +
                     "ORDER BY pr.pourcentage DESC, p.nom_produit";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            ResultSetMetaData meta = rs.getMetaData();
            int cols = meta.getColumnCount();
            while (rs.next()) {
                java.util.Map<String,Object> row = new java.util.LinkedHashMap<>();
                for (int i = 1; i <= cols; i++) {
                    row.put(meta.getColumnLabel(i), rs.getObject(i));
                }
                list.add(row);
            }
        }
        return list;
    }

    // ── Prix promo actif pour un produit donné ───────────────────────────────
    /**
     * Retourne le prix avec promotion si une promo active existe pour ce produit,
     * sinon retourne prixOriginal.
     * Requête SQL directe pour performance maximale.
     */
    public double getPrixPromoActif(int idProduit, double prixOriginal) throws SQLException {
        String sql = "SELECT ROUND(? * (1 - pr.pourcentage / 100), 2) AS prix_promo " +
                     "FROM promotion pr " +
                     "JOIN promotion_produit pp ON pp.id_promotion = pr.id_promotion " +
                     "WHERE pp.id_produit = ? " +
                     "  AND pr.actif = TRUE " +
                     "  AND pr.date_debut <= CURDATE() " +
                     "  AND pr.date_fin   >= CURDATE() " +
                     "ORDER BY pr.pourcentage DESC " +
                     "LIMIT 1";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, prixOriginal);
            ps.setInt(2, idProduit);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getDouble("prix_promo");
            }
        }
        return prixOriginal; // Pas de promo → prix normal
    }

    // ── Create ───────────────────────────────────────────────────────────────
    public int create(Promotion pr, List<Integer> idsProduits) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                String sql = "INSERT INTO promotion (nom_promotion, description, pourcentage, date_debut, date_fin, actif, id_admin_createur) " +
                             "VALUES (?, ?, ?, ?, ?, ?, ?)";
                int id;
                try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, pr.getNomPromotion());
                    ps.setString(2, pr.getDescription());
                    ps.setDouble(3, pr.getPourcentage());
                    ps.setDate(4, pr.getDateDebut() != null ? new java.sql.Date(pr.getDateDebut().getTime()) : java.sql.Date.valueOf(java.time.LocalDate.now()));
                    ps.setDate(5, pr.getDateFin() != null ? new java.sql.Date(pr.getDateFin().getTime()) : java.sql.Date.valueOf(java.time.LocalDate.now().plusDays(7)));
                    ps.setBoolean(6, pr.isActif());
                    if (pr.getIdAdminCreateur() != null) ps.setInt(7, pr.getIdAdminCreateur()); else ps.setNull(7, Types.INTEGER);
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) { keys.next(); id = keys.getInt(1); }
                }
                // Associate products
                if (idsProduits != null && !idsProduits.isEmpty()) {
                    String linkSql = "INSERT IGNORE INTO promotion_produit (id_promotion, id_produit) VALUES (?, ?)";
                    try (PreparedStatement ps = conn.prepareStatement(linkSql)) {
                        for (int idP : idsProduits) {
                            ps.setInt(1, id); ps.setInt(2, idP); ps.addBatch();
                        }
                        ps.executeBatch();
                    }
                }
                conn.commit();
                return id;
            } catch (Exception e) {
                conn.rollback();
                throw new SQLException(e.getMessage(), e);
            }
        }
    }

    // ── Update ───────────────────────────────────────────────────────────────
    public void update(Promotion pr, List<Integer> idsProduits) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                String sql = "UPDATE promotion SET nom_promotion=?, description=?, pourcentage=?, " +
                             "date_debut=?, date_fin=?, actif=? WHERE id_promotion=?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, pr.getNomPromotion());
                    ps.setString(2, pr.getDescription());
                    ps.setDouble(3, pr.getPourcentage());
                    ps.setDate(4, new java.sql.Date(pr.getDateDebut().getTime()));
                    ps.setDate(5, new java.sql.Date(pr.getDateFin().getTime()));
                    ps.setBoolean(6, pr.isActif());
                    ps.setInt(7, pr.getIdPromotion());
                    ps.executeUpdate();
                }
                // Replace product links
                try (PreparedStatement ps = conn.prepareStatement("DELETE FROM promotion_produit WHERE id_promotion=?")) {
                    ps.setInt(1, pr.getIdPromotion()); ps.executeUpdate();
                }
                if (idsProduits != null && !idsProduits.isEmpty()) {
                    try (PreparedStatement ps = conn.prepareStatement("INSERT IGNORE INTO promotion_produit (id_promotion, id_produit) VALUES (?,?)")) {
                        for (int idP : idsProduits) { ps.setInt(1, pr.getIdPromotion()); ps.setInt(2, idP); ps.addBatch(); }
                        ps.executeBatch();
                    }
                }
                conn.commit();
            } catch (Exception e) { conn.rollback(); throw new SQLException(e.getMessage(), e); }
        }
    }

    // ── Delete ───────────────────────────────────────────────────────────────
    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM promotion WHERE id_promotion=?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id); ps.executeUpdate();
        }
    }

    // ── Toggle actif ─────────────────────────────────────────────────────────
    public void toggleActif(int id, boolean actif) throws SQLException {
        String sql = "UPDATE promotion SET actif=? WHERE id_promotion=?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, actif); ps.setInt(2, id); ps.executeUpdate();
        }
    }

    private Promotion mapRow(ResultSet rs) throws SQLException {
        Promotion pr = new Promotion();
        pr.setIdPromotion(rs.getInt("id_promotion"));
        pr.setNomPromotion(rs.getString("nom_promotion"));
        pr.setDescription(rs.getString("description"));
        pr.setPourcentage(rs.getDouble("pourcentage"));
        pr.setDateDebut(rs.getDate("date_debut"));
        pr.setDateFin(rs.getDate("date_fin"));
        pr.setActif(rs.getBoolean("actif"));
        int admin = rs.getInt("id_admin_createur");
        pr.setIdAdminCreateur(rs.wasNull() ? null : admin);
        pr.setDateCreation(rs.getTimestamp("date_creation"));

        // Products
        String idsStr = rs.getString("ids_produits");
        String nomsStr = rs.getString("noms_produits");
        if (idsStr != null) {
            List<Integer> ids = new ArrayList<>();
            for (String s : idsStr.split(",")) { try { ids.add(Integer.parseInt(s.trim())); } catch(NumberFormatException ignored) {} }
            pr.setIdsProduits(ids);
        }
        if (nomsStr != null) {
            List<String> noms = new ArrayList<>();
            for (String s : nomsStr.split("\\|\\|")) noms.add(s.trim());
            pr.setNomsProduits(noms);
        }
        return pr;
    }
}
