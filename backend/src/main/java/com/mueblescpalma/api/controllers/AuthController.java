package com.mueblescpalma.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    /**
     * Endpoint: GET /api/v1/auth/me
     * Endpoint protegido que el panel de gestión usa para comprobar credenciales:
     * si las credenciales enviadas son válidas devuelve el usuario, si no, 401.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> usuarioActual(Authentication authentication) {
        return ResponseEntity.ok(Map.of("username", authentication.getName()));
    }
}
