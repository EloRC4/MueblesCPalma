package com.mueblescpalma.api.controllers;

import com.mueblescpalma.api.models.Mueble;
import com.mueblescpalma.api.services.MuebleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/muebles")
public class MuebleController {

    private final MuebleService muebleService;

    public MuebleController(MuebleService muebleService) {
        this.muebleService = muebleService;
    }

    /**
     * Endpoint: GET /api/v1/muebles or /api/v1/muebles?tipo=sofa
     * Returns the full catalog, optionally filtered by category.
     */
    @GetMapping
    public ResponseEntity<List<Mueble>> listarMuebles(@RequestParam(required = false) String tipo) {
        if (tipo != null && !tipo.isBlank()) {
            return ResponseEntity.ok(muebleService.obtenerPorTipo(tipo));
        }
        return ResponseEntity.ok(muebleService.obtenerTodos());
    }

    /**
     * Endpoint: GET /api/v1/muebles/{id}
     * Returns a single item by id, or 404 Not Found if it does not exist.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Mueble> obtenerPorId(@PathVariable Long id) {
        return muebleService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint: POST /api/v1/muebles
     * Creates a new furniture item from the JSON payload.
     */
    @PostMapping
    public ResponseEntity<Mueble> crearMueble(@RequestBody Mueble mueble) {
        Mueble nuevoMueble = muebleService.guardar(mueble);
        // 201 Created plus the stored object, which now carries its generated id
        return new ResponseEntity<>(nuevoMueble, HttpStatus.CREATED);
    }

    /**
     * Endpoint: DELETE /api/v1/muebles/{id}
     * Deletes an item by id. Returns 204 No Content on success.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMueble(@PathVariable Long id) {
        try {
            muebleService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint: PUT /api/v1/muebles/{id}
     * Updates the main fields of an existing item.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Mueble> actualizarMueble(@PathVariable Long id, @RequestBody Mueble muebleActualizado) {
        return muebleService.actualizar(id, muebleActualizado)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint: POST /api/v1/muebles/{id}/fotos
     * Adds a new photo to the gallery of an existing item.
     */
    @PostMapping("/{id}/fotos")
    public ResponseEntity<Mueble> agregarFotoAdicional(@PathVariable Long id, @RequestBody Map<String, String> fotoData) {
        String fotoUrl = fotoData.get("fotoUrl");
        return muebleService.agregarFotoAdicional(id, fotoUrl)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}