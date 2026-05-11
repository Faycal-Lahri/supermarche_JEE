package com.supermarche.servlet.auth;

import com.supermarche.dao.AdminDAO;
import com.supermarche.dao.ClientDAO;
import com.supermarche.dao.UtilisateurDAO;
import com.supermarche.model.Administrateur;
import com.supermarche.model.Client;
import com.supermarche.model.Utilisateur;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/auth/me")
public class MeServlet extends HttpServlet {

    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();
    private final ClientDAO      clientDAO      = new ClientDAO();
    private final AdminDAO       adminDAO       = new AdminDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            JsonUtil.sendError(response, 401, "Non authentifié");
            return;
        }

        int userId = (int) session.getAttribute("userId");
        try {
            Utilisateur u = utilisateurDAO.findById(userId);
            if (u == null) {
                JsonUtil.sendError(response, 404, "Utilisateur introuvable");
                return;
            }

            Map<String, Object> userData = new LinkedHashMap<>();
            userData.put("id_utilisateur", u.getIdUtilisateur());
            userData.put("nom",         u.getNom());
            userData.put("prenom",      u.getPrenom());
            userData.put("email",       u.getEmail());
            userData.put("role",        u.getRole());
            userData.put("telephone",   u.getTelephone());
            userData.put("statut",      u.getStatut());
            userData.put("photo_profil", u.getPhotoProfil());
            userData.put("date_creation", u.getDateCreation());

            if ("client".equals(u.getRole())) {
                Client client = clientDAO.findByUserId(userId);
                if (client != null) {
                    userData.put("id_client",   client.getIdClient());
                    userData.put("adresse",     client.getAdresse());
                    userData.put("ville",       client.getVille());
                    userData.put("code_postal", client.getCodePostal());
                    userData.put("cin",         client.getCin());
                }
            } else {
                Administrateur admin = adminDAO.findByUserId(userId);
                if (admin != null) {
                    userData.put("id_admin",   admin.getIdAdministrateur());
                    userData.put("type_admin", admin.getTypeAdmin());
                }
            }

            JsonUtil.sendSuccess(response, userData);
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur serveur : " + e.getMessage());
        }
    }
}
