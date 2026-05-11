package com.supermarche.model;

import java.util.Date;

public class PanierProduit {
    private int    idPanierProduit;
    private int    idPanier;
    private int    idProduit;
    private int    quantite;
    private double prixUnitaireSnapshot;
    private Date   dateAjout;

    // jointure produit
    private String nomProduit;
    private String imageProduit;
    private double prixActuel;
    private int    quantiteDisponible;

    public PanierProduit() {}

    public int    getIdPanierProduit()       { return idPanierProduit; }
    public int    getIdPanier()              { return idPanier; }
    public int    getIdProduit()             { return idProduit; }
    public int    getQuantite()              { return quantite; }
    public double getPrixUnitaireSnapshot()  { return prixUnitaireSnapshot; }
    public Date   getDateAjout()             { return dateAjout; }
    public String getNomProduit()            { return nomProduit; }
    public String getImageProduit()          { return imageProduit; }
    public double getPrixActuel()            { return prixActuel; }
    public int    getQuantiteDisponible()    { return quantiteDisponible; }

    public void setIdPanierProduit(int v)        { this.idPanierProduit = v; }
    public void setIdPanier(int v)               { this.idPanier = v; }
    public void setIdProduit(int v)              { this.idProduit = v; }
    public void setQuantite(int v)               { this.quantite = v; }
    public void setPrixUnitaireSnapshot(double v){ this.prixUnitaireSnapshot = v; }
    public void setDateAjout(Date v)             { this.dateAjout = v; }
    public void setNomProduit(String v)          { this.nomProduit = v; }
    public void setImageProduit(String v)        { this.imageProduit = v; }
    public void setPrixActuel(double v)          { this.prixActuel = v; }
    public void setQuantiteDisponible(int v)     { this.quantiteDisponible = v; }
}
