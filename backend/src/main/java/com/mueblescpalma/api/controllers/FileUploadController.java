package com.mueblescpalma.api.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/uploads")
public class FileUploadController {

    @Value("${app.upload-dir}")
    private String uploadDir;

    /**
     * Receives an image file and stores it under a unique name
     * in the public frontend assets folder.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> subirImagen(@RequestParam("file") MultipartFile file) {
        try {
            String nombreOriginal = file.getOriginalFilename();
            String extension = "";
            if (nombreOriginal != null && nombreOriginal.contains(".")) {
                extension = nombreOriginal.substring(nombreOriginal.lastIndexOf('.'));
            }
            String nombreUnico = UUID.randomUUID() + extension;

            Path destino = Paths.get(uploadDir, nombreUnico);
            Files.createDirectories(destino.getParent());
            file.transferTo(destino);

            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("filename", nombreUnico);
            return ResponseEntity.ok(respuesta);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
