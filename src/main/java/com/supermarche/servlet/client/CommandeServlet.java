package com.supermarche.servlet.client;

import com.google.gson.JsonObject;
import com.supermarche.dao.CommandeDAO;
import com.supermarche.dao.PanierDAO;
import com.supermarche.model.Commande;
import com.supermarche.model.Panier;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * POST /api/commandes/passer      → valider le panier (transaction ACID)
 * GET  /api/commandes/historique  → historique du client
 * GET  /api/commandes/{id}        → détail commande
 * PUT  /api/commandes/{id}/annuler→ client annule sa commande
 */
@WebServlet("/api/commandes/*")
public class CommandeServlet extends HttpServlet {

    private final CommandeDAO commandeDAO = new CommandeDAO();
    private final PanierDAO   panierDAO   = new PanierDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        int idClient = getClientId(request);
        if (idClient <= 0) {
            JsonUtil.sendError(response, 401, "Session expirée ou non authentifiée");
            return;
        }

        try {
            if ("/historique".equals(pathInfo)) {
                List<Commande> commandes = commandeDAO.findByClient(idClient);
                JsonUtil.sendSuccess(response, commandes);

            } else if (pathInfo != null && pathInfo.matches("/\\d+")) {
                int idCommande = Integer.parseInt(pathInfo.substring(1));
                Commande c = commandeDAO.findById(idCommande);
                if (c == null || c.getIdClient() != idClient) {
                    JsonUtil.sendError(response, 404, "Commande introuvable");
                } else {
                    JsonUtil.sendSuccess(response, c);
                }
            } else {
                JsonUtil.sendError(response, 400, "Endpoint invalide");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur : " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        if (!"/passer".equals(pathInfo)) {
            JsonUtil.sendError(response, 404, "Endpoint introuvable");
            return;
        }

        int idClient = getClientId(request);
        if (idClient <= 0) {
            JsonUtil.sendError(response, 401, "Session expirée ou non authentifiée");
            return;
        }
        JsonObject json = parseBody(request);
        String adresse  = getString(json, "adresse_livraison");
        String ville    = getString(json, "ville_livraison");
        String cp       = getString(json, "code_postal_livraison");
        String modePaiement = getString(json, "methode_paiement");
        
        Integer idCodePromo = null;
        double montantRemise = 0;
        if (json.has("id_code_promo") && !json.get("id_code_promo").isJsonNull()) {
            idCodePromo = json.get("id_code_promo").getAsInt();
            montantRemise = json.has("montant_remise") ? json.get("montant_remise").getAsDouble() : 0;
        }

        try {
            Panier panier = panierDAO.findActifByClient(idClient);
            if (panier == null || panier.getProduits() == null || panier.getProduits().isEmpty()) {
                JsonUtil.sendError(response, 400, "Votre panier est vide");
                return;
            }

            Commande commande = commandeDAO.passerCommande(
                    idClient, panier.getIdPanier(), panier.getProduits(),
                    adresse, ville, cp, modePaiement, montantRemise);

            // Register promo usage if any
            if (idCodePromo != null && idCodePromo > 0) {
                com.supermarche.dao.CodePromoDAO codePromoDAO = new com.supermarche.dao.CodePromoDAO();
                try {
                    codePromoDAO.enregistrerUsage(idCodePromo, idClient, commande.getIdCommande(), montantRemise);
                } catch (Exception ex) {
                    System.err.println("Erreur enregistrement code promo : " + ex.getMessage());
                }
            }

            JsonUtil.sendJson(response, 201, buildSuccessData(commande));

        } catch (Exception e) {
            JsonUtil.sendError(response, 400, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo(); // /{id}/annuler
        if (pathInfo == null || !pathInfo.matches("/\\d+/annuler")) {
            JsonUtil.sendError(response, 400, "Endpoint invalide");
            return;
        }

        int idClient = getClientId(request);
        if (idClient <= 0) {
            JsonUtil.sendError(response, 401, "Session expirée ou non authentifiée");
            return;
        }
        int idCommande = Integer.parseInt(pathInfo.split("/")[1]);
        JsonObject json = parseBody(request);
        String raison = getString(json, "raison");

        try {
            Commande c = commandeDAO.findById(idCommande);
            if (c == null || c.getIdClient() != idClient) {
                JsonUtil.sendError(response, 404, "Commande introuvable");
                return;
            }
            if ("livree".equals(c.getStatutCommande()) || "annulee".equals(c.getStatutCommande())) {
                JsonUtil.sendError(response, 400, "Cette commande ne peut plus être annulée");
                return;
            }
            commandeDAO.annulerCommande(idCommande, raison, "client", null);
            JsonUtil.sendSuccessMessage(response, "Commande annulée avec succès");

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur : " + e.getMessage());
        }
    }

    private int getClientId(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return -1;
        Object id = session.getAttribute("clientId");
        return id != null ? (Integer) id : -1;
    }

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        if (body == null || body.trim().isEmpty()) return new JsonObject();
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }

    private String getString(JsonObject json, String key) {
        return json.has(key) && !json.get(key).isJsonNull() ? json.get(key).getAsString() : "";
    }

    private java.util.Map<String, Object> buildSuccessData(Object data) {
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("success", true);
        m.put("data", data);
        return m;
    }
}
