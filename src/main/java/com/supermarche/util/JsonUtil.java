package com.supermarche.util;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class JsonUtil {

    // Sérialise TOUS les champs Java en snake_case automatiquement :
    // idCommande      → id_commande
    // numeroCommande  → numero_commande
    // montantTotal    → montant_total
    // nomClient       → nom_client
    private static final Gson GSON = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
            .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
            .serializeNulls()
            .create();

    /**
     * Envoie une réponse JSON avec le code HTTP donné.
     */
    public static void sendJson(HttpServletResponse response, int status, Object data) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(GSON.toJson(data));
        out.flush();
    }

    /**
     * Envoie une réponse de succès : {"success": true, "data": ...}
     */
    public static void sendSuccess(HttpServletResponse response, Object data) throws IOException {
        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("success", true);
        body.put("data", data);
        sendJson(response, 200, body);
    }

    /**
     * Envoie une réponse de succès avec message : {"success": true, "message": "..."}
     */
    public static void sendSuccessMessage(HttpServletResponse response, String message) throws IOException {
        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("success", true);
        body.put("message", message);
        sendJson(response, 200, body);
    }

    /**
     * Envoie une réponse d'erreur : {"success": false, "message": "..."}
     */
    public static void sendError(HttpServletResponse response, int status, String message) throws IOException {
        java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("success", false);
        body.put("message", message);
        sendJson(response, status, body);
    }

    public static Gson getGson() {
        return GSON;
    }
}
