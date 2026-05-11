package com.supermarche.filter;

import com.supermarche.util.JsonUtil;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Filtre d'authentification pour les routes protégées /api/panier/*, /api/commandes/*,
 * /api/profil/*, /api/admin/*, /api/superadmin/*.
 * Les routes publiques (auth, produits, categories, test-db) sont exclues.
 */
@WebFilter(urlPatterns = {
    "/api/panier/*",
    "/api/commandes/*",
    "/api/profil/*",
    "/api/admin/*",
    "/api/superadmin/*"
})
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest)  req;
        HttpServletResponse response = (HttpServletResponse) res;

        HttpSession session = request.getSession(false);
        boolean authenticated = (session != null && session.getAttribute("userId") != null);

        if (!authenticated) {
            JsonUtil.sendError(response, 401, "Non authentifié. Veuillez vous connecter.");
            return;
        }

        // Vérification des rôles pour les routes admin
        String path = request.getRequestURI();
        String role = (String) session.getAttribute("role");

        if (path.startsWith(request.getContextPath() + "/api/superadmin/")) {
            if (!"super_admin".equals(role)) {
                JsonUtil.sendError(response, 403, "Accès refusé. Rôle super_admin requis.");
                return;
            }
        } else if (path.startsWith(request.getContextPath() + "/api/admin/stock") ||
                   path.startsWith(request.getContextPath() + "/api/admin/commandes")) {
            if (!"admin_stock".equals(role) && !"super_admin".equals(role)) {
                JsonUtil.sendError(response, 403, "Accès refusé. Rôle admin_stock ou super_admin requis.");
                return;
            }
        } else if (path.startsWith(request.getContextPath() + "/api/admin/")) {
            if (!"admin_produits".equals(role) && !"admin_stock".equals(role) && !"super_admin".equals(role)) {
                JsonUtil.sendError(response, 403, "Accès refusé. Rôle administrateur requis.");
                return;
            }
        }

        chain.doFilter(req, res);
    }

    @Override
    public void destroy() {}
}
