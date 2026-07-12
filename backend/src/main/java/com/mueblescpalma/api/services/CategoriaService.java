package com.mueblescpalma.api.services;

import com.mueblescpalma.api.models.Categoria;
import com.mueblescpalma.api.repositories.CategoriaRepository;
import com.mueblescpalma.api.repositories.MuebleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final MuebleRepository muebleRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, MuebleRepository muebleRepository) {
        this.categoriaRepository = categoriaRepository;
        this.muebleRepository = muebleRepository;
    }

    @Transactional(readOnly = true)
    public List<Categoria> obtenerTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional
    public Categoria crear(String nombre) {
        String nombreNormalizado = nombre.toLowerCase().trim();
        return categoriaRepository.save(new Categoria(nombreNormalizado));
    }

    /**
     * Deletes a category only if no furniture item is using it.
     */
    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La categoría no existe."));

        int muebleCount = muebleRepository.findByTipo(categoria.getNombre()).size();
        if (muebleCount > 0) {
            throw new IllegalStateException(
                "No se puede eliminar '" + categoria.getNombre() + "': hay " + muebleCount + " mueble(s) usando esta categoría."
            );
        }
        categoriaRepository.deleteById(id);
    }
}
