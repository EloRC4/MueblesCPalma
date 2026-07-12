package com.mueblescpalma.api.repositories;

import com.mueblescpalma.api.models.Mueble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MuebleRepository extends JpaRepository<Mueble, Long> {

    /**
     * Finds furniture items by category. Spring Data JPA derives the query
     * from the method name: SELECT * FROM muebles WHERE tipo = ?
     *
     * @param tipo the furniture category (e.g. 'sofa', 'mesa')
     * @return items matching that category
     */
    List<Mueble> findByTipo(String tipo);
}