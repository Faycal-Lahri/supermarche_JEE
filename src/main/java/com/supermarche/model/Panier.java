package com.supermarche.model;

import java.util.Date;
import java.util.List;

public class Panier {
    private int    idPanier;
    private Integer idClient;
    private String  sessionId;
    private Date    dateCreation;
    private String  statutPanier;   // actif | valide | abandonne | archive
    private Date    dateStatut;
    private double  montantTotal;

    // lignes du panier
    private List<PanierProduit> produits;

    public Panier() {}

    public int     getIdPanier()     { return idPanier; }
    public Integer getIdClient()     { return idClient; }
    public String  getSessionId()    { return sessionId; }
    public Date    getDateCreation() { return dateCreation; }
    public String  getStatutPanier() { return statutPanier; }
    public Date    getDateStatut()   { return dateStatut; }
    public double  getMontantTotal() { return montantTotal; }
    public List<PanierProduit> getProduits() { return produits; }

    public void setIdPanier(int v)        { this.idPanier = v; }
    public void setIdClient(Integer v)    { this.idClient = v; }
    public void setSessionId(String v)    { this.sessionId = v; }
    public void setDateCreation(Date v)   { this.dateCreation = v; }
    public void setStatutPanier(String v) { this.statutPanier = v; }
    public void setDateStatut(Date v)     { this.dateStatut = v; }
    public void setMontantTotal(double v) { this.montantTotal = v; }
    public void setProduits(List<PanierProduit> v) { this.produits = v; }
}
