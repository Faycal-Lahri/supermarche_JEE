package com.supermarche.model;

public class Administrateur {
    private int    idAdministrateur;
    private int    idUtilisateur;
    private String typeAdmin;  // produits | stock | super

    // jointure utilisateur
    private String nom;
    private String prenom;
    private String email;
    private String statut;

    public Administrateur() {}

    public int    getIdAdministrateur() { return idAdministrateur; }
    public int    getIdUtilisateur()    { return idUtilisateur; }
    public String getTypeAdmin()        { return typeAdmin; }
    public String getNom()              { return nom; }
    public String getPrenom()           { return prenom; }
    public String getEmail()            { return email; }
    public String getStatut()           { return statut; }

    public void setIdAdministrateur(int v) { this.idAdministrateur = v; }
    public void setIdUtilisateur(int v)    { this.idUtilisateur = v; }
    public void setTypeAdmin(String v)     { this.typeAdmin = v; }
    public void setNom(String v)           { this.nom = v; }
    public void setPrenom(String v)        { this.prenom = v; }
    public void setEmail(String v)         { this.email = v; }
    public void setStatut(String v)        { this.statut = v; }
}
