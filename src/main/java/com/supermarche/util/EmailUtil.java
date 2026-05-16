package com.supermarche.util;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

public class EmailUtil {

    // =========================================================
    // PARAMÈTRES À MODIFIER PAR L'UTILISATEUR (GMAIL)
    // =========================================================
    private static final String SMTP_EMAIL = "faycallahri12@gmail.com";
    private static final String SMTP_PASSWORD = "nflklksrgnzcsrep";
    // =========================================================

    public static void sendResetCode(String toEmail, String code) throws Exception {
        String subject = "L'Épicerie - Code de réinitialisation de mot de passe";
        String htmlContent = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5F5F7; padding: 60px 20px; text-align: center;\">"
                + "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tr><td align=\"center\">"
                + "<table width=\"100%\" max-width=\"460\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 460px; background-color: #ffffff; border-radius: 24px; padding: 48px; text-align: center;\">"
                + "<tr><td align=\"center\">"
                + "<div style=\"background-color: #1D1D1F; width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 32px;\">"
                + "<img src=\"https://img.icons8.com/ios-filled/50/ffffff/shopping-basket.png\" width=\"32\" height=\"32\" alt=\"L'Épicerie\" style=\"display: block; margin: 0 auto; padding-top: 16px;\"/>"
                + "</div>"
                + "<h1 style=\"color: #1D1D1F; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin: 0 0 16px 0;\">Réinitialisation</h1>"
                + "<p style=\"color: #1D1D1F; font-size: 17px; line-height: 1.47059; font-weight: 400; margin: 0 0 32px 0;\">Bonjour,<br><br>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte L'Épicerie. Voici votre code de vérification :</p>"
                + "<div style=\"background-color: #F5F5F7; border-radius: 14px; padding: 24px; margin-bottom: 32px;\">"
                + "<p style=\"font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #1D1D1F; margin: 0; margin-left: 12px;\">" + code + "</p>"
                + "</div>"
                + "<p style=\"color: #86868B; font-size: 13px; line-height: 1.38462; font-weight: 400; margin: 0;\">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.<br><br>L'équipe L'Épicerie</p>"
                + "</td></tr>"
                + "</table>"
                + "<p style=\"color: #86868B; font-size: 12px; margin-top: 24px;\">Ceci est un message automatique, merci de ne pas y répondre.</p>"
                + "</td></tr></table>"
                + "</div>";

        sendEmail(toEmail, subject, htmlContent);
    }

    public static void sendConfirmation(String toEmail) throws Exception {
        String subject = "L'Épicerie - Mot de passe modifié avec succès";
        String htmlContent = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5F5F7; padding: 60px 20px; text-align: center;\">"
                + "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tr><td align=\"center\">"
                + "<table width=\"100%\" max-width=\"460\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 460px; background-color: #ffffff; border-radius: 24px; padding: 48px; text-align: center;\">"
                + "<tr><td align=\"center\">"
                + "<div style=\"background-color: #34C759; width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 32px;\">"
                + "<img src=\"https://img.icons8.com/ios-filled/50/ffffff/checkmark.png\" width=\"32\" height=\"32\" alt=\"Succès\" style=\"display: block; margin: 0 auto; padding-top: 16px;\"/>"
                + "</div>"
                + "<h1 style=\"color: #1D1D1F; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin: 0 0 16px 0;\">Mot de passe modifié</h1>"
                + "<p style=\"color: #1D1D1F; font-size: 17px; line-height: 1.47059; font-weight: 400; margin: 0 0 32px 0;\">Bonjour,<br><br>Nous vous confirmons que votre mot de passe a bien été mis à jour avec succès.<br>Vous pouvez dès à présent vous connecter à votre compte en toute sécurité.</p>"
                + "<p style=\"color: #86868B; font-size: 13px; line-height: 1.38462; font-weight: 400; margin: 0;\">L'équipe L'Épicerie</p>"
                + "</td></tr>"
                + "</table>"
                + "<p style=\"color: #86868B; font-size: 12px; margin-top: 24px;\">Ceci est un message automatique, merci de ne pas y répondre.</p>"
                + "</td></tr></table>"
                + "</div>";

        sendEmail(toEmail, subject, htmlContent);
    }

