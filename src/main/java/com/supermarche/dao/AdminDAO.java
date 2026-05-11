package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Administrateur;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AdminDAO {

    public int create(Administrateur a) throws SQLException {
        String sql = "INSERT INTO administrateur (id_utilisateur, type_admin) VALUES (?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, a.getIdUtilisateur());
            ps.setString(2, a.getTypeAdmin());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    public Administrateur findByUserId(int idUtilisateur) throws SQLException {
        String sql = "SELECT a.*, u.nom, u.prenom, u.email, u.statut " +
                     "FROM administrateur a JOIN utilisateur u ON a.id_utilisateur = u.id_utilisateur " +
                     "WHERE a.id_utilisateur = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUtilisateur);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public Administrateur findById(int idAdmin) throws SQLException {
        String sql = "SELECT a.*, u.nom, u.prenom, u.email, u.statut " +
                     "FROM administrateur a JOIN utilisateur u ON a.id_utilisateur = u.id_utilisateur " +
                     "WHERE a.id_administrateur = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idAdmin);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public List<Administrateur> findAll() throws SQLException {
        List<Administrateur> list = new ArrayList<>();
        String sql = "SELECT a.*, u.nom, u.prenom, u.email, u.statut " +
                     "FROM administrateur a JOIN utilisateur u ON a.id_utilisateur = u.id_utilisateur " +
                     "ORDER BY a.id_administrateur";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    public void updateTypeAdmin(int idAdmin, String typeAdmin) throws SQLException {
        String sql = "UPDATE administrateur SET type_admin=? WHERE id_administrateur=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, typeAdmin);
            ps.setInt(2, idAdmin);
            ps.executeUpdate();
        }
    }

    private Administrateur mapRow(ResultSet rs) throws SQLException {
        Administrateur a = new Administrateur();
        a.setIdAdministrateur(rs.getInt("id_administrateur"));
        a.setIdUtilisateur(rs.getInt("id_utilisateur"));
        a.setTypeAdmin(rs.getString("type_admin"));
        a.setNom(rs.getString("nom"));
        a.setPrenom(rs.getString("prenom"));
        a.setEmail(rs.getString("email"));
        a.setStatut(rs.getString("statut"));
        return a;
    }
}
