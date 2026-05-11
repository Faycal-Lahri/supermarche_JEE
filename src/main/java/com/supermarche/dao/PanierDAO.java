package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.Panier;
import com.supermarche.model.PanierProduit;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PanierDAO {

    /**
     * Retourne le panier actif d'un client, ou null s'il n'en a pas.
     */
    public Panier findActifByClient(int idClient) throws SQLException {
        String sql = "SELECT * FROM panier WHERE id_client = ? AND statut_panier = 'actif' ORDER BY date_creation DESC LIMIT 1";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idClient);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Panier p = mapRow(rs);
                    p.setProduits(findLignes(p.getIdPanier()));
                    return p;
                }
            }
        }
        return null;
    }

    /**
     * Crée un nouveau panier pour le client.
     */
    public Panier createPanier(int idClient) throws SQLException {
        String sql = "INSERT INTO panier (id_client, statut_panier, montant_total) VALUES (?, 'actif', 0.0)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, idClient);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    Panier p = new Panier();
                    p.setIdPanier(keys.getInt(1));
                    p.setIdClient(idClient);
                    p.setStatutPanier("actif");
                    p.setMontantTotal(0.0);
                    p.setProduits(new ArrayList<>());
                    return p;
                }
            }
        }
        return null;
    }

    public Panier findById(int idPanier) throws SQLException {
        String sql = "SELECT * FROM panier WHERE id_panier = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idPanier);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Panier p = mapRow(rs);
                    p.setProduits(findLignes(p.getIdPanier()));
                    return p;
                }
            }
        }
        return null;
    }

    /**
     * Ajoute un produit ou incrémente la quantité si déjà présent.
     */
    public void ajouterProduit(int idPanier, int idProduit, int quantite, double prix) throws SQLException {
        String checkSql = "SELECT id_panier_produit, quantite FROM panier_produit WHERE id_panier=? AND id_produit=?";
        try (Connection conn = DatabaseConfig.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setInt(1, idPanier);
                ps.setInt(2, idProduit);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        int newQte = rs.getInt("quantite") + quantite;
                        String updateSql = "UPDATE panier_produit SET quantite=? WHERE id_panier=? AND id_produit=?";
                        try (PreparedStatement ups = conn.prepareStatement(updateSql)) {
                            ups.setInt(1, newQte);
                            ups.setInt(2, idPanier);
                            ups.setInt(3, idProduit);
                            ups.executeUpdate();
                        }
                    } else {
                        String insertSql = "INSERT INTO panier_produit (id_panier, id_produit, quantite, prix_unitaire_snapshot) " +
                                           "VALUES (?, ?, ?, ?)";
                        try (PreparedStatement ips = conn.prepareStatement(insertSql)) {
                            ips.setInt(1, idPanier);
                            ips.setInt(2, idProduit);
                            ips.setInt(3, quantite);
                            ips.setDouble(4, prix);
                            ips.executeUpdate();
                        }
                    }
                }
            }
            recalculerTotal(conn, idPanier);
        }
    }

    public void modifierQuantite(int idPanier, int idProduit, int quantite) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection()) {
            if (quantite <= 0) {
                String sql = "DELETE FROM panier_produit WHERE id_panier=? AND id_produit=?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setInt(1, idPanier);
                    ps.setInt(2, idProduit);
                    ps.executeUpdate();
                }
            } else {
                String sql = "UPDATE panier_produit SET quantite=? WHERE id_panier=? AND id_produit=?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setInt(1, quantite);
                    ps.setInt(2, idPanier);
                    ps.setInt(3, idProduit);
                    ps.executeUpdate();
                }
            }
            recalculerTotal(conn, idPanier);
        }
    }

    public void supprimerProduit(int idPanier, int idProduit) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection()) {
            String sql = "DELETE FROM panier_produit WHERE id_panier=? AND id_produit=?";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, idPanier);
                ps.setInt(2, idProduit);
                ps.executeUpdate();
            }
            recalculerTotal(conn, idPanier);
        }
    }

    public void validerPanier(Connection conn, int idPanier) throws SQLException {
        String sql = "UPDATE panier SET statut_panier='valide', date_statut=NOW() WHERE id_panier=?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idPanier);
            ps.executeUpdate();
        }
    }

    private void recalculerTotal(Connection conn, int idPanier) throws SQLException {
        String sql = "UPDATE panier p SET p.montant_total = " +
                     "(SELECT COALESCE(SUM(pp.quantite * pp.prix_unitaire_snapshot), 0) " +
                     " FROM panier_produit pp WHERE pp.id_panier = ?) " +
                     "WHERE p.id_panier = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idPanier);
            ps.setInt(2, idPanier);
            ps.executeUpdate();
        }
    }

    private List<PanierProduit> findLignes(int idPanier) throws SQLException {
        List<PanierProduit> list = new ArrayList<>();
        String sql = "SELECT pp.*, p.nom_produit, p.image_produit, p.prix as prix_actuel, " +
                     "s.quantite_disponible " +
                     "FROM panier_produit pp " +
                     "JOIN produit p ON pp.id_produit = p.id_produit " +
                     "LEFT JOIN stock s ON p.id_produit = s.id_produit " +
                     "WHERE pp.id_panier = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idPanier);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PanierProduit pp = new PanierProduit();
                    pp.setIdPanierProduit(rs.getInt("id_panier_produit"));
                    pp.setIdPanier(rs.getInt("id_panier"));
                    pp.setIdProduit(rs.getInt("id_produit"));
                    pp.setQuantite(rs.getInt("quantite"));
                    pp.setPrixUnitaireSnapshot(rs.getDouble("prix_unitaire_snapshot"));
                    pp.setDateAjout(rs.getTimestamp("date_ajout"));
                    pp.setNomProduit(rs.getString("nom_produit"));
                    pp.setImageProduit(rs.getString("image_produit"));
                    pp.setPrixActuel(rs.getDouble("prix_actuel"));
                    pp.setQuantiteDisponible(rs.getInt("quantite_disponible"));
                    list.add(pp);
                }
            }
        }
        return list;
    }

    private Panier mapRow(ResultSet rs) throws SQLException {
        Panier p = new Panier();
        p.setIdPanier(rs.getInt("id_panier"));
        int idClient = rs.getInt("id_client");
        p.setIdClient(rs.wasNull() ? null : idClient);
        p.setSessionId(rs.getString("session_id"));
        p.setDateCreation(rs.getTimestamp("date_creation"));
        p.setStatutPanier(rs.getString("statut_panier"));
        p.setDateStatut(rs.getTimestamp("date_statut"));
        p.setMontantTotal(rs.getDouble("montant_total"));
        return p;
    }
}
