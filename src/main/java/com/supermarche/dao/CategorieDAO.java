package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Categorie;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CategorieDAO {

    public List<Categorie> findAll() throws SQLException {
        List<Categorie> list = new ArrayList<>();
        String sql = "SELECT * FROM categorie ORDER BY nom_categorie";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    public Categorie findById(int id) throws SQLException {
        String sql = "SELECT * FROM categorie WHERE id_categorie = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public int create(Categorie c) throws SQLException {
        String sql = "INSERT INTO categorie (nom_categorie, description, id_categorie_parent, image_categorie) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, c.getNomCategorie());
            ps.setString(2, c.getDescription());
            if (c.getIdCategorieParent() != null)
                ps.setInt(3, c.getIdCategorieParent());
            else
                ps.setNull(3, Types.INTEGER);
            ps.setString(4, c.getImageCategorie());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    public void update(Categorie c) throws SQLException {
        String sql = "UPDATE categorie SET nom_categorie=?, description=?, id_categorie_parent=?, image_categorie=? WHERE id_categorie=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, c.getNomCategorie());
            ps.setString(2, c.getDescription());
            if (c.getIdCategorieParent() != null)
                ps.setInt(3, c.getIdCategorieParent());
            else
                ps.setNull(3, Types.INTEGER);
            ps.setString(4, c.getImageCategorie());
            ps.setInt(5, c.getIdCategorie());
            ps.executeUpdate();
        }
    }

    public boolean delete(int id) throws SQLException {
        // Vérifie qu'aucun produit n'est lié
        String checkSql = "SELECT COUNT(*) FROM produit WHERE id_categorie = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(checkSql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next() && rs.getInt(1) > 0) return false;
            }
        }
        String sql = "DELETE FROM categorie WHERE id_categorie = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
        return true;
    }

    public int countByCategorie(int idCategorie) throws SQLException {
        String sql = "SELECT COUNT(*) FROM produit WHERE id_categorie = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCategorie);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return 0;
    }

    private Categorie mapRow(ResultSet rs) throws SQLException {
        Categorie c = new Categorie();
        c.setIdCategorie(rs.getInt("id_categorie"));
        c.setNomCategorie(rs.getString("nom_categorie"));
        c.setDescription(rs.getString("description"));
        int parent = rs.getInt("id_categorie_parent");
        c.setIdCategorieParent(rs.wasNull() ? null : parent);
        c.setImageCategorie(rs.getString("image_categorie"));
        return c;
    }
}
