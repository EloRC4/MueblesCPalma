package com.mueblescpalma.api.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "muebles")
public class Mueble {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(name = "foto_principal", nullable = false, length = 255)
    private String fotoPrincipal;

    // Retail price in euros. Nullable: the public site renders it as "price on request"
    @Column(precision = 10, scale = 2)
    private BigDecimal precio;

    @OneToMany(mappedBy = "mueble", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference 
    private List<FotoAdicional> fotosAdicionales = new ArrayList<>();

    // No-args constructor required by JPA
    public Mueble() {}

    // Full constructor
    public Mueble(Long id, String titulo, String descripcion, String tipo, String fotoPrincipal, BigDecimal precio, List<FotoAdicional> fotosAdicionales) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.fotoPrincipal = fotoPrincipal;
        this.precio = precio;
        this.fotosAdicionales = fotosAdicionales;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getFotoPrincipal() { return fotoPrincipal; }
    public void setFotoPrincipal(String fotoPrincipal) { this.fotoPrincipal = fotoPrincipal; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public List<FotoAdicional> getFotosAdicionales() { return fotosAdicionales; }
    public void setFotosAdicionales(List<FotoAdicional> fotosAdicionales) { this.fotosAdicionales = fotosAdicionales; }
}