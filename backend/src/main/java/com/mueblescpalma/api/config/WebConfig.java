package com.mueblescpalma.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configuramos la carpeta de imágenes
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:/home/elo/Documentos/Muebles C Palma/frontend-public/assets/")
                .setCachePeriod(3600)
                .resourceChain(true);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS global para tu API
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}