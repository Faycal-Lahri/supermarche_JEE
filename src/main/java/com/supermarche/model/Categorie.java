package com.supermarche.model;

public class Categorie {
    private int     idCategorie;
    private String  nomCategorie;
    private String  description;
    private Integer idCategorieParent;

    public Categorie() {}

    public int     getIdCategorie()       { return idCategorie; }
    public String  getNomCategorie()      { return nomCategorie; }
    public String  getDescription()       { return description; }
    public Integer getIdCategorieParent() { return idCategorieParent; }

    public void setIdCategorie(int v)            { this.idCategorie = v; }
    public void setNomCategorie(String v)        { this.nomCategorie = v; }
    public void setDescription(String v)         { this.description = v; }
    public void setIdCategorieParent(Integer v)  { this.idCategorieParent = v; }
}
