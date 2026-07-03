
package com.mueblescpalma.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity // Activa la seguridad web personalizada
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable) // Desactiva CSRF
                // NUEVO: Aseguramos que la sesión no se guarde en cookies (Stateful ->
                // Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/muebles/**").permitAll()
                        .requestMatchers("/api/v1/uploads/**").permitAll()
                        .requestMatchers("/api/v1/categorias/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }

    /**
     * Configuración del CORS (Cross-Origin Resource Sharing)
     * Define quién tiene permiso para llamar a este backend desde un navegador.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Permitimos el origen del frontend local (por ejemplo, React, Vue o Next.js)
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));

        // Permitimos los métodos HTTP estándares
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Permitimos cualquier cabecera (Headers) como Authorization, Content-Type,
        // etc.
        configuration.setAllowedHeaders(List.of("*"));

        // Permitir el envío de credenciales si fuera necesario
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicamos esta traducción de seguridad a todos los endpoints de la API
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
