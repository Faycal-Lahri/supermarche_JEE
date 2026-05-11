package com.supermarche.servlet.admin;

import com.google.gson.JsonObject;
import com.supermarche.dao.CategorieDAO;
import com.supermarche.model.Categorie;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.stream.Collectors;

/**
 * GET    /api/admin/categories        → liste
 * POST   /api/admin/categories        → créer
 * PUT    /api/admin/categories/{id}   → modifier
 * DELETE /api/admin/categories/{id}   → supprimer (si 0 produits liés)
 */
@WebServlet("/api/admin/categories/*")
public class AdminCategorieServlet extends HttpServlet {

    private final CategorieDAO categorieDAO = new CategorieDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            JsonUtil.sendSuccess(response, categorieDAO.findAll());
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        JsonObject json = parseBody(request);
        try {
            Categorie c = new Categorie();
            c.setNomCategorie(json.get("nom_categorie").getAsString());
            c.setDescription(json.has("description") ? json.get("description").getAsString() : null);
            c.setIdCategorieParent(json.has("id_categorie_parent") && !json.get("id_categorie_parent").isJsonNull()
                    ? json.get("id_categorie_parent").getAsInt() : null);
            int id = categorieDAO.create(c);
            JsonUtil.sendJson(response, 201, buildSuccess(categorieDAO.findById(id)));
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int id = extractId(request);
        JsonObject json = parseBody(request);
        try {
            Categorie c = categorieDAO.findById(id);
            if (c == null) { JsonUtil.sendError(response, 404, "Catégorie introuvable"); return; }
            if (json.has("nom_categorie")) c.setNomCategorie(json.get("nom_categorie").getAsString());
            if (json.has("description"))   c.setDescription(json.get("description").getAsString());
            categorieDAO.update(c);
            JsonUtil.sendSuccess(response, categorieDAO.findById(id));
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int id = extractId(request);
        try {
            boolean deleted = categorieDAO.delete(id);
            if (!deleted) {
                JsonUtil.sendError(response, 400, "Impossible de supprimer : des produits sont liés à cette catégorie");
            } else {
                JsonUtil.sendSuccessMessage(response, "Catégorie supprimée");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    private int extractId(HttpServletRequest req) {
        String pathInfo = req.getPathInfo();
        return Integer.parseInt(pathInfo.substring(1));
    }

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }

    private java.util.Map<String, Object> buildSuccess(Object data) {
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("success", true); m.put("data", data); return m;
    }
}
