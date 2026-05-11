package com.supermarche.util;

import com.supermarche.config.DatabaseConfig;
import java.sql.Connection;
import java.sql.Statement;

public class FixDB {
    public static void main(String[] args) {
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Applying migration...");
            String sql = "ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS photo_profil VARCHAR(512) DEFAULT NULL AFTER role";
            stmt.executeUpdate(sql);
            System.out.println("Migration applied successfully!");
            
        } catch (Exception e) {
            System.err.println("Error applying migration:");
            e.printStackTrace();
        }
    }
}
