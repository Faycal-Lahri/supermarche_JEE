package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Stock;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class StockDAO {

    /**
     * Initialise le stock d'un nouveau produit.
     */
    public void initStock(int idProduit, int quantite, int seuilAlerte) throws SQLException {
        String statut = computeStatut(quantite, seuilAlerte);
        String sql = "INSERT INTO stock (id_produit, quantite_disponible, seuil_alerte, statut_stock) " +
                     "VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idProduit);
            ps.setInt(2, quantite);
            ps.setInt(3, seuilAlerte);
            ps.setString(4, statut);
            ps.executeUpdate();
        }
    }

    public Stock findByProduit(int idProduit) throws SQLException {
        String sql = "SELECT s.*, p.nom_produit, p.prix, p.image_produit, c.nom_categorie " +
                     "FROM stock s " +
                     "JOIN produit p ON s.id_produit = p.id_produit " +
                     "LEFT JOIN categorie c ON p.id_categorie = c.id_categorie " +
                     "WHERE s.id_produit = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idProduit);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public List<Stock> findAll() throws SQLException {
        List<Stock> list = new ArrayList<>();
        String sql = "SELECT s.*, p.nom_produit, p.prix, p.image_produit, c.nom_categorie " +
                     "FROM stock s " +
                     "JOIN produit p ON s.id_produit = p.id_produit " +
                     "LEFT JOIN categorie c ON p.id_categorie = c.id_categorie " +
                     "WHERE p.actif = TRUE " +
                     "ORDER BY s.statut_stock, p.nom_produit";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    public List<Stock> findAlertes() throws SQLException {
        List<Stock> list = new ArrayList<>();
        String sql = "SELECT s.*, p.nom_produit, p.prix, p.image_produit, c.nom_categorie " +
                     "FROM stock s " +
                     "JOIN produit p ON s.id_produit = p.id_produit " +
                     "LEFT JOIN categorie c ON p.id_categorie = c.id_categorie " +
                     "WHERE s.statut_stock IN ('alerte','rupture') AND p.actif = TRUE " +
                     "ORDER BY s.quantite_disponible ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    /**
     * Met à jour la quantité (connexion fournie pour participer à une transaction externe).
     */
    public void updateQuantite(Connection conn, int idProduit, int nouvelleQte, int seuilAlerte) throws SQLException {
        String statut = computeStatut(nouvelleQte, seuilAlerte);
        String sql = "UPDATE stock SET quantite_disponible=?, statut_stock=? WHERE id_produit=?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, nouvelleQte);
            ps.setString(2, statut);
            ps.setInt(3, idProduit);
            ps.executeUpdate();
        }
    }

    /**
     * Réapprovisionne le stock (logique simple, sans transaction externe).
     */
    public Stock reapprovisionner(int idProduit, int quantiteAjout) throws SQLException {
        Stock stock = findByProduit(idProduit);
        if (stock == null) throw new SQLException("Stock introuvable pour produit " + idProduit);

        int nouvelleQte = stock.getQuantiteDisponible() + quantiteAjout;
        try (Connection conn = DatabaseConfig.getConnection()) {
            updateQuantite(conn, idProduit, nouvelleQte, stock.getSeuilAlerte());
        }
        return findByProduit(idProduit);
    }

    public static String computeStatut(int qte, int seuil) {
        if (qte == 0) return "rupture";
        if (qte <= seuil) return "alerte";
        return "disponible";
    }

    /**
     * Retourne les 100 derniers mouvements de stock (historique).
     * Colonnes renvoyées : id, nom_produit, type_mouvement, quantite,
     *                      quantite_avant, quantite_apres, date_mouvement, id_admin
     */
    public List<Map<String, Object>> getHistorique() throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql =
            "SELECT h.id_historique, p.nom_produit, h.type_mouvement, h.quantite, " +
            "       h.quantite_avant, h.quantite_apres, h.date_mouvement, h.id_admin, h.id_commande " +
            "FROM historique_stock h " +
            "JOIN produit p ON p.id_produit = h.id_produit " +
            "ORDER BY h.date_mouvement DESC " +
            "LIMIT 100";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id",             rs.getInt("id_historique"));
                row.put("nomProduit",     rs.getString("nom_produit"));
                row.put("typeMouvement",  rs.getString("type_mouvement"));
                row.put("quantite",       rs.getInt("quantite"));
                row.put("quantiteAvant",  rs.getInt("quantite_avant"));
                row.put("quantiteApres",  rs.getInt("quantite_apres"));
                row.put("dateMouvement",  rs.getTimestamp("date_mouvement"));
                int idAdmin = rs.getInt("id_admin");
                row.put("idAdmin",        rs.wasNull() ? null : idAdmin);
                int idCmd = rs.getInt("id_commande");
                row.put("idCommande",     rs.wasNull() ? null : idCmd);
                list.add(row);
            }
        }
        return list;
    }

    private Stock mapRow(ResultSet rs) throws SQLException {
        Stock s = new Stock();
        s.setIdStock(rs.getInt("id_stock"));
        s.setIdProduit(rs.getInt("id_produit"));
        s.setQuantiteDisponible(rs.getInt("quantite_disponible"));
        s.setSeuilAlerte(rs.getInt("seuil_alerte"));
        s.setStatutStock(rs.getString("statut_stock"));
        s.setDateMiseAJour(rs.getTimestamp("date_mise_a_jour"));
        s.setNomProduit(rs.getString("nom_produit"));
        s.setPrix(rs.getDouble("prix"));
        s.setImageProduit(rs.getString("image_produit"));
        s.setNomCategorie(rs.getString("nom_categorie"));
        return s;
    }
}
