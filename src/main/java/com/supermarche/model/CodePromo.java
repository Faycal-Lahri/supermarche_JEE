package com.supermarche.model;

import java.util.Date;

public class CodePromo {
    private int     idCodePromo;
    private String  code;
    private String  description;
    private String  typeRemise;   // 'pourcentage' | 'montant'
    private double  valeur;
    private double  montantMin;
    private Integer usageMax;
    private int     usageCount;
    private Date    dateDebut;
    private Date    dateFin;
    private boolean actif;
    private Integer idAdminCreateur;
    private Date    dateCreation;

    public CodePromo() {}

    public int     getIdCodePromo()     { return idCodePromo; }
    public String  getCode()            { return code; }
    public String  getDescription()     { return description; }
    public String  getTypeRemise()      { return typeRemise; }
    public double  getValeur()          { return valeur; }
    public double  getMontantMin()      { return montantMin; }
    public Integer getUsageMax()        { return usageMax; }
    public int     getUsageCount()      { return usageCount; }
    public Date    getDateDebut()       { return dateDebut; }
    public Date    getDateFin()         { return dateFin; }
    public boolean isActif()            { return actif; }
    public Integer getIdAdminCreateur() { return idAdminCreateur; }
    public Date    getDateCreation()    { return dateCreation; }

    public void setIdCodePromo(int v)          { this.idCodePromo = v; }
    public void setCode(String v)              { this.code = v; }
    public void setDescription(String v)       { this.description = v; }
    public void setTypeRemise(String v)        { this.typeRemise = v; }
    public void setValeur(double v)            { this.valeur = v; }
    public void setMontantMin(double v)        { this.montantMin = v; }
    public void setUsageMax(Integer v)         { this.usageMax = v; }
    public void setUsageCount(int v)           { this.usageCount = v; }
    public void setDateDebut(Date v)           { this.dateDebut = v; }
    public void setDateFin(Date v)             { this.dateFin = v; }
    public void setActif(boolean v)            { this.actif = v; }
    public void setIdAdminCreateur(Integer v)  { this.idAdminCreateur = v; }
    public void setDateCreation(Date v)        { this.dateCreation = v; }
}
