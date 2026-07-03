package com.mueblescpalma.api.controllers;

import com.mueblescpalma.api.models.Mueble;
import com.mueblescpalma.api.services.MuebleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController // Le dice a Spring que esta clase es una API REST que devuelve datos en formato JSON
@RequestMapping("/api/v1/muebles") // Define la URL base. Recuerda que añadimos el prefijo /api/v1 en el application.yml
public class MuebleController {

    private final MuebleService muebleService;
 
    // Inyectamos el servicio mediante el constructor
    public MuebleController(MuebleService muebleService) {
        this.muebleService = muebleService;
    }

    /**
     * Endpoint: GET /api/v1/muebles O /api/v1/muebles?tipo=sofa
     * Devuelve el catálogo completo o filtrado por categoría si se pasa el parámetro por la URL.
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
     * Busca un mueble específico por su ID. Si no existe, devuelve un error 404 Not Found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Mueble> obtenerPorId(@PathVariable Long id) {
        return muebleService.obtenerPorId(id)
                .map(ResponseEntity::ok) // Si el mueble existe, devuelve estatus 200 OK + el mueble
                .orElseGet(() -> ResponseEntity.notFound().build()); // Si es null, devuelve 404
    }

    /**
     * Endpoint: POST /api/v1/muebles
     * Recibe los datos de un nuevo mueble en formato JSON y los guarda en la base de datos.
     */
    @PostMapping
    public ResponseEntity<Mueble> crearMueble(@RequestBody Mueble mueble) {
        Mueble nuevoMueble = muebleService.guardar(mueble);
        // Devuelve un estatus 21 Created junto con el objeto guardado (que ahora incluye su ID autogenerado)
        return new ResponseEntity<>(nuevoMueble, HttpStatus.CREATED);
    }

    /**
     * Endpoint: DELETE /api/v1/muebles/{id}
     * Elimina un mueble por su ID. Devuelve un estatus 204 No Content si la operación fue exitosa.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMueble(@PathVariable Long id) {
        try {
            muebleService.eliminar(id);
            return ResponseEntity.noContent().build(); // Código HTTP 204: Éxito, pero no hay datos que devolver
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build(); // Código HTTP 404 si el ID no existía
        }
    }

    /**
     * Endpoint: PUT /api/v1/muebles/{id}
     * Actualiza los datos principales de un mueble existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Mueble> actualizarMueble(@PathVariable Long id, @RequestBody Mueble muebleActualizado) {
        return muebleService.actualizar(id, muebleActualizado)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint: POST /api/v1/muebles/{id}/fotos
     * Añade una nueva foto a la galería de un mueble existente.
     */
    @PostMapping("/{id}/fotos")
    public ResponseEntity<Mueble> agregarFotoAdicional(@PathVariable Long id, @RequestBody Map<String, String> fotoData) {
        String fotoUrl = fotoData.get("fotoUrl");
        return muebleService.agregarFotoAdicional(id, fotoUrl)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}