    public static void sendOrderShipped(String toEmail, com.supermarche.model.Commande commande) throws Exception {
        String subject = "L'Épicerie - Votre commande " + commande.getNumeroCommande() + " est en route";
        String iconHtml = "<div style=\"background-color: #007AFF; width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 24px; overflow: hidden; position: relative; box-shadow: 0 8px 16px rgba(0, 122, 255, 0.2);\">"
                        + "<img src=\"https://img.icons8.com/ios-filled/50/ffffff/truck.png\" width=\"32\" height=\"32\" alt=\"Transport\" style=\"display: block; position: absolute; top: 16px; left: 16px;\" class=\"truck-anim\"/>"
                        + "<div class=\"road-anim\" style=\"position: absolute; bottom: 12px; left: 0; width: 200%; height: 2px; background: repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 4px, transparent 4px, transparent 8px);\"></div>"
                        + "</div>";

        String htmlContent = buildOrderEmail(commande, 
                "Commande expédiée",
                "Bonne nouvelle ! Votre commande a été remise à notre transporteur et est actuellement en route vers votre adresse de livraison. Préparez-vous à la recevoir !",
                iconHtml);
        sendEmail(toEmail, subject, htmlContent);
    }

    public static void sendOrderDelivered(String toEmail, com.supermarche.model.Commande commande) throws Exception {
        String subject = "L'Épicerie - Votre commande " + commande.getNumeroCommande() + " a été livrée";
        String iconHtml = "<div style=\"background-color: #34C759; width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 24px; box-shadow: 0 8px 16px rgba(52, 199, 89, 0.2);\">"
                        + "<img src=\"https://img.icons8.com/ios-filled/50/ffffff/checkmark.png\" width=\"32\" height=\"32\" alt=\"Livrée\" style=\"display: block; margin: 0 auto; padding-top: 16px;\"/>"
                        + "</div>";

        String htmlContent = buildOrderEmail(commande, 
                "Commande livrée",
                "Excellente nouvelle ! Votre commande a été livrée avec succès à votre adresse. Merci beaucoup pour votre confiance et à très bientôt chez L'Épicerie.",
                iconHtml);
        sendEmail(toEmail, subject, htmlContent);
    }

