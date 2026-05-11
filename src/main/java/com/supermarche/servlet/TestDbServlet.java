package com.supermarche.servlet;

import com.supermarche.config.DatabaseConfig;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/test-db")
public class TestDbServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        Map<String, Object> result = new LinkedHashMap<>();
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT 1")) {

            if (rs.next()) {
                result.put("status",   "OK");
                result.put("message",  "Connexion BDD réussie");
                result.put("database", conn.getCatalog());
                JsonUtil.sendJson(response, 200, result);
            }
        } catch (Exception e) {
            result.put("status",  "ERROR");
            result.put("message", e.getMessage());
            JsonUtil.sendJson(response, 500, result);
        }
    }
}
