package com.supermarche.servlet.admin;

import com.google.gson.JsonObject;
import com.supermarche.dao.CommandeDAO;
import com.supermarche.model.Commande;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * GET /api/admin/commandes               → toutes les commandes
 * PUT /api/admin/commandes/{id}/statut   → changer statut
 * PUT /api/admin/commandes/{id}/annuler  → annuler + restituer stock
 */
@WebServlet("/api/admin/commandes/*")
public class AdminCommandeServlet extends HttpServlet {

    private final CommandeDAO commandeDAO = new CommandeDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String pathInfo = request.getPathInfo(); // null or "/{id}"
            if (pathInfo != null && !pathInfo.equals("/")) {
                // GET /api/admin/commandes/{id} → commande avec lignes
                String[] parts = pathInfo.split("/");
                int idCommande = Integer.parseInt(parts[1]);
                Commande commande = commandeDAO.findById(idCommande);
                if (commande == null) {
                    JsonUtil.sendError(response, 404, "Commande introuvable");
                } else {
                    JsonUtil.sendSuccess(response, commande);
                }
            } else {
                // GET /api/admin/commandes → liste sans lignes (performance)
                String statut    = request.getParameter("statut");
                String dateDebut = request.getParameter("dateDebut");
                String dateFin   = request.getParameter("dateFin");
                List<Commande> list = commandeDAO.findAll(statut, dateDebut, dateFin);
                JsonUtil.sendSuccess(response, list);
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo(); // /{id}/statut or /{id}/annuler
        if (pathInfo == null) { JsonUtil.sendError(response, 400, "Endpoint invalide"); return; }

        String[] parts = pathInfo.split("/");
        // parts = ["", "{id}", "statut|annuler"]
        if (parts.length < 3) { JsonUtil.sendError(response, 400, "Format invalide"); return; }

        int idCommande = Integer.parseInt(parts[1]);
        String action  = parts[2];
        JsonObject json = parseBody(request);

        try {
            Commande commande = commandeDAO.findById(idCommande);
            if (commande == null) { JsonUtil.sendError(response, 404, "Commande introuvable"); return; }

            if ("statut".equals(action)) {
                String statut = json.has("statut") ? json.get("statut").getAsString()
                              : json.has("statut_commande") ? json.get("statut_commande").getAsString() : null;
                if (statut == null) { JsonUtil.sendError(response, 400, "Statut manquant"); return; }
                List<String> valides = Arrays.asList("confirmee", "en_preparation", "en_livraison", "livree");
                if (!valides.contains(statut)) {
                    JsonUtil.sendError(response, 400, "Statut invalide : " + statut);
                    return;
                }
                commandeDAO.updateStatut(idCommande, statut);
                JsonUtil.sendSuccessMessage(response, "Statut mis à jour : " + statut);

            } else if ("annuler".equals(action)) {
                if ("annulee".equals(commande.getStatutCommande())) {
                    JsonUtil.sendError(response, 400, "Commande déjà annulée");
                    return;
                }
                String raison = json.has("raison") ? json.get("raison").getAsString() : "";
                HttpSession session = request.getSession(false);
                Integer adminId = (Integer) session.getAttribute("adminId");

                commandeDAO.annulerCommande(idCommande, raison, "admin", adminId);
                JsonUtil.sendSuccessMessage(response, "Commande annulée et stock restitué");

            } else {
                JsonUtil.sendError(response, 400, "Action inconnue : " + action);
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        if (body == null || body.trim().isEmpty()) return new JsonObject();
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }
}
