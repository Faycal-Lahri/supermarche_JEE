package com.supermarche.model;

public class Client {
    private int    idClient;
    private int    idUtilisateur;
    private String cin;
    private String adresse;
    private String ville;
    private String codePostal;

    // optionnel : données jointure utilisateur
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String statut;
    private String photoProfil;
    private java.util.Date dateCreation; // date d'inscription

    public Client() {}

    public int    getIdClient()       { return idClient; }
    public int    getIdUtilisateur()  { return idUtilisateur; }
    public String getCin()            { return cin; }
    public String getAdresse()        { return adresse; }
    public String getVille()          { return ville; }
    public String getCodePostal()     { return codePostal; }
    public String getNom()            { return nom; }
    public String getPrenom()         { return prenom; }
    public String getEmail()          { return email; }
    public String getTelephone()      { return telephone; }
    public String getStatut()         { return statut; }
    public String getPhotoProfil()    { return photoProfil; }
    public java.util.Date getDateCreation() { return dateCreation; }

    public void setIdClient(int v)       { this.idClient = v; }
    public void setIdUtilisateur(int v)  { this.idUtilisateur = v; }
    public void setCin(String v)         { this.cin = v; }
    public void setAdresse(String v)     { this.adresse = v; }
    public void setVille(String v)       { this.ville = v; }
    public void setCodePostal(String v)  { this.codePostal = v; }
    public void setNom(String v)         { this.nom = v; }
    public void setPrenom(String v)      { this.prenom = v; }
    public void setEmail(String v)       { this.email = v; }
    public void setTelephone(String v)   { this.telephone = v; }
    public void setStatut(String v)      { this.statut = v; }
    public void setPhotoProfil(String v) { this.photoProfil = v; }
    public void setDateCreation(java.util.Date v) { this.dateCreation = v; }
}
