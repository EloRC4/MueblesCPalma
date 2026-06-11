package com.mueblescpalma.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "muebles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mueble {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT") // Mapea el tipo TEXT de MySQL
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(name = "foto_principal", nullable = false, length = 255)
    private String fotoPrincipal;

    // Relación Uno a Muchos (Un mueble tiene muchas fotos adicionales)
    // cascade = CascadeType.ALL -> Si borras un mueble, se borran automáticamente todas sus fotos adicionales de la BD
    // orphanRemoval = true -> Si quitas una foto de la lista de Java, Hibernate la borra de la BD automáticamente
    @OneToMany(mappedBy = "mueble", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FotoAdicional> fotosAdicionales = new ArrayList<>();
}