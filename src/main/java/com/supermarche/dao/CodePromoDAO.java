package com.supermarche.dao;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.model.CodePromo;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CodePromoDAO {

    public List<CodePromo> findAll() throws SQLException {
        List<CodePromo> list = new ArrayList<>();
        String sql = "SELECT * FROM code_promo ORDER BY date_creation DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    public CodePromo findByCode(String code) throws SQLException {
        String sql = "SELECT * FROM code_promo WHERE UPPER(code) = UPPER(?) AND actif = TRUE";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, code);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    /** Validate a code: checks existence, active, date range, usage limit */
    public ValidationResult validate(String code, double montantCommande) throws SQLException {
        CodePromo cp = findByCode(code);
        if (cp == null)         return ValidationResult.error("Code promo invalide ou inactif");
        if (!cp.isActif())      return ValidationResult.error("Code promo désactivé");

        java.time.LocalDate today = java.time.LocalDate.now();
        if (cp.getDateDebut() != null) {
            java.time.LocalDate debut = new java.sql.Date(cp.getDateDebut().getTime()).toLocalDate();
            if (today.isBefore(debut)) return ValidationResult.error("Code promo pas encore valide");
        }
        if (cp.getDateFin() != null) {
            java.time.LocalDate fin = new java.sql.Date(cp.getDateFin().getTime()).toLocalDate();
            if (today.isAfter(fin)) return ValidationResult.error("Code promo expiré");
        }
        if (cp.getUsageMax() != null && cp.getUsageCount() >= cp.getUsageMax())
            return ValidationResult.error("Code promo épuisé (limite d'utilisation atteinte)");
        if (montantCommande < cp.getMontantMin())
            return ValidationResult.error(String.format("Montant minimum requis : %.2f €", cp.getMontantMin()));

        double remise;
        if ("pourcentage".equals(cp.getTypeRemise()))
            remise = Math.round(montantCommande * cp.getValeur() / 100 * 100.0) / 100.0;
        else
            remise = Math.min(cp.getValeur(), montantCommande);

        return ValidationResult.success(cp, remise);
    }

    /** Called after a successful order to track usage */
    public void enregistrerUsage(int idCodePromo, int idClient, int idCommande, double montantRemise) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                String insertUsage = "INSERT INTO usage_code_promo (id_code_promo, id_client, id_commande, montant_remise) VALUES (?,?,?,?)";
                try (PreparedStatement ps = conn.prepareStatement(insertUsage)) {
                    ps.setInt(1, idCodePromo); ps.setInt(2, idClient);
                    ps.setInt(3, idCommande); ps.setDouble(4, montantRemise);
                    ps.executeUpdate();
                }
                String updateCount = "UPDATE code_promo SET usage_count = usage_count + 1 WHERE id_code_promo = ?";
                try (PreparedStatement ps = conn.prepareStatement(updateCount)) {
                    ps.setInt(1, idCodePromo); ps.executeUpdate();
                }
                conn.commit();
            } catch (Exception e) { conn.rollback(); throw new SQLException(e.getMessage()); }
        }
    }

    public int create(CodePromo cp) throws SQLException {
        String sql = "INSERT INTO code_promo (code, description, type_remise, valeur, montant_min, usage_max, date_debut, date_fin, actif, id_admin_createur) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, cp.getCode().toUpperCase());
            ps.setString(2, cp.getDescription());
            ps.setString(3, cp.getTypeRemise() != null ? cp.getTypeRemise() : "pourcentage");
            ps.setDouble(4, cp.getValeur());
            ps.setDouble(5, cp.getMontantMin());
            if (cp.getUsageMax() != null) ps.setInt(6, cp.getUsageMax()); else ps.setNull(6, Types.INTEGER);
            if (cp.getDateDebut() != null) ps.setDate(7, new java.sql.Date(cp.getDateDebut().getTime())); else ps.setNull(7, Types.DATE);
            if (cp.getDateFin()   != null) ps.setDate(8, new java.sql.Date(cp.getDateFin().getTime())); else ps.setNull(8, Types.DATE);
            ps.setBoolean(9, cp.isActif());
            if (cp.getIdAdminCreateur() != null) ps.setInt(10, cp.getIdAdminCreateur()); else ps.setNull(10, Types.INTEGER);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) { if (keys.next()) return keys.getInt(1); }
        }
        return -1;
    }

    public void toggleActif(int id, boolean actif) throws SQLException {
        String sql = "UPDATE code_promo SET actif=? WHERE id_code_promo=?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, actif); ps.setInt(2, id); ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM code_promo WHERE id_code_promo=?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id); ps.executeUpdate();
        }
    }

    private CodePromo mapRow(ResultSet rs) throws SQLException {
        CodePromo cp = new CodePromo();
        cp.setIdCodePromo(rs.getInt("id_code_promo"));
        cp.setCode(rs.getString("code"));
        cp.setDescription(rs.getString("description"));
        cp.setTypeRemise(rs.getString("type_remise"));
        cp.setValeur(rs.getDouble("valeur"));
        cp.setMontantMin(rs.getDouble("montant_min"));
        int usageMax = rs.getInt("usage_max");
        cp.setUsageMax(rs.wasNull() ? null : usageMax);
        cp.setUsageCount(rs.getInt("usage_count"));
        cp.setDateDebut(rs.getDate("date_debut"));
        cp.setDateFin(rs.getDate("date_fin"));
        cp.setActif(rs.getBoolean("actif"));
        int admin = rs.getInt("id_admin_createur");
        cp.setIdAdminCreateur(rs.wasNull() ? null : admin);
        cp.setDateCreation(rs.getTimestamp("date_creation"));
        return cp;
    }

    // ── Inner result class ───────────────────────────────────────────────────
    public static class ValidationResult {
        public final boolean valid;
        public final String  message;
        public final CodePromo codePromo;
        public final double  remise;

        private ValidationResult(boolean valid, String message, CodePromo cp, double remise) {
            this.valid = valid; this.message = message; this.codePromo = cp; this.remise = remise;
        }
        public static ValidationResult success(CodePromo cp, double remise) {
            return new ValidationResult(true, "Code valide", cp, remise);
        }
        public static ValidationResult error(String msg) {
            return new ValidationResult(false, msg, null, 0);
        }
    }
}
