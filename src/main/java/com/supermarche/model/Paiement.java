package com.supermarche.model;

import java.util.Date;

public class Paiement {
    private int    idPaiement;
    private Integer idCommande;
    private String  methodePaiement;  // carte | paypal | virement | a_la_livraison
    private String  statutPaiement;   // en_attente | paye | refuse | rembourse
    private Date    datePaiement;

    public Paiement() {}

    public int    getIdPaiement()       { return idPaiement; }
    public Integer getIdCommande()      { return idCommande; }
    public String  getMethodePaiement() { return methodePaiement; }
    public String  getStatutPaiement()  { return statutPaiement; }
    public Date    getDatePaiement()    { return datePaiement; }

    public void setIdPaiement(int v)        { this.idPaiement = v; }
    public void setIdCommande(Integer v)    { this.idCommande = v; }
    public void setMethodePaiement(String v){ this.methodePaiement = v; }
    public void setStatutPaiement(String v) { this.statutPaiement = v; }
    public void setDatePaiement(Date v)     { this.datePaiement = v; }
}
