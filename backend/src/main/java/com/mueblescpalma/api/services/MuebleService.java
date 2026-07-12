package com.mueblescpalma.api.services;

import com.mueblescpalma.api.models.FotoAdicional;
import com.mueblescpalma.api.models.Mueble;
import com.mueblescpalma.api.repositories.MuebleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MuebleService {

    private final MuebleRepository muebleRepository;

    public MuebleService(MuebleRepository muebleRepository) {
        this.muebleRepository = muebleRepository;
    }

    /**
     * Returns the full furniture catalog.
     */
    @Transactional(readOnly = true)
    public List<Mueble> obtenerTodos() {
        return muebleRepository.findAll();
    }

    /**
     * Finds a single furniture item by id.
     */
    @Transactional(readOnly = true)
    public Optional<Mueble> obtenerPorId(Long id) {
        return muebleRepository.findById(id);
    }

    /**
     * Filters the catalog by category (sofa, mesa, ...).
     */
    @Transactional(readOnly = true)
    public List<Mueble> obtenerPorTipo(String tipo) {
        // Categories are stored lowercase, so the filter is case-insensitive
        String tipoNormalizado = tipo.toLowerCase().trim();
        return muebleRepository.findByTipo(tipoNormalizado);
    }

    /**
     * Creates a new furniture item or updates an existing one.
     */
    @Transactional
    public Mueble guardar(Mueble mueble) {
        // Keep both sides of the relationship consistent before cascading the save
        if (mueble.getFotosAdicionales() != null) {
            mueble.getFotosAdicionales().forEach(foto -> foto.setMueble(mueble));
        }
        return muebleRepository.save(mueble);
    }

    /**
     * Updates the main fields of an existing item.
     * The photo gallery is managed separately and is not touched here.
     */
    @Transactional
    public Optional<Mueble> actualizar(Long id, Mueble datosActualizados) {
        return muebleRepository.findById(id).map(muebleExistente -> {
            muebleExistente.setTitulo(datosActualizados.getTitulo());
            muebleExistente.setDescripcion(datosActualizados.getDescripcion());
            muebleExistente.setTipo(datosActualizados.getTipo());
            muebleExistente.setFotoPrincipal(datosActualizados.getFotoPrincipal());
            muebleExistente.setPrecio(datosActualizados.getPrecio());
            return muebleRepository.save(muebleExistente);
        });
    }

    /**
     * Appends a new photo to an existing item's gallery without touching the rest.
     */
    @Transactional
    public Optional<Mueble> agregarFotoAdicional(Long id, String fotoUrl) {
        return muebleRepository.findById(id).map(mueble -> {
            FotoAdicional nuevaFoto = new FotoAdicional();
            nuevaFoto.setFotoUrl(fotoUrl);
            nuevaFoto.setMueble(mueble);
            mueble.getFotosAdicionales().add(nuevaFoto);
            return muebleRepository.save(mueble);
        });
    }
    
    /**
     * Deletes a furniture item by id.
     */
    @Transactional
    public void eliminar(Long id) {
        // Check existence first so the controller can map this to a clean 404
        if (muebleRepository.existsById(id)) {
            muebleRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("No se puede eliminar: El mueble con ID " + id + " no existe.");
        }
    }
}