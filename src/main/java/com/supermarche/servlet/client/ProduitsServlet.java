package com.supermarche.servlet.client;

import com.supermarche.dao.ProduitDAO;
import com.supermarche.model.Produit;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * GET /api/produits          → liste tous les produits actifs
 * GET /api/produits?q=mot    → recherche par nom
 * GET /api/produits?categorie=3 → filtre par catégorie
 * GET /api/produits/{id}     → détail d'un produit
 */
@WebServlet("/api/produits/*")
public class ProduitsServlet extends HttpServlet {

    private final ProduitDAO produitDAO = new ProduitDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo(); // null ou "/{id}"

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Liste / recherche / filtre
                String q          = request.getParameter("q");
                String categorieP = request.getParameter("categorie");

                List<Produit> produits;
                if (q != null && !q.trim().isEmpty()) {
                    produits = produitDAO.searchByNom(q.trim());
                } else if (categorieP != null) {
                    produits = produitDAO.findByCategorie(Integer.parseInt(categorieP));
                } else {
                    produits = produitDAO.findAllActif();
                }
                JsonUtil.sendSuccess(response, produits);

            } else {
                // Détail d'un produit : /api/produits/{id}
                String idStr = pathInfo.substring(1);
                int id = Integer.parseInt(idStr);
                Produit p = produitDAO.findById(id);
                if (p == null || !p.isActif()) {
                    JsonUtil.sendError(response, 404, "Produit introuvable");
                } else {
                    JsonUtil.sendSuccess(response, p);
                }
            }
        } catch (NumberFormatException e) {
            JsonUtil.sendError(response, 400, "Identifiant produit invalide");
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur serveur : " + e.getMessage());
        }
    }
}
