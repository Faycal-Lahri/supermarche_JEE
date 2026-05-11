package com.supermarche.servlet.admin;

import com.google.gson.JsonObject;
import com.supermarche.dao.ProduitDAO;
import com.supermarche.dao.StockDAO;
import com.supermarche.model.Produit;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * GET    /api/admin/produits        → liste tous les produits (avec stock)
 * POST   /api/admin/produits        → ajouter produit + stock initial
 * PUT    /api/admin/produits/{id}   → modifier produit
 * DELETE /api/admin/produits/{id}   → désactiver produit
 */
@WebServlet("/api/admin/produits/*")
public class AdminProduitServlet extends HttpServlet {

    private final ProduitDAO produitDAO = new ProduitDAO();
    private final StockDAO   stockDAO   = new StockDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            List<Produit> list = produitDAO.findAll();
            JsonUtil.sendSuccess(response, list);
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        JsonObject json = parseBody(request);
        try {
            Produit p = new Produit();
            p.setNomProduit(json.get("nom_produit").getAsString());
            p.setDescription(json.has("description") ? json.get("description").getAsString() : "");
            p.setPrix(json.get("prix").getAsDouble());
            p.setImageProduit(json.has("image_produit") ? json.get("image_produit").getAsString() : null);
            p.setIdCategorie(json.get("id_categorie").getAsInt());
            p.setActif(true);

            int idProduit = produitDAO.create(p);

            // Initialiser le stock
            int quantiteInit = json.has("quantite_initiale") ? json.get("quantite_initiale").getAsInt() : 0;
            int seuil        = json.has("seuil_alerte")       ? json.get("seuil_alerte").getAsInt()       : 10;
            stockDAO.initStock(idProduit, quantiteInit, seuil);

            Produit created = produitDAO.findById(idProduit);
            JsonUtil.sendJson(response, 201, buildSuccess(created));

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            JsonUtil.sendError(response, 400, "ID produit requis");
            return;
        }
        int id = Integer.parseInt(pathInfo.substring(1));
        JsonObject json = parseBody(request);

        try {
            Produit p = produitDAO.findById(id);
            if (p == null) { JsonUtil.sendError(response, 404, "Produit introuvable"); return; }

            if (json.has("nom_produit"))   p.setNomProduit(json.get("nom_produit").getAsString());
            if (json.has("description"))   p.setDescription(json.get("description").getAsString());
            if (json.has("prix"))          p.setPrix(json.get("prix").getAsDouble());
            if (json.has("image_produit")) p.setImageProduit(json.get("image_produit").getAsString());
            if (json.has("id_categorie"))  p.setIdCategorie(json.get("id_categorie").getAsInt());
            if (json.has("actif"))         p.setActif(json.get("actif").getAsBoolean());

            produitDAO.update(p);
            JsonUtil.sendSuccess(response, produitDAO.findById(id));

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            JsonUtil.sendError(response, 400, "ID produit requis");
            return;
        }
        int id = Integer.parseInt(pathInfo.substring(1));
        try {
            produitDAO.delete(id); // soft-delete
            JsonUtil.sendSuccessMessage(response, "Produit désactivé");
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
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
