package com.supermarche.model;

import java.util.Date;

public class Stock {
    private int    idStock;
    private int    idProduit;
    private int    quantiteDisponible;
    private int    seuilAlerte;
    private String statutStock;   // disponible | alerte | rupture
    private Date   dateMiseAJour;

    // jointure produit
    private String nomProduit;
    private double prix;
    private String imageProduit;
    private String nomCategorie;

    public Stock() {}

    public int    getIdStock()              { return idStock; }
    public int    getIdProduit()            { return idProduit; }
    public int    getQuantiteDisponible()   { return quantiteDisponible; }
    public int    getSeuilAlerte()          { return seuilAlerte; }
    public String getStatutStock()          { return statutStock; }
    public Date   getDateMiseAJour()        { return dateMiseAJour; }
    public String getNomProduit()           { return nomProduit; }
    public double getPrix()                 { return prix; }
    public String getImageProduit()         { return imageProduit; }
    public String getNomCategorie()         { return nomCategorie; }

    public void setIdStock(int v)              { this.idStock = v; }
    public void setIdProduit(int v)            { this.idProduit = v; }
    public void setQuantiteDisponible(int v)   { this.quantiteDisponible = v; }
    public void setSeuilAlerte(int v)          { this.seuilAlerte = v; }
    public void setStatutStock(String v)       { this.statutStock = v; }
    public void setDateMiseAJour(Date v)       { this.dateMiseAJour = v; }
    public void setNomProduit(String v)        { this.nomProduit = v; }
    public void setPrix(double v)              { this.prix = v; }
    public void setImageProduit(String v)      { this.imageProduit = v; }
    public void setNomCategorie(String v)      { this.nomCategorie = v; }
}
