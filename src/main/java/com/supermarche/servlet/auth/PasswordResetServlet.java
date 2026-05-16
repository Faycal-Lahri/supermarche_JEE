package com.supermarche.servlet.auth;

import com.google.gson.JsonObject;
import com.supermarche.dao.UtilisateurDAO;
import com.supermarche.model.Utilisateur;
import com.supermarche.util.JsonUtil;
import com.supermarche.util.PasswordUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@WebServlet("/api/auth/password-reset")
public class PasswordResetServlet extends HttpServlet {

    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();
    // Stockage en mémoire des codes (email -> code)
    private static final Map<String, String> resetCodes = new ConcurrentHashMap<>();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String body = request.getReader().lines().collect(Collectors.joining());
        JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);

        String action = getStr(json, "action");
        String email = getStr(json, "email");

        try {
            if ("send_code".equals(action)) {
                Utilisateur u = utilisateurDAO.findByEmail(email);
                if (u == null) {
                    // On renvoie 200 même si l'email n'existe pas pour des raisons de sécurité, ou
                    // 404
                    JsonUtil.sendError(response, 404, "Aucun compte associé à cet email.");
                    return;
                }

                // Générer code à 6 chiffres
                String code = String.format("%06d", new Random().nextInt(999999));
                resetCodes.put(email, code);

                // ENVOI D'EMAIL RÉEL
                try {
                    com.supermarche.util.EmailUtil.sendResetCode(email, code);
                } catch (Exception e) {
                    System.err.println("Erreur d'envoi d'email : " + e.getMessage());
                }

                JsonObject res = new JsonObject();
                res.addProperty("message", "Code envoyé à votre adresse email");
                JsonUtil.sendJson(response, 200, buildSuccess(res));

            } else if ("verify_code".equals(action)) {
                String codeSaisi = getStr(json, "code");
                String codeAttendu = resetCodes.get(email);
                if (codeAttendu == null || !codeAttendu.equals(codeSaisi)) {
                    JsonUtil.sendError(response, 400, "Code de vérification incorrect ou expiré.");
                    return;
                }
                JsonObject res = new JsonObject();
                res.addProperty("message", "Code valide");
                JsonUtil.sendJson(response, 200, buildSuccess(res));

            } else if ("reset_password".equals(action)) {
                String codeSaisi = getStr(json, "code");
                String newPassword = getStr(json, "new_password");

                String codeAttendu = resetCodes.get(email);
                if (codeAttendu == null || !codeAttendu.equals(codeSaisi)) {
                    JsonUtil.sendError(response, 400, "Code de vérification incorrect ou expiré.");
                    return;
                }

                if (newPassword.length() < 6) {
                    JsonUtil.sendError(response, 400, "Le mot de passe doit faire au moins 6 caractères.");
                    return;
                }

                Utilisateur u = utilisateurDAO.findByEmail(email);
                if (u != null) {
                    utilisateurDAO.updatePassword(u.getIdUtilisateur(), PasswordUtil.hash(newPassword));
                    resetCodes.remove(email); // Invalider le code

                    // ENVOI D'EMAIL DE CONFIRMATION
                    try {
                        com.supermarche.util.EmailUtil.sendConfirmation(email);
                    } catch (Exception e) {
                        System.err.println("Erreur d'envoi d'email : " + e.getMessage());
                    }

                    JsonObject res = new JsonObject();
                    res.addProperty("message", "Mot de passe modifié avec succès");
                    JsonUtil.sendJson(response, 200, buildSuccess(res));
                } else {
                    JsonUtil.sendError(response, 404, "Utilisateur introuvable.");
                }

            } else {
                JsonUtil.sendError(response, 400, "Action non reconnue.");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur serveur : " + e.getMessage());
        }
    }

    private String getStr(JsonObject json, String key) {
        return json.has(key) && !json.get(key).isJsonNull() ? json.get(key).getAsString().trim() : "";
    }

    private Map<String, Object> buildSuccess(Object data) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("success", true);
        m.put("data", data);
        return m;
    }
}
