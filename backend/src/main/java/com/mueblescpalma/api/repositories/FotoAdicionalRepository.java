package com.mueblescpalma.api.repositories;

import com.mueblescpalma.api.models.FotoAdicional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoAdicionalRepository extends JpaRepository<FotoAdicional, Long> {
    // Al heredar de JpaRepository, ya tiene los métodos heredados listos para usarse
}