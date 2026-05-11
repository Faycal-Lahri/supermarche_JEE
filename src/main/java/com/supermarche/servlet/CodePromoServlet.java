package com.supermarche.servlet;

import com.google.gson.*;
import com.supermarche.dao.CodePromoDAO;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * POST /api/promo/valider  → { code, montant } → valide le code et retourne la remise
 * Accessible aux clients connectés
 */
@WebServlet("/api/promo/valider")
public class CodePromoServlet extends HttpServlet {

    private final CodePromoDAO codePromoDAO = new CodePromoDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        try {
            String body = req.getReader().lines().collect(Collectors.joining());
            JsonObject json = JsonUtil.getGson().fromJson(body, JsonObject.class);

            String code = json.has("code") ? json.get("code").getAsString().trim().toUpperCase() : "";

            // Accepter "montant" OU "montant_total" (compatibilité frontend)
            double montant = 0;
            if (json.has("montant_total")) montant = json.get("montant_total").getAsDouble();
            else if (json.has("montant")) montant = json.get("montant").getAsDouble();

            if (code.isEmpty()) { JsonUtil.sendError(res, 400, "Code promo manquant"); return; }

            CodePromoDAO.ValidationResult result = codePromoDAO.validate(code, montant);

            if (!result.valid) {
                // Retourner 400 pour que le frontend puisse attraper l'erreur
                JsonUtil.sendError(res, 400, result.message);
                return;
            }

            Map<String,Object> data = new LinkedHashMap<>();
            data.put("valid",         true);
            data.put("message",       result.message);
            data.put("remise",        result.remise);
            data.put("type_remise",   result.codePromo.getTypeRemise());   // "pourcentage" ou "montant"
            data.put("valeur",        result.codePromo.getValeur());
            data.put("code",          result.codePromo.getCode());
            data.put("id_code_promo", result.codePromo.getIdCodePromo());
            JsonUtil.sendSuccess(res, data);
        } catch (Exception e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }
}
