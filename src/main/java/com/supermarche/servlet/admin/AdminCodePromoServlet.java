package com.supermarche.servlet.admin;

import com.google.gson.*;
import com.supermarche.dao.CodePromoDAO;
import com.supermarche.model.CodePromo;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.stream.Collectors;

/**
 * GET    /api/admin/codes-promo           → liste tous les codes
 * POST   /api/admin/codes-promo           → créer un code promo
 * PUT    /api/admin/codes-promo/{id}/toggle → activer/désactiver
 * DELETE /api/admin/codes-promo/{id}      → supprimer
 * (Super Admin uniquement)
 */
@WebServlet("/api/admin/codes-promo/*")
public class AdminCodePromoServlet extends HttpServlet {

    private final CodePromoDAO dao = new CodePromoDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        try { JsonUtil.sendSuccess(res, dao.findAll()); }
        catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        try {
            String body = req.getReader().lines().collect(Collectors.joining());
            JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);
            CodePromo cp = build(json);

            HttpSession session = req.getSession(false);
            if (session != null && session.getAttribute("adminId") != null)
                cp.setIdAdminCreateur((Integer) session.getAttribute("adminId"));

            int id = dao.create(cp);
            JsonUtil.sendSuccessMessage(res, "Code promo créé (ID: " + id + ")");
        } catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String path = req.getPathInfo(); // /{id}/toggle
        if (path == null) { JsonUtil.sendError(res, 400, "Endpoint invalide"); return; }
        try {
            String[] parts = path.split("/");
            int id = Integer.parseInt(parts[1]);
            String body = req.getReader().lines().collect(Collectors.joining());
            JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);
            boolean actif = json.has("actif") && json.get("actif").getAsBoolean();
            dao.toggleActif(id, actif);
            JsonUtil.sendSuccessMessage(res, "Statut mis à jour");
        } catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String path = req.getPathInfo();
        if (path == null || !path.matches("/\\d+")) { JsonUtil.sendError(res, 400, "ID manquant"); return; }
        try {
            dao.delete(Integer.parseInt(path.substring(1)));
            JsonUtil.sendSuccessMessage(res, "Code supprimé");
        } catch (Exception e) { JsonUtil.sendError(res, 500, e.getMessage()); }
    }

    private CodePromo build(JsonObject json) throws Exception {
        CodePromo cp = new CodePromo();
        if (json.has("code"))         cp.setCode(json.get("code").getAsString().toUpperCase().trim());
        if (json.has("description"))  cp.setDescription(json.get("description").getAsString());
        if (json.has("type_remise"))  cp.setTypeRemise(json.get("type_remise").getAsString());
        else                          cp.setTypeRemise("pourcentage");
        if (json.has("valeur"))       cp.setValeur(json.get("valeur").getAsDouble());
        if (json.has("montant_min"))  cp.setMontantMin(json.get("montant_min").getAsDouble());
        if (json.has("usage_max") && !json.get("usage_max").isJsonNull())
            cp.setUsageMax(json.get("usage_max").getAsInt());
        cp.setActif(true);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        if (json.has("date_debut") && !json.get("date_debut").isJsonNull() && !json.get("date_debut").getAsString().isEmpty())
            cp.setDateDebut(sdf.parse(json.get("date_debut").getAsString()));
        if (json.has("date_fin") && !json.get("date_fin").isJsonNull() && !json.get("date_fin").getAsString().isEmpty())
            cp.setDateFin(sdf.parse(json.get("date_fin").getAsString()));
        return cp;
    }
}
