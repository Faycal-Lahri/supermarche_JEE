package com.supermarche.servlet.admin;

import com.google.gson.JsonObject;
import com.supermarche.dao.ClientDAO;
import com.supermarche.dao.CommandeDAO;
import com.supermarche.dao.UtilisateurDAO;
import com.supermarche.model.Client;
import com.supermarche.util.JsonUtil;
import com.supermarche.util.PasswordUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.stream.Collectors;

/**
 * GET    /api/admin/clients                         → liste clients
 * GET    /api/admin/clients/{id}                    → profil client
 * GET    /api/admin/clients/{id}/commandes          → commandes d'un client
 * PUT    /api/admin/clients/{id}/statut             → {statut: 'suspendu'|'actif'}
 * PUT    /api/admin/clients/{id}/profil             → modifier données personnelles
 * PUT    /api/admin/clients/{id}/reset-password     → réinitialiser mot de passe
 * DELETE /api/admin/clients/{id}                    → supprimer définitivement (super_admin only)
 */
@WebServlet("/api/admin/clients/*")
public class AdminClientServlet extends HttpServlet {

    private final ClientDAO      clientDAO      = new ClientDAO();
    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();
    private final CommandeDAO    commandeDAO    = new CommandeDAO();

    // ── GET ──────────────────────────────────────────────────────────────────

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo();

            if (pathInfo != null && pathInfo.matches("/\\d+/commandes")) {
                // GET /api/admin/clients/{id}/commandes
                int idClient = Integer.parseInt(pathInfo.split("/")[1]);
                JsonUtil.sendSuccess(response, commandeDAO.findByClient(idClient));
                return;
            }

            if (pathInfo != null && pathInfo.matches("/\\d+")) {
                // GET /api/admin/clients/{id}
                int idClient = Integer.parseInt(pathInfo.split("/")[1]);
                Client client = clientDAO.findById(idClient);
                if (client == null) { JsonUtil.sendError(response, 404, "Client introuvable"); return; }
                JsonUtil.sendSuccess(response, client);
                return;
            }

            // GET /api/admin/clients
            JsonUtil.sendSuccess(response, clientDAO.findAll());

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    // ── PUT ──────────────────────────────────────────────────────────────────

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) { JsonUtil.sendError(response, 400, "Endpoint invalide"); return; }

        JsonObject json = parseBody(request);

        try {
            if (pathInfo.matches("/\\d+/statut")) {
                // PUT /api/admin/clients/{id}/statut
                int idClient = Integer.parseInt(pathInfo.split("/")[1]);
                String statut = json.has("statut") ? json.get("statut").getAsString() : "";
                if (!"actif".equals(statut) && !"suspendu".equals(statut)) {
                    JsonUtil.sendError(response, 400, "Statut invalide : actif | suspendu"); return;
                }
                Client client = clientDAO.findById(idClient);
                if (client == null) { JsonUtil.sendError(response, 404, "Client introuvable"); return; }
                utilisateurDAO.updateStatut(client.getIdUtilisateur(), statut);
                JsonUtil.sendSuccessMessage(response, "Statut mis à jour : " + statut);

            } else if (pathInfo.matches("/\\d+/profil")) {
                // PUT /api/admin/clients/{id}/profil
                int idClient = Integer.parseInt(pathInfo.split("/")[1]);
                Client client = clientDAO.findById(idClient);
                if (client == null) { JsonUtil.sendError(response, 404, "Client introuvable"); return; }

                // Update utilisateur fields
                if (json.has("nom"))       client.setNom(json.get("nom").getAsString());
                if (json.has("prenom"))    client.setPrenom(json.get("prenom").getAsString());
                if (json.has("email"))     client.setEmail(json.get("email").getAsString());
                if (json.has("telephone")) client.setTelephone(json.get("telephone").getAsString());
                utilisateurDAO.updateClientProfile(client.getIdUtilisateur(),
                        client.getNom(), client.getPrenom(), client.getEmail(), client.getTelephone());

                // Update client address fields
                if (json.has("adresse"))    client.setAdresse(json.get("adresse").getAsString());
                if (json.has("ville"))      client.setVille(json.get("ville").getAsString());
                if (json.has("codePostal")) client.setCodePostal(json.get("codePostal").getAsString());
                clientDAO.updateAdresse(client);

                JsonUtil.sendSuccessMessage(response, "Profil client mis à jour");

            } else if (pathInfo.matches("/\\d+/reset-password")) {
                // PUT /api/admin/clients/{id}/reset-password
                int idClient = Integer.parseInt(pathInfo.split("/")[1]);
                Client client = clientDAO.findById(idClient);
                if (client == null) { JsonUtil.sendError(response, 404, "Client introuvable"); return; }
                if (!json.has("nouveauMotDePasse")) {
                    JsonUtil.sendError(response, 400, "Champ 'nouveauMotDePasse' requis"); return;
                }
                String mdp = json.get("nouveauMotDePasse").getAsString();
                if (mdp.length() < 6) {
                    JsonUtil.sendError(response, 400, "Mot de passe trop court (min 6 caractères)"); return;
                }
                String hashed = PasswordUtil.hash(mdp);
                utilisateurDAO.updatePassword(client.getIdUtilisateur(), hashed);
                JsonUtil.sendSuccessMessage(response, "Mot de passe réinitialisé avec succès");

            } else {
                JsonUtil.sendError(response, 400, "Endpoint invalide");
            }

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Vérification rôle : super_admin uniquement
        HttpSession session = request.getSession(false);
        String typeAdmin = session != null ? (String) session.getAttribute("typeAdmin") : null;
        if (!"super".equals(typeAdmin)) {
            JsonUtil.sendError(response, 403, "Action réservée au Super Administrateur");
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || !pathInfo.matches("/\\d+")) {
            JsonUtil.sendError(response, 400, "Format invalide. Attendu : /{id}");
            return;
        }

        int idClient = Integer.parseInt(pathInfo.split("/")[1]);
        try {
            Client client = clientDAO.findById(idClient);
            if (client == null) { JsonUtil.sendError(response, 404, "Client introuvable"); return; }
            clientDAO.deleteDefinitively(idClient, client.getIdUtilisateur());
            JsonUtil.sendSuccessMessage(response, "Client supprimé définitivement");
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        if (body == null || body.trim().isEmpty()) return new JsonObject();
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }
}
