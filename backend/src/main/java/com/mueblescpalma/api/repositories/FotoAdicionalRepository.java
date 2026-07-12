package com.mueblescpalma.api.repositories;

import com.mueblescpalma.api.models.FotoAdicional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoAdicionalRepository extends JpaRepository<FotoAdicional, Long> {
    // The CRUD operations inherited from JpaRepository are all this entity needs
}