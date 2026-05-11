package com.supermarche.servlet;

import com.supermarche.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@WebServlet("/api/upload")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024, // 1MB
    maxFileSize = 1024 * 1024 * 10,  // 10MB
    maxRequestSize = 1024 * 1024 * 50 // 50MB
)
public class UploadServlet extends HttpServlet {

    // On sauvegarde dans un dossier "images" à l'extérieur de l'application web si possible,
    // ou dans le dossier webapp/images. Pour simplifier, on sauvegarde dans getServletContext().getRealPath("/images")
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            Part filePart = req.getPart("image");
            if (filePart == null) {
                JsonUtil.sendError(resp, 400, "Aucun fichier fourni");
                return;
            }

            String fileName = extractFileName(filePart);
            if (fileName == null || fileName.isEmpty()) {
                JsonUtil.sendError(resp, 400, "Nom de fichier invalide");
                return;
            }

            // Générer un nom unique
            String extension = "";
            int i = fileName.lastIndexOf('.');
            if (i > 0) {
                extension = fileName.substring(i);
            }
            String uniqueName = UUID.randomUUID().toString() + extension;

            // Chemin de sauvegarde
            String uploadPath = getServletContext().getRealPath("") + File.separator + "images";
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) uploadDir.mkdir();

            filePart.write(uploadPath + File.separator + uniqueName);

            Map<String, String> result = new HashMap<>();
            result.put("fileName", uniqueName);
            result.put("url", "images/" + uniqueName);
            
            JsonUtil.sendSuccess(resp, result);

        } catch (Exception e) {
            JsonUtil.sendError(resp, 500, "Erreur upload : " + e.getMessage());
        }
    }

    private String extractFileName(Part part) {
        String contentDisp = part.getHeader("content-disposition");
        String[] items = contentDisp.split(";");
        for (String s : items) {
            if (s.trim().startsWith("filename")) {
                return s.substring(s.indexOf("=") + 2, s.length() - 1);
            }
        }
        return "";
    }
}
