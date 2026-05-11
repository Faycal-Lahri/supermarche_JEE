package com.supermarche.servlet;

import com.supermarche.dao.PromotionDAO;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Routes PUBLIQUES (sans authentification) pour les promotions :
 *
 * GET /api/promotions/produits  → produits en promotion avec prix barré et %remise
 * GET /api/promotions/actives   → liste des promotions actives (nom, description, %)
 *
 * Ces routes ne sont PAS couvertes par AuthFilter (pattern /api/promotions/*
 * n'est pas dans la liste urlPatterns du filtre).
 */
@WebServlet("/api/promotions/*")
public class PromotionsPublicServlet extends HttpServlet {

    private final PromotionDAO promotionDAO = new PromotionDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();

        try {
            if ("/produits".equals(pathInfo)) {
                // Retourne les produits avec prix barré, % remise, nom promo, etc.
                JsonUtil.sendSuccess(response, promotionDAO.findProduitsEnPromotion());

            } else if ("/actives".equals(pathInfo) || pathInfo == null || "/".equals(pathInfo)) {
                // Retourne la liste des promotions actives (sans détail produits)
                JsonUtil.sendSuccess(response, promotionDAO.findActives());

            } else {
                JsonUtil.sendError(response, 404, "Endpoint introuvable");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }
}
