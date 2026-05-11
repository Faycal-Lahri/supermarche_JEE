package com.supermarche.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {

    private static final String URL =
        "jdbc:mysql://127.0.0.1:3306/supermarche_jee"
        + "?useSSL=false"
        + "&serverTimezone=UTC"
        + "&allowPublicKeyRetrieval=true"
        + "&useUnicode=true"
        + "&characterEncoding=UTF-8";

    private static final String USER     = "root";
    private static final String PASSWORD = "";  // adapte si ton MySQL a un mot de passe

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL Driver introuvable", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
