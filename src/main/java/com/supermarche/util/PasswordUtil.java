package com.supermarche.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    /**
     * Hash le mot de passe avec BCrypt.
     */
    public static String hash(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
    }

    /**
     * Vérifie un mot de passe.
     * Supporte BCrypt (hash $2a$...) ET texte clair (fallback dev).
     */
    public static boolean verify(String plainPassword, String storedPassword) {
        if (storedPassword == null || plainPassword == null) return false;
        // Si c'est un hash BCrypt valide
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            try {
                return BCrypt.checkpw(plainPassword, storedPassword);
            } catch (Exception e) {
                return false;
            }
        }
        // Fallback : comparaison en texte clair (pour les comptes de dev)
        return plainPassword.equals(storedPassword);
    }
}
