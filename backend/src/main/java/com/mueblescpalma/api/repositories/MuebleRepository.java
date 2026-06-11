package com.mueblescpalma.api.repositories;

import com.mueblescpalma.api.models.Mueble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository // Le indica a Spring que este componente maneja el acceso a datos
public interface MuebleRepository extends JpaRepository<Mueble, Long> {

    /**
     * Busca muebles filtrados por su tipo (Categoría).
     * Spring Data JPA lee el nombre del método "findByTipo" y genera 
     * automáticamente la consulta: SELECT * FROM muebles WHERE tipo = ?
     * * @param tipo El tipo de mueble (ej. 'sofa', 'mesa')
     * @return Lista de muebles que coinciden con ese tipo
     */
    List<Mueble> findByTipo(String tipo);
}