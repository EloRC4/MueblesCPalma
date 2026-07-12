package com.mueblescpalma.api.controllers;

import com.mueblescpalma.api.services.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Endpoint: GET /api/v1/auth/me
     * Endpoint protegido que el panel de gestión usa para comprobar credenciales:
     * si las credenciales enviadas son válidas devuelve el usuario, si no, 401.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> usuarioActual(Authentication authentication) {
        return ResponseEntity.ok(Map.of("username", authentication.getName()));
    }

    /**
     * Endpoint: PUT /api/v1/auth/password
     * Cambia la contraseña del usuario autenticado. Recibe la contraseña
     * actual (para verificarla) y la nueva. Devuelve 400 si la actual no
     * es correcta o la nueva no cumple los requisitos.
     */
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> cambiarPassword(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        try {
            usuarioService.cambiarPassword(
                    authentication.getName(),
                    body.get("claveActual"),
                    body.get("claveNueva"));
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
