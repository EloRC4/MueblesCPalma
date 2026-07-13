package com.mueblescpalma.api.services;

import com.mueblescpalma.api.models.Usuario;
import com.mueblescpalma.api.repositories.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Changes the given user's password.
     * The current password is required so an open session (or anyone
     * in front of the machine) cannot change it without knowing it.
     */
    @Transactional
    public void cambiarPassword(String username, String claveActual, String claveNueva) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + username));

        if (claveActual == null || !passwordEncoder.matches(claveActual, usuario.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }

        if (claveNueva == null || claveNueva.trim().length() < 8) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 8 caracteres");
        }

        // Never store the plain-text password, only its BCrypt hash
        usuario.setPassword(passwordEncoder.encode(claveNueva));
        usuarioRepository.save(usuario);
    }
}
