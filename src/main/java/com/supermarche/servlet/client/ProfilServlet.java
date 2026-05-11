package com.supermarche.servlet.client;

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
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GET    /api/profil             → données profil
 * PUT    /api/profil/modifier    → modifier infos
 * PUT    /api/profil/mdp         → changer mot de passe
 * DELETE /api/profil/supprimer   → supprimer compte
 */
@WebServlet("/api/profil/*")
public class ProfilServlet extends HttpServlet {

    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();
    private final ClientDAO      clientDAO      = new ClientDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        int userId = getUserId(request);
        try {
            Utilisateur u = utilisateurDAO.findById(userId);
            if (u == null) { JsonUtil.sendError(response, 404, "Utilisateur introuvable"); return; }

            Map<String, Object> data = buildUserData(u);
            if ("client".equals(u.getRole())) {
                Client c = clientDAO.findByUserId(userId);
                if (c != null) enrichWithClient(data, c);
            }
            JsonUtil.sendSuccess(response, data);
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        int userId = getUserId(request);
        JsonObject json = parseBody(request);

        try {
            if ("/modifier".equals(pathInfo)) {
                Utilisateur u = utilisateurDAO.findById(userId);
                if (json.has("nom"))       u.setNom(json.get("nom").getAsString());
                if (json.has("prenom"))    u.setPrenom(json.get("prenom").getAsString());
                if (json.has("email"))     u.setEmail(json.get("email").getAsString());
                if (json.has("telephone")) u.setTelephone(json.get("telephone").getAsString());
                if (json.has("photo_profil")) u.setPhotoProfil(json.get("photo_profil").getAsString());
                utilisateurDAO.update(u);

                if ("client".equals(u.getRole())) {
                    Client c = clientDAO.findByUserId(userId);
                    if (c != null) {
                        if (json.has("adresse"))     c.setAdresse(json.get("adresse").getAsString());
                        if (json.has("ville"))       c.setVille(json.get("ville").getAsString());
                        if (json.has("code_postal")) c.setCodePostal(json.get("code_postal").getAsString());
                        if (json.has("cin"))         c.setCin(json.get("cin").getAsString());
                        clientDAO.updateAdresse(c);
                    }
                }
                JsonUtil.sendSuccessMessage(response, "Profil mis à jour");

            } else if ("/mdp".equals(pathInfo)) {
                String ancien   = json.has("ancien_mdp")  ? json.get("ancien_mdp").getAsString()  : "";
                String nouveau  = json.has("nouveau_mdp") ? json.get("nouveau_mdp").getAsString()  : "";

                Utilisateur u = utilisateurDAO.findById(userId);
                if (!PasswordUtil.verify(ancien, u.getMotDePasse())) {
                    JsonUtil.sendError(response, 400, "Ancien mot de passe incorrect");
                    return;
                }
                utilisateurDAO.updatePassword(userId, PasswordUtil.hash(nouveau));
                JsonUtil.sendSuccessMessage(response, "Mot de passe modifié");

            } else {
                JsonUtil.sendError(response, 404, "Endpoint invalide");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        int userId = getUserId(request);
        try {
            utilisateurDAO.delete(userId);
            request.getSession(false).invalidate();
            JsonUtil.sendSuccessMessage(response, "Compte supprimé");
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private int getUserId(HttpServletRequest req) {
        return (Integer) req.getSession(false).getAttribute("userId");
    }

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }

    private Map<String, Object> buildUserData(Utilisateur u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id_utilisateur", u.getIdUtilisateur());
        m.put("nom",         u.getNom());
        m.put("prenom",      u.getPrenom());
        m.put("email",       u.getEmail());
        m.put("telephone",   u.getTelephone());
        m.put("role",        u.getRole());
        m.put("statut",      u.getStatut());
        m.put("photo_profil", u.getPhotoProfil());
        m.put("date_creation", u.getDateCreation());
        return m;
    }

    private void enrichWithClient(Map<String, Object> m, Client c) {
        m.put("id_client",   c.getIdClient());
        m.put("adresse",     c.getAdresse());
        m.put("ville",       c.getVille());
        m.put("code_postal", c.getCodePostal());
        m.put("cin",         c.getCin());
    }
}
