package com.supermarche.model;

import java.util.Date;
import java.util.List;

public class Promotion {
    private int     idPromotion;
    private String  nomPromotion;
    private String  description;
    private double  pourcentage;
    private Date    dateDebut;
    private Date    dateFin;
    private boolean actif;
    private Integer idAdminCreateur;
    private Date    dateCreation;
    private List<Integer> idsProduits; // for input
    private List<String>  nomsProduits; // for output display

    public Promotion() {}

    public int     getIdPromotion()      { return idPromotion; }
    public String  getNomPromotion()     { return nomPromotion; }
    public String  getDescription()      { return description; }
    public double  getPourcentage()      { return pourcentage; }
    public Date    getDateDebut()        { return dateDebut; }
    public Date    getDateFin()          { return dateFin; }
    public boolean isActif()             { return actif; }
    public Integer getIdAdminCreateur()  { return idAdminCreateur; }
    public Date    getDateCreation()     { return dateCreation; }
    public List<Integer> getIdsProduits()  { return idsProduits; }
    public List<String>  getNomsProduits() { return nomsProduits; }

    public void setIdPromotion(int v)          { this.idPromotion = v; }
    public void setNomPromotion(String v)      { this.nomPromotion = v; }
    public void setDescription(String v)       { this.description = v; }
    public void setPourcentage(double v)       { this.pourcentage = v; }
    public void setDateDebut(Date v)           { this.dateDebut = v; }
    public void setDateFin(Date v)             { this.dateFin = v; }
    public void setActif(boolean v)            { this.actif = v; }
    public void setIdAdminCreateur(Integer v)  { this.idAdminCreateur = v; }
    public void setDateCreation(Date v)        { this.dateCreation = v; }
    public void setIdsProduits(List<Integer> v) { this.idsProduits = v; }
    public void setNomsProduits(List<String> v) { this.nomsProduits = v; }
}
