package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Produit;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProduitDAO {

    private static final String SELECT_WITH_JOIN =
        "SELECT p.*, c.nom_categorie, s.quantite_disponible, s.seuil_alerte, s.statut_stock " +
        "FROM produit p " +
        "LEFT JOIN categorie c ON p.id_categorie = c.id_categorie " +
        "LEFT JOIN stock s ON p.id_produit = s.id_produit ";

    public List<Produit> findAllActif() throws SQLException {
        return findWithFilter("WHERE p.actif = TRUE ORDER BY p.nom_produit", null, null);
    }

    public List<Produit> findAll() throws SQLException {
        return findWithFilter("ORDER BY p.id_produit DESC", null, null);
    }

    public List<Produit> searchByNom(String q) throws SQLException {
        return findWithFilter("WHERE p.actif = TRUE AND p.nom_produit LIKE ? ORDER BY p.nom_produit",
                              "%" + q + "%", null);
    }

    public List<Produit> findByCategorie(int idCategorie) throws SQLException {
        return findWithFilter("WHERE p.actif = TRUE AND p.id_categorie = ? ORDER BY p.nom_produit",
                              null, idCategorie);
    }

    public Produit findById(int id) throws SQLException {
        String sql = SELECT_WITH_JOIN + "WHERE p.id_produit = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public int create(Produit p) throws SQLException {
        String sql = "INSERT INTO produit (nom_produit, description, prix, image_produit, id_categorie, actif) " +
                     "VALUES (?, ?, ?, ?, ?, TRUE)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, p.getNomProduit());
            ps.setString(2, p.getDescription());
            ps.setDouble(3, p.getPrix());
            ps.setString(4, p.getImageProduit());
            ps.setInt(5, p.getIdCategorie());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    public void update(Produit p) throws SQLException {
        String sql = "UPDATE produit SET nom_produit=?, description=?, prix=?, image_produit=?, " +
                     "id_categorie=?, actif=? WHERE id_produit=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, p.getNomProduit());
            ps.setString(2, p.getDescription());
            ps.setDouble(3, p.getPrix());
            ps.setString(4, p.getImageProduit());
            ps.setInt(5, p.getIdCategorie());
            ps.setBoolean(6, p.isActif());
            ps.setInt(7, p.getIdProduit());
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        // Désactive (soft-delete) le produit
        String sql = "UPDATE produit SET actif = FALSE WHERE id_produit = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public void hardDelete(int id) throws SQLException {
        String sql = "DELETE FROM produit WHERE id_produit = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    // ── Méthode interne générique ────────────────────────────────────────────
    private List<Produit> findWithFilter(String where, String strParam, Integer intParam) throws SQLException {
        List<Produit> list = new ArrayList<>();
        String sql = SELECT_WITH_JOIN + where;
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (strParam != null) ps.setString(1, strParam);
            if (intParam != null) ps.setInt(1, intParam);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    private Produit mapRow(ResultSet rs) throws SQLException {
        Produit p = new Produit();
        p.setIdProduit(rs.getInt("id_produit"));
        p.setNomProduit(rs.getString("nom_produit"));
        p.setDescription(rs.getString("description"));
        p.setPrix(rs.getDouble("prix"));
        p.setImageProduit(rs.getString("image_produit"));
        p.setIdCategorie(rs.getInt("id_categorie"));
        p.setActif(rs.getBoolean("actif"));
        p.setNomCategorie(rs.getString("nom_categorie"));
        int qte = rs.getInt("quantite_disponible");
        p.setQuantiteDisponible(rs.wasNull() ? null : qte);
        int seuil = rs.getInt("seuil_alerte");
        p.setSeuilAlerte(rs.wasNull() ? null : seuil);
        p.setStatutStock(rs.getString("statut_stock"));
        return p;
    }
}
