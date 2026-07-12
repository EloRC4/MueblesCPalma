package com.mueblescpalma.api.repositories;

import com.mueblescpalma.api.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Spring Data genera la consulta automáticamente a partir del nombre del método
    Optional<Usuario> findByUsername(String username);
}
