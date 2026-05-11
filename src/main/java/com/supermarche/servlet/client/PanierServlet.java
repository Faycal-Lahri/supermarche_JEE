package com.supermarche.servlet.client;

import com.google.gson.JsonObject;
import com.supermarche.dao.PanierDAO;
import com.supermarche.dao.ProduitDAO;
import com.supermarche.dao.PromotionDAO;
import com.supermarche.model.Panier;
import com.supermarche.model.Produit;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.stream.Collectors;

/**
 * GET    /api/panier              → contenu panier
 * POST   /api/panier/ajouter     → {id_produit, quantite}
 * PUT    /api/panier/modifier    → {id_produit, quantite}
 * POST   /api/panier/supprimer   → {id_produit}  (aussi DELETE)
 */
@WebServlet("/api/panier/*")
public class PanierServlet extends HttpServlet {

    private final PanierDAO     panierDAO     = new PanierDAO();
    private final ProduitDAO    produitDAO    = new ProduitDAO();
    private final PromotionDAO  promotionDAO  = new PromotionDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int idClient = getClientId(request);
        if (idClient <= 0) { JsonUtil.sendError(response, 401, "Non authentifie"); return; }
        try {
            Panier panier = panierDAO.findActifByClient(idClient);
            if (panier == null) panier = panierDAO.createPanier(idClient);
            JsonUtil.sendSuccess(response, panier);
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur : " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int idClient = getClientId(request);
        if (idClient <= 0) { JsonUtil.sendError(response, 401, "Non authentifie"); return; }

        String path = request.getPathInfo(); // "/ajouter" ou "/supprimer"

        // Route POST /panier/supprimer
        if ("/supprimer".equals(path)) {
            doSupprimerPost(request, response, idClient);
            return;
        }

        // Route POST /panier/ajouter (ou POST /panier par défaut)
        JsonObject json = parseBody(request);
        int idProduit = json.get("id_produit").getAsInt();
        int quantite  = json.has("quantite") ? json.get("quantite").getAsInt() : 1;

        if (quantite <= 0) { JsonUtil.sendError(response, 400, "Quantite invalide"); return; }

        try {
            Produit produit = produitDAO.findById(idProduit);
            if (produit == null || !produit.isActif()) {
                JsonUtil.sendError(response, 404, "Produit introuvable");
                return;
            }
            if (produit.getQuantiteDisponible() != null && quantite > produit.getQuantiteDisponible()) {
                JsonUtil.sendError(response, 400, "Stock insuffisant. Disponible : " + produit.getQuantiteDisponible());
                return;
            }

            // ── Appliquer le prix promo si une promotion active existe pour ce produit ──
            double prixEffectif = produit.getPrix();
            try {
                double prixPromo = promotionDAO.getPrixPromoActif(idProduit, produit.getPrix());
                if (prixPromo < prixEffectif) prixEffectif = prixPromo;
            } catch (Exception ignored) { /* si la promo n'est pas dispo, on garde le prix normal */ }

            Panier panier = panierDAO.findActifByClient(idClient);
            if (panier == null) panier = panierDAO.createPanier(idClient);

            panierDAO.ajouterProduit(panier.getIdPanier(), idProduit, quantite, prixEffectif);
            Panier updated = panierDAO.findById(panier.getIdPanier());
            JsonUtil.sendSuccess(response, updated);

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur : " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int idClient = getClientId(request);
        if (idClient <= 0) { JsonUtil.sendError(response, 401, "Non authentifie"); return; }
        JsonObject json = parseBody(request);
        int idProduit = json.get("id_produit").getAsInt();
        int quantite  = json.get("quantite").getAsInt();

        try {
            Panier panier = panierDAO.findActifByClient(idClient);
            if (panier == null) { JsonUtil.sendError(response, 404, "Panier introuvable"); return; }
            panierDAO.modifierQuantite(panier.getIdPanier(), idProduit, quantite);
            Panier updated = panierDAO.findById(panier.getIdPanier());
            JsonUtil.sendSuccess(response, updated);
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur : " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int idClient = getClientId(request);
        if (idClient <= 0) { JsonUtil.sendError(response, 401, "Non authentifie"); return; }
        doSupprimerPost(request, response, idClient);
    }

    /** Suppression partagée entre POST /supprimer et DELETE */
    private void doSupprimerPost(HttpServletRequest request, HttpServletResponse response, int idClient)
            throws IOException {
        try {
            JsonObject json = parseBody(request);
            int idProduit = json.get("id_produit").getAsInt();
            Panier panier = panierDAO.findActifByClient(idClient);
            if (panier == null) { JsonUtil.sendError(response, 404, "Panier introuvable"); return; }
            panierDAO.supprimerProduit(panier.getIdPanier(), idProduit);
            Panier updated = panierDAO.findById(panier.getIdPanier());
            JsonUtil.sendSuccess(response, updated);
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur : " + e.getMessage());
        }
    }

    private int getClientId(HttpServletRequest req) {
        try {
            HttpSession session = req.getSession(false);
            if (session == null) return -1;
            Object id = session.getAttribute("clientId");
            return id != null ? (Integer) id : -1;
        } catch (Exception e) {
            return -1;
        }
    }

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }
}
