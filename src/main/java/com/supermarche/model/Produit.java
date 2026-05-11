package com.supermarche.model;

public class Produit {
    private int    idProduit;
    private String nomProduit;
    private String description;
    private double prix;
    private String imageProduit;
    private int    idCategorie;
    private boolean actif;

    // jointure categorie
    private String nomCategorie;

    // jointure stock
    private Integer quantiteDisponible;
    private Integer seuilAlerte;
    private String  statutStock;

    public Produit() {}

    public int     getIdProduit()           { return idProduit; }
    public String  getNomProduit()          { return nomProduit; }
    public String  getDescription()         { return description; }
    public double  getPrix()                { return prix; }
    public String  getImageProduit()        { return imageProduit; }
    public int     getIdCategorie()         { return idCategorie; }
    public boolean isActif()                { return actif; }
    public String  getNomCategorie()        { return nomCategorie; }
    public Integer getQuantiteDisponible()  { return quantiteDisponible; }
    public Integer getSeuilAlerte()         { return seuilAlerte; }
    public String  getStatutStock()         { return statutStock; }

    public void setIdProduit(int v)              { this.idProduit = v; }
    public void setNomProduit(String v)          { this.nomProduit = v; }
    public void setDescription(String v)         { this.description = v; }
    public void setPrix(double v)                { this.prix = v; }
    public void setImageProduit(String v)        { this.imageProduit = v; }
    public void setIdCategorie(int v)            { this.idCategorie = v; }
    public void setActif(boolean v)              { this.actif = v; }
    public void setNomCategorie(String v)        { this.nomCategorie = v; }
    public void setQuantiteDisponible(Integer v) { this.quantiteDisponible = v; }
    public void setSeuilAlerte(Integer v)        { this.seuilAlerte = v; }
    public void setStatutStock(String v)         { this.statutStock = v; }
}
