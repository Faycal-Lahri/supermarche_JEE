package com.supermarche.model;

import java.util.Date;

public class HistoriqueStock {
    private int     idHistorique;
    private int     idProduit;
    private String  typeMouvement;   // entree | sortie | ajustement
    private int     quantite;
    private int     quantiteAvant;
    private int     quantiteApres;
    private Date    dateMouvement;
    private Integer idAdmin;
    private Integer idCommande;

    // jointure
    private String nomProduit;

    public HistoriqueStock() {}

    public int     getIdHistorique()   { return idHistorique; }
    public int     getIdProduit()      { return idProduit; }
    public String  getTypeMouvement()  { return typeMouvement; }
    public int     getQuantite()       { return quantite; }
    public int     getQuantiteAvant()  { return quantiteAvant; }
    public int     getQuantiteApres()  { return quantiteApres; }
    public Date    getDateMouvement()  { return dateMouvement; }
    public Integer getIdAdmin()        { return idAdmin; }
    public Integer getIdCommande()     { return idCommande; }
    public String  getNomProduit()     { return nomProduit; }

    public void setIdHistorique(int v)    { this.idHistorique = v; }
    public void setIdProduit(int v)       { this.idProduit = v; }
    public void setTypeMouvement(String v){ this.typeMouvement = v; }
    public void setQuantite(int v)        { this.quantite = v; }
    public void setQuantiteAvant(int v)   { this.quantiteAvant = v; }
    public void setQuantiteApres(int v)   { this.quantiteApres = v; }
    public void setDateMouvement(Date v)  { this.dateMouvement = v; }
    public void setIdAdmin(Integer v)     { this.idAdmin = v; }
    public void setIdCommande(Integer v)  { this.idCommande = v; }
    public void setNomProduit(String v)   { this.nomProduit = v; }
}
