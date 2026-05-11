package com.supermarche.servlet.admin;

import com.google.gson.JsonObject;
import com.supermarche.dao.AdminDAO;
import com.supermarche.dao.StockDAO;
import com.supermarche.model.Administrateur;
import com.supermarche.model.Stock;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * GET /api/admin/stock              → dashboard stock
 * PUT /api/admin/stock/reapprovisionner → {id_produit, quantite_ajout}
 * GET /api/admin/stock/alertes      → produits sous seuil
 * GET /api/admin/stock/export       → CSV
 */
@WebServlet("/api/admin/stock/*")
public class AdminStockServlet extends HttpServlet {

    private final StockDAO stockDAO = new StockDAO();
    private final AdminDAO adminDAO = new AdminDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();

        try {
            if (pathInfo == null || "/".equals(pathInfo)) {
                List<Stock> list = stockDAO.findAll();
                JsonUtil.sendSuccess(response, list);

            } else if ("/alertes".equals(pathInfo)) {
                List<Stock> alertes = stockDAO.findAlertes();
                JsonUtil.sendSuccess(response, alertes);

            } else if ("/historique".equals(pathInfo)) {
                JsonUtil.sendSuccess(response, stockDAO.getHistorique());

            } else if ("/export".equals(pathInfo)) {
                exportCsv(response);

            } else {
                JsonUtil.sendError(response, 404, "Endpoint introuvable");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        if (!"/reapprovisionner".equals(pathInfo)) {
            JsonUtil.sendError(response, 404, "Endpoint introuvable");
            return;
        }

        JsonObject json = parseBody(request);
        int idProduit    = json.get("id_produit").getAsInt();
        int quantiteAjout = json.get("quantite_ajout").getAsInt();

        if (quantiteAjout == 0) {
            JsonUtil.sendError(response, 400, "Quantité ajout ne peut pas être 0");
            return;
        }
        // quantiteAjout peut être négatif (retrait de stock)

        try {
            Stock avant = stockDAO.findByProduit(idProduit);
            if (avant == null) { JsonUtil.sendError(response, 404, "Stock introuvable"); return; }

            Stock apres = stockDAO.reapprovisionner(idProduit, quantiteAjout);

            // Enregistrer dans historique
            HttpSession session = request.getSession(false);
            Integer adminId = (session != null) ? (Integer) session.getAttribute("adminId") : null;
            Administrateur admin = adminId != null ? adminDAO.findById(adminId) : null;

            enregistrerHistorique(idProduit, quantiteAjout,
                                  avant.getQuantiteDisponible(),
                                  apres.getQuantiteDisponible(),
                                  admin != null ? admin.getIdAdministrateur() : null);

            JsonUtil.sendSuccess(response, apres);

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    private void exportCsv(HttpServletResponse response) throws Exception {
        List<Stock> list = stockDAO.findAll();
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"stock_export.csv\"");
        PrintWriter out = response.getWriter();
        out.println("id_produit,nom_produit,categorie,quantite,seuil_alerte,statut,prix,date_mise_a_jour");
        for (Stock s : list) {
            out.printf("%d,\"%s\",\"%s\",%d,%d,%s,%.2f,%s%n",
                    s.getIdProduit(),
                    s.getNomProduit(),
                    s.getNomCategorie() != null ? s.getNomCategorie() : "",
                    s.getQuantiteDisponible(),
                    s.getSeuilAlerte(),
                    s.getStatutStock(),
                    s.getPrix(),
                    s.getDateMiseAJour() != null ? s.getDateMiseAJour().toString() : "");
        }
        out.flush();
    }

    private void enregistrerHistorique(int idProduit, int qte, int avant, int apres, Integer idAdmin)
            throws Exception {
        String typeMouvement = qte < 0 ? "sortie" : "entree";
        int absQte = Math.abs(qte);
        try (java.sql.Connection conn = com.supermarche.config.DatabaseConfig.getConnection();
             java.sql.PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO historique_stock " +
                "(id_produit, type_mouvement, quantite, quantite_avant, quantite_apres, id_admin) " +
                "VALUES (?, ?, ?, ?, ?, ?)")) {
            ps.setInt(1, idProduit);
            ps.setString(2, typeMouvement);
            ps.setInt(3, absQte);
            ps.setInt(4, avant);
            ps.setInt(5, apres);
            if (idAdmin != null) ps.setInt(6, idAdmin);
            else ps.setNull(6, java.sql.Types.INTEGER);
            ps.executeUpdate();
        }
    }

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }
}
