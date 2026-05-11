package com.supermarche.servlet.admin;

import com.google.gson.*;
import com.supermarche.dao.PromotionDAO;
import com.supermarche.dao.ProduitDAO;
import com.supermarche.model.Promotion;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * GET    /api/admin/promotions              → toutes les promotions
 * GET    /api/admin/promotions/actives      → promotions actives seulement
 * GET    /api/admin/promotions/produits     → produits avec leur promotion
 * POST   /api/admin/promotions              → créer une promotion
 * PUT    /api/admin/promotions/{id}         → modifier
 * PUT    /api/admin/promotions/{id}/toggle  → activer/désactiver
 * DELETE /api/admin/promotions/{id}         → supprimer
 */
@WebServlet("/api/admin/promotions/*")
public class AdminPromotionServlet extends HttpServlet {

    private final PromotionDAO promotionDAO = new PromotionDAO();
    private final ProduitDAO   produitDAO   = new ProduitDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String path = req.getPathInfo();
        try {
            if ("/actives".equals(path)) {
                JsonUtil.sendSuccess(res, promotionDAO.findActives());
            } else if ("/produits".equals(path)) {
                JsonUtil.sendSuccess(res, promotionDAO.findProduitsEnPromotion());
            } else {
                JsonUtil.sendSuccess(res, promotionDAO.findAll());
            }
        } catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        try {
            String body = req.getReader().lines().collect(Collectors.joining());
            JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);

            Promotion pr = buildPromotion(json);
            List<Integer> idsProduits = extractIds(json);

            // Inject admin ID from session
            HttpSession session = req.getSession(false);
            if (session != null && session.getAttribute("adminId") != null)
                pr.setIdAdminCreateur((Integer) session.getAttribute("adminId"));

            int id = promotionDAO.create(pr, idsProduits);
            Map<String,Object> result = new HashMap<>();
            result.put("id_promotion", id);
            result.put("message", "Promotion créée avec succès");
            JsonUtil.sendSuccess(res, result);
        } catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String path = req.getPathInfo(); // /{id} or /{id}/toggle
        if (path == null) { JsonUtil.sendError(res, 400, "Endpoint invalide"); return; }
        try {
            String[] parts = path.split("/");
            int id = Integer.parseInt(parts[1]);
            if (parts.length >= 3 && "toggle".equals(parts[2])) {
                String body = req.getReader().lines().collect(Collectors.joining());
                JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);
                boolean actif = json.has("actif") && json.get("actif").getAsBoolean();
                promotionDAO.toggleActif(id, actif);
                JsonUtil.sendSuccessMessage(res, "Statut mis à jour");
            } else {
                String body = req.getReader().lines().collect(Collectors.joining());
                JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);
                Promotion pr = buildPromotion(json);
                pr.setIdPromotion(id);
                promotionDAO.update(pr, extractIds(json));
                JsonUtil.sendSuccessMessage(res, "Promotion mise à jour");
            }
        } catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String path = req.getPathInfo();
        if (path == null || !path.matches("/\\d+")) { JsonUtil.sendError(res, 400, "ID manquant"); return; }
        try {
            int id = Integer.parseInt(path.substring(1));
            promotionDAO.delete(id);
            JsonUtil.sendSuccessMessage(res, "Promotion supprimée");
        } catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private Promotion buildPromotion(JsonObject json) throws Exception {
        Promotion pr = new Promotion();
        if (json.has("nom_promotion"))  pr.setNomPromotion(json.get("nom_promotion").getAsString());
        if (json.has("description"))    pr.setDescription(json.get("description").getAsString());
        if (json.has("pourcentage"))    pr.setPourcentage(json.get("pourcentage").getAsDouble());
        if (json.has("actif"))          pr.setActif(json.get("actif").getAsBoolean());
        else pr.setActif(true);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        if (json.has("date_debut") && !json.get("date_debut").isJsonNull())
            pr.setDateDebut(sdf.parse(json.get("date_debut").getAsString()));
        if (json.has("date_fin") && !json.get("date_fin").isJsonNull())
            pr.setDateFin(sdf.parse(json.get("date_fin").getAsString()));
        return pr;
    }

    private List<Integer> extractIds(JsonObject json) {
        List<Integer> ids = new ArrayList<>();
        if (json.has("ids_produits") && json.get("ids_produits").isJsonArray()) {
            json.get("ids_produits").getAsJsonArray().forEach(el -> {
                try { ids.add(el.getAsInt()); } catch (Exception ignored) {}
            });
        }
        return ids;
    }
}
