
package com.mueblescpalma.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity // Activa la seguridad web personalizada
public class SecurityConfig {

    // Orígenes autorizados para CORS, configurables por entorno
    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable) // Desactiva CSRF
                // Aseguramos que la sesión no se guarde en cookies (Stateful -> Stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // El navegador manda OPTIONS antes de cada petición cross-origin (preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Catálogo público: cualquiera puede LEER muebles y categorías
                        .requestMatchers(HttpMethod.GET, "/api/v1/muebles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").permitAll()
                        // La página interna de error de Spring debe ser accesible para
                        // que un JSON malformado devuelva 400 y no un 403 engañoso
                        .requestMatchers("/error").permitAll()
                        // Todo lo demás (POST/PUT/DELETE, subidas de imágenes, /auth/me)
                        // exige un usuario válido de la tabla `usuarios`
                        .anyRequest().authenticated())
                // Autenticación HTTP Basic: el panel de gestión manda las credenciales
                // en la cabecera Authorization de cada petición de escritura
                .httpBasic(basic -> basic.authenticationEntryPoint(entryPointSinPopup()));

        return http.build();
    }

    /**
     * Respuesta 401 en JSON sin la cabecera WWW-Authenticate.
     * Si se devolviera esa cabecera, el navegador mostraría su diálogo
     * de login nativo encima del panel de gestión.
     */
    private AuthenticationEntryPoint entryPointSinPopup() {
        return (request, response, authException) -> {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"mensaje\": \"Necesitas iniciar sesión para realizar esta acción\"}");
        };
    }

    /**
     * Algoritmo con el que se comparan las contraseñas de la tabla `usuarios`.
     * Los hashes almacenados se generaron con BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configuración del CORS (Cross-Origin Resource Sharing)
     * Define quién tiene permiso para llamar a este backend desde un navegador.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Orígenes permitidos según el entorno (ver app.cors.allowed-origins)
        configuration.setAllowedOrigins(allowedOrigins);

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
