
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
@EnableWebSecurity
public class SecurityConfig {

    // Browser origins allowed by CORS, configurable per environment
    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF is not needed: the API is stateless and uses no session cookies
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Browsers send an OPTIONS preflight before cross-origin requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public catalog: anyone can READ furniture and categories
                        .requestMatchers(HttpMethod.GET, "/api/v1/muebles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").permitAll()
                        // Spring's internal error page must stay reachable so a
                        // malformed JSON body yields a 400 instead of a misleading 403
                        .requestMatchers("/error").permitAll()
                        // Everything else (POST/PUT/DELETE, uploads, /auth/me)
                        // requires a valid user from the `usuarios` table
                        .anyRequest().authenticated())
                // HTTP Basic: the admin panel sends the credentials in the
                // Authorization header of every write request
                .httpBasic(basic -> basic.authenticationEntryPoint(entryPointSinPopup()));

        return http.build();
    }

    /**
     * Plain JSON 401 response without the WWW-Authenticate header.
     * Returning that header would make the browser pop its native
     * login dialog on top of the admin panel.
     */
    private AuthenticationEntryPoint entryPointSinPopup() {
        return (request, response, authException) -> {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"mensaje\": \"Necesitas iniciar sesión para realizar esta acción\"}");
        };
    }

    /**
     * Algorithm used to match passwords against the `usuarios` table.
     * Stored hashes were generated with BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS (Cross-Origin Resource Sharing) configuration.
     * Defines which browser origins may call this API.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allowed origins per environment (see app.cors.allowed-origins)
        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Any header is fine (Authorization, Content-Type, ...)
        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
