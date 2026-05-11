package com.supermarche.servlet.admin;

import com.google.gson.JsonObject;
import com.supermarche.config.DatabaseConfig;
import com.supermarche.dao.AdminDAO;
import com.supermarche.dao.UtilisateurDAO;
import com.supermarche.model.Administrateur;
import com.supermarche.util.JsonUtil;
import com.supermarche.util.PasswordUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GET    /api/superadmin/dashboard         → KPIs
 * GET    /api/superadmin/admins            → liste admins
 * POST   /api/superadmin/admins            → créer admin
 * PUT    /api/superadmin/admins/{id}/role  → modifier type_admin
 * DELETE /api/superadmin/admins/{id}       → désactiver admin
 */
@WebServlet("/api/superadmin/*")
public class SuperAdminServlet extends HttpServlet {

    private final AdminDAO       adminDAO       = new AdminDAO();
    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();

        try {
            if ("/dashboard".equals(pathInfo)) {
                Map<String, Object> kpis = new LinkedHashMap<>();
                try (Connection conn = DatabaseConfig.getConnection();
                     Statement stmt = conn.createStatement()) {

                    try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM produit WHERE actif=1")) {
                        rs.next(); kpis.put("nb_produits", rs.getInt(1));
                    }
                    try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM client")) {
                        rs.next(); kpis.put("nb_clients", rs.getInt(1));
                    }
                    try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM commande")) {
                        rs.next(); kpis.put("nb_commandes", rs.getInt(1));
                    }
                    try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM administrateur")) {
                        rs.next(); kpis.put("nb_admins", rs.getInt(1));
                    }
                    try (ResultSet rs = stmt.executeQuery("SELECT COALESCE(SUM(montant_total),0) FROM commande WHERE statut_commande != 'annulee'")) {
                        rs.next(); kpis.put("chiffre_affaires", rs.getDouble(1));
                    }
                    try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM stock WHERE statut_stock='alerte' OR statut_stock='rupture'")) {
                        rs.next(); kpis.put("nb_alertes_stock", rs.getInt(1));
                    }
                }
                JsonUtil.sendSuccess(response, kpis);

            } else if ("/admins".equals(pathInfo)) {
                JsonUtil.sendSuccess(response, adminDAO.findAll());

            } else {
                JsonUtil.sendError(response, 404, "Endpoint introuvable");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // POST /api/superadmin/admins → créer un admin
        JsonObject json = parseBody(request);
        try {
            String nom       = json.get("nom").getAsString();
            String prenom    = json.get("prenom").getAsString();
            String email     = json.get("email").getAsString();
            String mdp       = json.get("mot_de_passe").getAsString();
            String typeAdmin = json.get("type_admin").getAsString(); // produits | stock | super
            String telephone = json.has("telephone") ? json.get("telephone").getAsString() : null;

            // Vérifier email unique
            if (utilisateurDAO.findByEmail(email) != null) {
                JsonUtil.sendError(response, 409, "Email déjà utilisé");
                return;
            }

            // Mapper type_admin → role
            String role;
            switch (typeAdmin) {
                case "produits": role = "admin_produits"; break;
                case "stock":    role = "admin_stock"; break;
                case "super":    role = "super_admin"; break;
                default: throw new IllegalArgumentException("type_admin invalide: " + typeAdmin);
            }

            com.supermarche.model.Utilisateur u = new com.supermarche.model.Utilisateur();
            u.setNom(nom); u.setPrenom(prenom); u.setEmail(email);
            u.setMotDePasse(PasswordUtil.hash(mdp));
            u.setTelephone(telephone);
            u.setRole(role);

            int idUtil = utilisateurDAO.create(u);

            Administrateur a = new Administrateur();
            a.setIdUtilisateur(idUtil);
            a.setTypeAdmin(typeAdmin);
            int idAdmin = adminDAO.create(a);

            JsonUtil.sendJson(response, 201, buildSuccess(adminDAO.findById(idAdmin)));

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // PUT /api/superadmin/admins/{id}/role
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || !pathInfo.matches("/admins/\\d+/role")) {
            JsonUtil.sendError(response, 400, "Format invalide");
            return;
        }
        int idAdmin = Integer.parseInt(pathInfo.split("/")[2]);
        JsonObject json = parseBody(request);
        String typeAdmin = json.has("type_admin") ? json.get("type_admin").getAsString() : "";

        try {
            Administrateur a = adminDAO.findById(idAdmin);
            if (a == null) { JsonUtil.sendError(response, 404, "Admin introuvable"); return; }

            adminDAO.updateTypeAdmin(idAdmin, typeAdmin);

            // Synchroniser le rôle utilisateur
            String role;
            switch (typeAdmin) {
                case "produits": role = "admin_produits"; break;
                case "stock":    role = "admin_stock"; break;
                case "super":    role = "super_admin"; break;
                default: throw new IllegalArgumentException("type_admin invalide");
            }
            try (Connection conn = DatabaseConfig.getConnection();
                 java.sql.PreparedStatement ps = conn.prepareStatement(
                         "UPDATE utilisateur SET role=? WHERE id_utilisateur=?")) {
                ps.setString(1, role);
                ps.setInt(2, a.getIdUtilisateur());
                ps.executeUpdate();
            }
            JsonUtil.sendSuccessMessage(response, "Rôle admin mis à jour");

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // DELETE /api/superadmin/admins/{id}
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || !pathInfo.matches("/admins/\\d+")) {
            JsonUtil.sendError(response, 400, "Format invalide");
            return;
        }
        int idAdmin = Integer.parseInt(pathInfo.split("/")[2]);
        try {
            Administrateur a = adminDAO.findById(idAdmin);
            if (a == null) { JsonUtil.sendError(response, 404, "Admin introuvable"); return; }
            utilisateurDAO.updateStatut(a.getIdUtilisateur(), "suspendu");
            JsonUtil.sendSuccessMessage(response, "Admin désactivé");
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, e.getMessage());
        }
    }

    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        return JsonUtil.getGson().fromJson(body, JsonObject.class);
    }

    private Map<String, Object> buildSuccess(Object data) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("success", true); m.put("data", data); return m;
    }
}