    private static String buildOrderEmail(com.supermarche.model.Commande commande, String title, String intro, String iconHtml) {
        StringBuilder itemsHtml = new StringBuilder();
        if (commande.getLignes() != null) {
            for (com.supermarche.model.LigneCommande ligne : commande.getLignes()) {
                String imgUrl = ligne.getImageProduit();
                if (imgUrl == null || imgUrl.trim().isEmpty()) {
                    imgUrl = "https://img.icons8.com/ios-filled/100/E5E5EA/shopping-basket.png";
                }
                
                itemsHtml.append("<tr>")
                         .append("<td width=\"56\" style=\"padding: 12px 0; border-bottom: 1px solid #E5E5EA; vertical-align: middle;\">")
                         .append("<img src=\"").append(imgUrl).append("\" width=\"48\" height=\"48\" alt=\"\" style=\"display: block; border-radius: 8px; object-fit: cover; border: 1px solid #E5E5EA;\"/>")
                         .append("</td>")
                         .append("<td style=\"padding: 12px 0 12px 12px; border-bottom: 1px solid #E5E5EA; text-align: left; vertical-align: middle; color: #1D1D1F; font-size: 15px;\">").append(ligne.getNomProduitSnapshot()).append(" <span style=\"color: #86868B;\">x").append(ligne.getQuantite()).append("</span></td>")
                         .append("<td style=\"padding: 12px 0; border-bottom: 1px solid #E5E5EA; text-align: right; vertical-align: middle; color: #1D1D1F; font-size: 15px; font-weight: 600;\">").append(String.format("%.2f", ligne.getPrixUnitaireSnapshot() * ligne.getQuantite())).append(" €</td>")
                         .append("</tr>");
            }
        }

        String promoHtml = "";
        if (commande.getMontantRemise() > 0) {
            promoHtml = "<tr>"
                      + "<td colspan=\"2\" style=\"padding: 12px 0; text-align: left; color: #34C759; font-size: 15px;\">Réduction" + (commande.getCodePromoUtilise() != null ? " (" + commande.getCodePromoUtilise() + ")" : "") + "</td>"
                      + "<td style=\"padding: 12px 0; text-align: right; color: #34C759; font-size: 15px; font-weight: 600;\">- " + String.format("%.2f", commande.getMontantRemise()) + " €</td>"
                      + "</tr>";
        }

        return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>"
                + "@keyframes driveTruck { 0% { transform: translateX(-40px); opacity: 0; } 10% { transform: translateX(0); opacity: 1; } 80% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(40px); opacity: 0; } }"
                + "@keyframes moveRoad { 0% { transform: translateX(0); } 100% { transform: translateX(-16px); } }"
                + ".truck-anim { animation: driveTruck 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }"
                + ".road-anim { animation: moveRoad 0.4s linear infinite; }"
                + "</style></head><body style=\"margin:0; padding:0;\">"
                + "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F5F5F7; padding: 40px 20px; text-align: center;\">"
                + "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tr><td align=\"center\">"
                + "<table width=\"100%\" max-width=\"500\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width: 500px; background-color: #ffffff; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.04);\">"
                + "<tr><td align=\"center\">"
                
                + iconHtml
                
                + "<h1 style=\"color: #1D1D1F; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin: 0 0 12px 0;\">" + title + "</h1>"
                + "<p style=\"color: #86868B; font-size: 14px; margin: 0 0 24px 0;\">Commande n° " + commande.getNumeroCommande() + "</p>"
                + "<p style=\"color: #1D1D1F; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0; text-align: left;\">" + intro + "</p>"
                
                + "<div style=\"background-color: #FBFBFD; border-radius: 16px; padding: 24px; margin-bottom: 32px;\">"
                + "<h2 style=\"color: #1D1D1F; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; text-align: left; border-bottom: 1px solid #E5E5EA; padding-bottom: 8px;\">Récapitulatif</h2>"
                + "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">"
                + itemsHtml.toString()
                + promoHtml
                + "<tr>"
                + "<td colspan=\"2\" style=\"padding: 16px 0 0 0; border-top: 1px solid #E5E5EA; text-align: left; color: #1D1D1F; font-size: 17px; font-weight: 700;\">Total</td>"
                + "<td style=\"padding: 16px 0 0 0; border-top: 1px solid #E5E5EA; text-align: right; color: #1D1D1F; font-size: 17px; font-weight: 800;\">" + String.format("%.2f", commande.getMontantTotal()) + " €</td>"
                + "</tr>"
                + "</table>"
                + "</div>"
                
                + "<div style=\"text-align: left;\">"
                + "<h3 style=\"color: #1D1D1F; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;\">Livraison à :</h3>"
                + "<p style=\"color: #86868B; font-size: 14px; line-height: 1.5; margin: 0;\">" + commande.getNomClient() + " " + commande.getPrenomClient() + "<br>" + commande.getAdresseLivraison() + "<br>" + commande.getCodePostalLivraison() + " " + commande.getVilleLivraison() + "</p>"
                + "</div>"
                
                + "</td></tr>"
                + "</table>"
                + "<p style=\"color: #86868B; font-size: 12px; margin-top: 24px;\">Besoin d'aide ? Contactez-nous à support@lepicerie.com<br>Ceci est un message automatique, merci de ne pas y répondre.</p>"
                + "</td></tr></table>"
                + "</div></body></html>";
    }

    private static void sendEmail(String toAddress, String subject, String htmlContent) throws Exception {
        if (SMTP_EMAIL.equals("VOTRE_EMAIL_ICI@gmail.com") || SMTP_PASSWORD.equals("VOTRE_MOT_DE_PASSE_APPLICATION_ICI")) {
            System.err.println("ATTENTION: L'email n'a pas pu être envoyé car les identifiants SMTP ne sont pas configurés dans EmailUtil.java.");
            return;
        }

        Properties properties = new Properties();
        properties.put("mail.smtp.host", "smtp.gmail.com");
        properties.put("mail.smtp.port", "587");
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SMTP_EMAIL, SMTP_PASSWORD);
            }
        });

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(SMTP_EMAIL, "L'Épicerie"));
        message.setReplyTo(InternetAddress.parse("noreply@lepicerie.com"));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toAddress));
        message.setSubject(subject);
        message.setContent(htmlContent, "text/html; charset=UTF-8");

        Transport.send(message);
    }
}
