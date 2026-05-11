package com.supermarche.servlet.client;

import com.supermarche.dao.CategorieDAO;
import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/categories/*")
public class CategoriesServlet extends HttpServlet {

    private final CategorieDAO categorieDAO = new CategorieDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            JsonUtil.sendSuccess(response, categorieDAO.findAll());
        } catch (Exception e) {
            JsonUtil.sendError(response, 500, "Erreur serveur : " + e.getMessage());
        }
    }
}
