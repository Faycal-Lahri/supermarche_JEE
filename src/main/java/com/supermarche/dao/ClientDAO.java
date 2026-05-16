package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Client;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ClientDAO {

    public int create(Client c) throws SQLException {
        String sql = "INSERT INTO client (id_utilisateur, cin, adresse, ville, code_postal) VALUES (?,?,?,?,?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, c.getIdUtilisateur());
            ps.setString(2, c.getCin());
            ps.setString(3, c.getAdresse());
            ps.setString(4, c.getVille());
            ps.setString(5, c.getCodePostal());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    public Client findByUserId(int idUtilisateur) throws SQLException {
        String sql = "SELECT c.*, u.nom, u.prenom, u.email, u.telephone, u.statut, u.date_creation " +
                     "FROM client c JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur " +
                     "WHERE c.id_utilisateur = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUtilisateur);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public Client findByCin(String cin) throws SQLException {
        String sql = "SELECT * FROM client WHERE cin = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, cin);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Client c = new Client();
                    c.setIdClient(rs.getInt("id_client"));
                    c.setIdUtilisateur(rs.getInt("id_utilisateur"));
                    c.setCin(rs.getString("cin"));
                    return c;
                }
            }
        }
        return null;
    }

    public Client findById(int idClient) throws SQLException {
        String sql = "SELECT c.*, u.nom, u.prenom, u.email, u.telephone, u.statut, u.photo_profil, u.date_creation " +
                     "FROM client c JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur " +
                     "WHERE c.id_client = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idClient);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public List<Client> findAll() throws SQLException {
        List<Client> list = new ArrayList<>();
        String sql = "SELECT c.*, u.nom, u.prenom, u.email, u.telephone, u.statut, u.photo_profil, u.date_creation " +
                     "FROM client c JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur " +
                     "ORDER BY c.id_client DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    public void updateAdresse(Client c) throws SQLException {
        String sql = "UPDATE client SET adresse=?, ville=?, code_postal=?, cin=? WHERE id_client=?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, c.getAdresse());
            ps.setString(2, c.getVille());
            ps.setString(3, c.getCodePostal());
            ps.setString(4, c.getCin());
            ps.setInt(5, c.getIdClient());
            ps.executeUpdate();
        }
    }

    /**
     * Suppression définitive d'un client en transaction ACID.
     * Cascade : lignes_commande → commandes → panier → client → utilisateur
     */
    public void deleteDefinitively(int idClient, int idUtilisateur) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1. Supprimer les lignes des commandes du client
                String delLignes = "DELETE lc FROM ligne_commande lc "
                    + "INNER JOIN commande co ON lc.id_commande = co.id_commande "
                    + "WHERE co.id_client = ?";
                try (PreparedStatement ps = conn.prepareStatement(delLignes)) {
                    ps.setInt(1, idClient); ps.executeUpdate();
                }
                // 2. Supprimer les commandes
                try (PreparedStatement ps = conn.prepareStatement("DELETE FROM commande WHERE id_client=?")) {
                    ps.setInt(1, idClient); ps.executeUpdate();
                }
                // 3. Supprimer les paniers
                try (PreparedStatement ps = conn.prepareStatement("DELETE FROM panier WHERE id_client=?")) {
                    ps.setInt(1, idClient); ps.executeUpdate();
                }
                // 4. Supprimer le client
                try (PreparedStatement ps = conn.prepareStatement("DELETE FROM client WHERE id_client=?")) {
                    ps.setInt(1, idClient); ps.executeUpdate();
                }
                // 5. Supprimer l'utilisateur
                try (PreparedStatement ps = conn.prepareStatement("DELETE FROM utilisateur WHERE id_utilisateur=?")) {
                    ps.setInt(1, idUtilisateur); ps.executeUpdate();
                }
                conn.commit();
            } catch (Exception e) {
                conn.rollback();
                throw new SQLException("Erreur suppression client: " + e.getMessage(), e);
            }
        }
    }

    private Client mapRow(ResultSet rs) throws SQLException {
        Client c = new Client();
        c.setIdClient(rs.getInt("id_client"));
        c.setIdUtilisateur(rs.getInt("id_utilisateur"));
        c.setCin(rs.getString("cin"));
        c.setAdresse(rs.getString("adresse"));
        c.setVille(rs.getString("ville"));
        c.setCodePostal(rs.getString("code_postal"));
        c.setNom(rs.getString("nom"));
        c.setPrenom(rs.getString("prenom"));
        c.setEmail(rs.getString("email"));
        c.setTelephone(rs.getString("telephone"));
        c.setStatut(rs.getString("statut"));
        try { c.setPhotoProfil(rs.getString("photo_profil")); }   catch (SQLException ignored) {}
        try { c.setDateCreation(rs.getTimestamp("date_creation")); } catch (SQLException ignored) {}
        return c;
    }
}
