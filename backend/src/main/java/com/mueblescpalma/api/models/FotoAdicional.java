package com.mueblescpalma.api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fotos_adicionales")
@Data // Genera getters, setters, toString, equals y hashCode automáticamente gracias a Lombok
@NoArgsConstructor // Genera el constructor vacío obligatorio para JPA
@AllArgsConstructor // Genera un constructor con todos los campos
public class FotoAdicional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Mapea el AUTO_INCREMENT de MySQL
    private Long id;

    @Column(name = "foto_url", nullable = false, length = 255)
    private String fotoUrl;

    @ManyToOne(fetch = FetchType.LAZY) // Relación Muchos a Uno (Muchas fotos pertenecen a un mueble)
    @JoinColumn(name = "mueble_id", nullable = false) // Columna de la clave foránea en MySQL
    private Mueble mueble;
}