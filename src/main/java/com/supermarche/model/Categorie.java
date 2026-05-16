package com.supermarche.model;

public class Categorie {
    private int     idCategorie;
    private String  nomCategorie;
    private String  description;
    private Integer idCategorieParent;
    private String  imageCategorie;

    public Categorie() {}

    public int     getIdCategorie()       { return idCategorie; }
    public String  getNomCategorie()      { return nomCategorie; }
    public String  getDescription()       { return description; }
    public Integer getIdCategorieParent() { return idCategorieParent; }
    public String  getImageCategorie()    { return imageCategorie; }

    public void setIdCategorie(int v)            { this.idCategorie = v; }
    public void setNomCategorie(String v)        { this.nomCategorie = v; }
    public void setDescription(String v)         { this.description = v; }
    public void setIdCategorieParent(Integer v)  { this.idCategorieParent = v; }
    public void setImageCategorie(String v)      { this.imageCategorie = v; }
}
