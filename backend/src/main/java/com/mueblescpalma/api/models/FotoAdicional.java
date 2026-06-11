package com.mueblescpalma.api.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "fotos_adicionales")
public class FotoAdicional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "foto_url", nullable = false, length = 255)
    private String fotoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mueble_id", nullable = false)
    @JsonIgnore // Evita bucles infinitos al serializar a JSON
    private Mueble mueble;

    // Constructor vacío
    public FotoAdicional() {}

    // Constructor completo
    public FotoAdicional(Long id, String fotoUrl, Mueble mueble) {
        this.id = id;
        this.fotoUrl = fotoUrl;
        this.mueble = mueble;
    }

    // Getters y Setters manuales
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public Mueble getMueble() { return mueble; }
    public void setMueble(Mueble mueble) { this.mueble = mueble; }
}