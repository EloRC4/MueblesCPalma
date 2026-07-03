package com.mueblescpalma.api.repositories;

import com.mueblescpalma.api.models.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
