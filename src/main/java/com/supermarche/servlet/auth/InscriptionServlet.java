package com.supermarche.servlet.auth;

import com.google.gson.JsonObject;
import com.supermarche.dao.ClientDAO;
import com.supermarche.dao.UtilisateurDAO;
import com.supermarche.model.Client;
import com.supermarche.model.Utilisateur;
import com.supermarche.util.JsonUtil;
import com.supermarche.util.PasswordUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.stream.Collectors;

@WebServlet("/api/auth/inscription")
public class InscriptionServlet extends HttpServlet {

    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();
    private final ClientDAO      clientDAO      = new ClientDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String body = request.getReader().lines().collect(Collectors.joining());
        JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);

        if (json.has("action") && "check_cin".equals(json.get("action").getAsString())) {
            String cinCheck = getStr(json, "cin");
            try {
                if (clientDAO.findByCin(cinCheck) != null) {
                    JsonUtil.sendError(response, 409, "Cette carte CIN existe déjà chez quelqu'un d'autre.");
                } else {
                    JsonUtil.sendJson(response, 200, buildSuccess("CIN libre"));
                }
            } catch (Exception e) {
                JsonUtil.sendError(response, 500, "Erreur serveur : " + e.getMessage());
            }
            return;
        }

        String nom      = getStr(json, "nom");
        String prenom   = getStr(json, "prenom");
        String email    = getStr(json, "email");
        String mdp      = getStr(json, "mot_de_passe");
        String tel      = getStr(json, "telephone");
        String adresse  = getStr(json, "adresse");
        String ville    = getStr(json, "ville");
        String cp       = getStr(json, "code_postal");
        String cin      = getStr(json, "cin");

        if (nom.isEmpty() || prenom.isEmpty() || email.isEmpty() || mdp.isEmpty()) {
            JsonUtil.sendError(response, 400, "Champs obligatoires : nom, prenom, email, mot_de_passe");
            return;
        }

        try {
            // Vérifier unicité email
            if (utilisateurDAO.findByEmail(email) != null) {
                JsonUtil.sendError(response, 409, "Cet email est déjà utilisé");
                return;
            }

            // Créer utilisateur
            Utilisateur u = new Utilisateur();
            u.setNom(nom);
            u.setPrenom(prenom);
            u.setEmail(email);
            u.setMotDePasse(PasswordUtil.hash(mdp));
            u.setTelephone(tel);
            u.setRole("client");

            int idUtilisateur = utilisateurDAO.create(u);

            // Créer client associé
            Client c = new Client();
            c.setIdUtilisateur(idUtilisateur);
            c.setCin(cin);
            c.setAdresse(adresse);
            c.setVille(ville);
            c.setCodePostal(cp);
            int idClient = clientDAO.create(c);

            JsonObject result = new JsonObject();
            result.addProperty("id_utilisateur", idUtilisateur);
            result.addProperty("id_client", idClient);
            result.addProperty("email", email);
            result.addProperty("role", "client");

            JsonUtil.sendJson(response, 201, buildSuccess(result));

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur serveur : " + e.getMessage());
        }
    }

    private String getStr(JsonObject json, String key) {
        return json.has(key) && !json.get(key).isJsonNull()
               ? json.get(key).getAsString().trim()
               : "";
    }

    private java.util.Map<String, Object> buildSuccess(Object data) {
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("success", true);
        m.put("data", data);
        return m;
    }
}
