package com.supermarche.model;

import java.util.Date;

public class Utilisateur {
    private int    idUtilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private String telephone;
    private String role;       // client | admin_produits | admin_stock | super_admin
    private String photoProfil;
    private String statut;     // actif | suspendu
    private Date   dateCreation;

    public Utilisateur() {}

    // ── Getters ──────────────────────────────────────────────────────────────
    public int    getIdUtilisateur() { return idUtilisateur; }
    public String getNom()           { return nom; }
    public String getPrenom()        { return prenom; }
    public String getEmail()         { return email; }
    public String getMotDePasse()    { return motDePasse; }
    public String getTelephone()     { return telephone; }
    public String getRole()          { return role; }
    public String getPhotoProfil()   { return photoProfil; }
    public String getStatut()        { return statut; }
    public Date   getDateCreation()  { return dateCreation; }

    // ── Setters ──────────────────────────────────────────────────────────────
    public void setIdUtilisateur(int v)    { this.idUtilisateur = v; }
    public void setNom(String v)           { this.nom = v; }
    public void setPrenom(String v)        { this.prenom = v; }
    public void setEmail(String v)         { this.email = v; }
    public void setMotDePasse(String v)    { this.motDePasse = v; }
    public void setTelephone(String v)     { this.telephone = v; }
    public void setRole(String v)          { this.role = v; }
    public void setPhotoProfil(String v)   { this.photoProfil = v; }
    public void setStatut(String v)        { this.statut = v; }
    public void setDateCreation(Date v)    { this.dateCreation = v; }
}
