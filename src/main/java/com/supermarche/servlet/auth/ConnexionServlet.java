package com.supermarche.servlet.auth;

import com.google.gson.JsonObject;
import com.supermarche.dao.AdminDAO;
import com.supermarche.dao.ClientDAO;
import com.supermarche.dao.UtilisateurDAO;
import com.supermarche.model.Administrateur;
import com.supermarche.model.Client;
import com.supermarche.model.Utilisateur;
import com.supermarche.util.JsonUtil;
import com.supermarche.util.PasswordUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet("/api/auth/connexion")
public class ConnexionServlet extends HttpServlet {

    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();
    private final ClientDAO      clientDAO      = new ClientDAO();
    private final AdminDAO       adminDAO       = new AdminDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String body = request.getReader().lines().collect(Collectors.joining());
        JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);

        String email = json.has("email") ? json.get("email").getAsString().trim() : "";
        String mdp   = json.has("mot_de_passe") ? json.get("mot_de_passe").getAsString() : "";

        if (email.isEmpty() || mdp.isEmpty()) {
            JsonUtil.sendError(response, 400, "Email et mot de passe requis");
            return;
        }

        try {
            Utilisateur u = utilisateurDAO.findByEmail(email);
            if (u == null || !PasswordUtil.verify(mdp, u.getMotDePasse())) {
                JsonUtil.sendError(response, 401, "Email ou mot de passe incorrect");
                return;
            }

            if ("suspendu".equals(u.getStatut())) {
                JsonUtil.sendError(response, 403, "Votre compte a été suspendu");
                return;
            }

            // Créer la session
            HttpSession session = request.getSession(true);
            session.setAttribute("userId", u.getIdUtilisateur());
            session.setAttribute("role",   u.getRole());
            session.setAttribute("email",  u.getEmail());

            Map<String, Object> userData = new LinkedHashMap<>();
            userData.put("id_utilisateur", u.getIdUtilisateur());
            userData.put("nom",     u.getNom());
            userData.put("prenom",  u.getPrenom());
            userData.put("email",   u.getEmail());
            userData.put("role",    u.getRole());
            userData.put("statut",  u.getStatut());
            userData.put("photo_profil", u.getPhotoProfil());

            // Enrichir selon le rôle
            if ("client".equals(u.getRole())) {
                Client client = clientDAO.findByUserId(u.getIdUtilisateur());
                if (client != null) {
                    session.setAttribute("clientId", client.getIdClient());
                    userData.put("id_client", client.getIdClient());
                    userData.put("adresse",     client.getAdresse());
                    userData.put("ville",       client.getVille());
                    userData.put("code_postal", client.getCodePostal());
                }
            } else {
                Administrateur admin = adminDAO.findByUserId(u.getIdUtilisateur());
                if (admin != null) {
                    session.setAttribute("adminId",    admin.getIdAdministrateur());
                    session.setAttribute("typeAdmin",  admin.getTypeAdmin()); // "super" | "produits" | "stock"
                    userData.put("id_admin",   admin.getIdAdministrateur());
                    userData.put("type_admin", admin.getTypeAdmin());
                }
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("success", true);
            result.put("data", userData);
            JsonUtil.sendJson(response, 200, result);

        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur serveur : " + e.getMessage());
        }
    }
}
