package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Utilisateur;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UtilisateurDAO {

    public Utilisateur findByEmail(String email) throws SQLException {
        String sql = "SELECT * FROM utilisateur WHERE email = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public Utilisateur findById(int id) throws SQLException {
        String sql = "SELECT * FROM utilisateur WHERE id_utilisateur = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public int create(Utilisateur u) throws SQLException {
        String sql = "INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, role, statut) " +
                     "VALUES (?, ?, ?, ?, ?, ?, 'actif')";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, u.getNom());
            ps.setString(2, u.getPrenom());
            ps.setString(3, u.getEmail());
            ps.setString(4, u.getMotDePasse());
            ps.setString(5, u.getTelephone());
            ps.setString(6, u.getRole());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    public void update(Utilisateur u) throws SQLException {
        String sql = "UPDATE utilisateur SET nom=?, prenom=?, email=?, telephone=?, photo_profil=? " +
                     "WHERE id_utilisateur=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, u.getNom());
            ps.setString(2, u.getPrenom());
            ps.setString(3, u.getEmail());
            ps.setString(4, u.getTelephone());
            ps.setString(5, u.getPhotoProfil());
            ps.setInt(6, u.getIdUtilisateur());
            ps.executeUpdate();
        }
    }

    public void updatePassword(int id, String hashedPwd) throws SQLException {
        String sql = "UPDATE utilisateur SET mot_de_passe=? WHERE id_utilisateur=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, hashedPwd);
            ps.setInt(2, id);
            ps.executeUpdate();
        }
    }

    /** Mise à jour du profil client par un admin (sans mot de passe ni photo) */
    public void updateClientProfile(int idUtilisateur, String nom, String prenom, String email, String telephone)
            throws SQLException {
        String sql = "UPDATE utilisateur SET nom=?, prenom=?, email=?, telephone=? WHERE id_utilisateur=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, nom);
            ps.setString(2, prenom);
            ps.setString(3, email);
            ps.setString(4, telephone);
            ps.setInt(5, idUtilisateur);
            ps.executeUpdate();
        }
    }

    public void updateStatut(int id, String statut) throws SQLException {
        String sql = "UPDATE utilisateur SET statut=? WHERE id_utilisateur=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, statut);
            ps.setInt(2, id);
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM utilisateur WHERE id_utilisateur=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public List<Utilisateur> findAll() throws SQLException {
        List<Utilisateur> list = new ArrayList<>();
        String sql = "SELECT * FROM utilisateur ORDER BY date_creation DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    private Utilisateur mapRow(ResultSet rs) throws SQLException {
        Utilisateur u = new Utilisateur();
        u.setIdUtilisateur(rs.getInt("id_utilisateur"));
        u.setNom(rs.getString("nom"));
        u.setPrenom(rs.getString("prenom"));
        u.setEmail(rs.getString("email"));
        u.setMotDePasse(rs.getString("mot_de_passe"));
        u.setTelephone(rs.getString("telephone"));
        u.setRole(rs.getString("role"));
        u.setStatut(rs.getString("statut"));
        u.setDateCreation(rs.getTimestamp("date_creation"));
        return u;
    }
}
