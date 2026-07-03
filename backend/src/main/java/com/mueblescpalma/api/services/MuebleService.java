package com.mueblescpalma.api.services;

import com.mueblescpalma.api.models.FotoAdicional;
import com.mueblescpalma.api.models.Mueble;
import com.mueblescpalma.api.repositories.MuebleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service // Le dice a Spring que esta clase contiene la lógica de negocio y debe gestionarla
public class MuebleService {

    // Inyección de dependencias por constructor 
    private final MuebleRepository muebleRepository;

    public MuebleService(MuebleRepository muebleRepository) {
        this.muebleRepository = muebleRepository;
    }

    /**
     * Recupera todos los muebles del catálogo.
     */
    @Transactional(readOnly = true) // Optimiza la consulta en MySQL indicando que solo es de lectura
    public List<Mueble> obtenerTodos() {
        return muebleRepository.findAll();
    }

    /**
     * Busca un mueble específico por su ID.
     */
    @Transactional(readOnly = true)
    public Optional<Mueble> obtenerPorId(Long id) {
        return muebleRepository.findById(id);
    }

    /**
     * Filtra los muebles según su categoría (sofá, mesa, etc.).
     */
    @Transactional(readOnly = true)
    public List<Mueble> obtenerPorTipo(String tipo) {
        // Regla de negocio: Convertimos a minúsculas para evitar problemas de mayúsculas/minúsculas
        String tipoNormalizado = tipo.toLowerCase().trim();
        return muebleRepository.findByTipo(tipoNormalizado);
    }

    /**
     * Guarda un nuevo mueble o actualiza uno existente.
     */
    @Transactional // Abre una transacción. Si algo falla, hace un Rollback automático en MySQL
    public Mueble guardar(Mueble mueble) {
        // Regla de negocio: Aseguramos que las fotos adicionales apunten correctamente a este mueble
        if (mueble.getFotosAdicionales() != null) {
            mueble.getFotosAdicionales().forEach(foto -> foto.setMueble(mueble));
        }
        return muebleRepository.save(mueble);
    }
    /**
     * Actualiza los campos principales de un mueble existente.
     * No modifica la galería de fotos adicionales en esta operación.
     */
    @Transactional
    public Optional<Mueble> actualizar(Long id, Mueble datosActualizados) {
        return muebleRepository.findById(id).map(muebleExistente -> {
            muebleExistente.setTitulo(datosActualizados.getTitulo());
            muebleExistente.setDescripcion(datosActualizados.getDescripcion());
            muebleExistente.setTipo(datosActualizados.getTipo());
            muebleExistente.setFotoPrincipal(datosActualizados.getFotoPrincipal());
            return muebleRepository.save(muebleExistente);
        });
    }

    /**
     * Añade una nueva foto a la galería de un mueble existente sin tocar las demás.
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
     * Elimina un mueble del catálogo por su ID.
     */
    @Transactional
    public void eliminar(Long id) {
        // Verificamos si existe antes de intentar borrar para evitar excepciones feas
        if (muebleRepository.existsById(id)) {
            muebleRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("No se puede eliminar: El mueble con ID " + id + " no existe.");
        }
    }
}