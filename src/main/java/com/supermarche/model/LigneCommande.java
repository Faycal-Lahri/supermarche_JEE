package com.supermarche.model;

public class LigneCommande {
    private int    idLigneCommande;
    private int    idCommande;
    private Integer idProduit;
    private String nomProduitSnapshot;
    private double prixUnitaireSnapshot;
    private int    quantite;
    private double sousTotal;
    private String imageProduit;

    public LigneCommande() {}

    public int    getIdLigneCommande()       { return idLigneCommande; }
    public int    getIdCommande()            { return idCommande; }
    public Integer getIdProduit()            { return idProduit; }
    public String  getNomProduitSnapshot()   { return nomProduitSnapshot; }
    public double  getPrixUnitaireSnapshot() { return prixUnitaireSnapshot; }
    public int     getQuantite()             { return quantite; }
    public double  getSousTotal()            { return sousTotal; }
    public String  getImageProduit()         { return imageProduit; }

    public void setIdLigneCommande(int v)        { this.idLigneCommande = v; }
    public void setIdCommande(int v)             { this.idCommande = v; }
    public void setIdProduit(Integer v)          { this.idProduit = v; }
    public void setNomProduitSnapshot(String v)  { this.nomProduitSnapshot = v; }
    public void setPrixUnitaireSnapshot(double v){ this.prixUnitaireSnapshot = v; }
    public void setQuantite(int v)               { this.quantite = v; }
    public void setSousTotal(double v)           { this.sousTotal = v; }
    public void setImageProduit(String v)        { this.imageProduit = v; }
}
