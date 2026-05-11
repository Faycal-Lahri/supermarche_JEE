package com.supermarche.model;

import java.util.Date;
import java.util.List;

public class Commande {
    private int    idCommande;
    private String numeroCommande;
    private int    idClient;
    private Integer idPanier;
    private Date   dateCommande;
    private String statutCommande;  // en_attente | confirmee | en_preparation | livree | annulee
    private double montantTotal;
    private String adresseLivraison;
    private String villeLivraison;
    private String codePostalLivraison;
    private String raisonAnnulation;
    private String annulePar;
    private Date   dateAnnulation;
    private String modePaiement;
    private boolean estPaye;
    private String codePromoUtilise;  // code promo utilisé (si applicable)
    private double montantRemise;     // montant de la réduction appliquée

    // jointure client
    private String nomClient;
    private String prenomClient;
    private String emailClient;

    // lignes commande
    private List<LigneCommande> lignes;

    public Commande() {}

    // ── Getters ─────────────────────────────────────────────────────
    public int     getIdCommande()          { return idCommande; }
    public String  getNumeroCommande()      { return numeroCommande; }
    public int     getIdClient()            { return idClient; }
    public Integer getIdPanier()            { return idPanier; }
    public Date    getDateCommande()        { return dateCommande; }
    public String  getStatutCommande()      { return statutCommande; }
    public double  getMontantTotal()        { return montantTotal; }
    public String  getAdresseLivraison()    { return adresseLivraison; }
    public String  getVilleLivraison()      { return villeLivraison; }
    public String  getCodePostalLivraison() { return codePostalLivraison; }
    public String  getRaisonAnnulation()    { return raisonAnnulation; }
    public String  getAnnulePar()           { return annulePar; }
    public Date    getDateAnnulation()      { return dateAnnulation; }
    public String  getModePaiement()        { return modePaiement; }
    public boolean isEstPaye()              { return estPaye; }
    public String  getCodePromoUtilise()    { return codePromoUtilise; }
    public double  getMontantRemise()       { return montantRemise; }
    public String  getNomClient()           { return nomClient; }
    public String  getPrenomClient()        { return prenomClient; }
    public String  getEmailClient()         { return emailClient; }
    public List<LigneCommande> getLignes()  { return lignes; }

    // ── Setters ─────────────────────────────────────────────────────
    public void setIdCommande(int v)            { this.idCommande = v; }
    public void setNumeroCommande(String v)     { this.numeroCommande = v; }
    public void setIdClient(int v)              { this.idClient = v; }
    public void setIdPanier(Integer v)          { this.idPanier = v; }
    public void setDateCommande(Date v)         { this.dateCommande = v; }
    public void setStatutCommande(String v)     { this.statutCommande = v; }
    public void setMontantTotal(double v)       { this.montantTotal = v; }
    public void setAdresseLivraison(String v)   { this.adresseLivraison = v; }
    public void setVilleLivraison(String v)     { this.villeLivraison = v; }
    public void setCodePostalLivraison(String v){ this.codePostalLivraison = v; }
    public void setRaisonAnnulation(String v)   { this.raisonAnnulation = v; }
    public void setAnnulePar(String v)          { this.annulePar = v; }
    public void setDateAnnulation(Date v)       { this.dateAnnulation = v; }
    public void setModePaiement(String v)       { this.modePaiement = v; }
    public void setEstPaye(boolean v)           { this.estPaye = v; }
    public void setNomClient(String v)          { this.nomClient = v; }
    public void setPrenomClient(String v)       { this.prenomClient = v; }
    public void setEmailClient(String v)        { this.emailClient = v; }
    public void setLignes(List<LigneCommande> v){ this.lignes = v; }
    public void setCodePromoUtilise(String v)   { this.codePromoUtilise = v; }
    public void setMontantRemise(double v)      { this.montantRemise = v; }
}
