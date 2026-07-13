-- =============================================================================
-- Database Schema & Initialization Script - Muebles C Palma
-- Description: Production-ready relational layout with automated indexing.
-- Target Engine: MySQL 8.0+ / InnoDB
-- Collation: UTF-8 Unicode (Support for emojis, accents, and special symbols)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `muebles_cpalma_db` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `muebles_cpalma_db`;

-- The client running the init scripts must read them as UTF-8 so the
-- accented characters in the seed data are stored correctly
SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- 1. Table: usuarios
-- Description: Stores credentials for store managers.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` BIGINT AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL, -- Engineered to hold raw BCrypt cryptographic hashes
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: muebles
-- Description: Core inventory metadata tracking physical stock items.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `muebles` (
    `id` BIGINT AUTO_INCREMENT,
    `titulo` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,            -- Maps item taxonomy (e.g., 'sofa', 'mesa')
    `foto_principal` VARCHAR(255) NOT NULL, -- Cloud storage URL or relative path
    `precio` DECIMAL(10,2) NULL,            -- Retail price in EUR; NULL renders as "price on request"
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_muebles_tipo` (`tipo`),       -- Minimizes VPS CPU usage during catalog filtering
    INDEX `idx_muebles_titulo` (`titulo`)     -- Optimizes textual match performance
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: fotos_adicionales
-- Description: Dynamic product gallery mapping. Establishes a 1:N relationship.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotos_adicionales` (
    `id` BIGINT AUTO_INCREMENT,
    `mueble_id` BIGINT NOT NULL,
    `foto_url` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_fotos_mueble_parent`
        FOREIGN KEY (`mueble_id`)
        REFERENCES `muebles` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE -- Enforces strict data consistency on deletions
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: categorias
-- Description: Product categories managed from the private panel.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias` (
    `id` BIGINT AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA SECTION (Development Environment Mocking)
-- =============================================================================

-- Insert Default Admin User
-- Security Note: Password hash corresponds to raw text 'admin2026' via BCrypt
INSERT INTO `usuarios` (`username`, `password`, `email`)
VALUES
('admin', '$2a$10$yt1o6JHV1I/QpGhPzikBTe21MQhuTmJr3F2AhH6CPW75K5iGihrk6', 'gestion@mueblescpalma.com')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Insert Sample Furniture Items
INSERT INTO `muebles` (`id`, `titulo`, `descripcion`, `tipo`, `foto_principal`, `precio`)
VALUES
(1, 'Sofá Escandinavo Nordik', 'Sofá de tres plazas tapizado en lino transpirable con estructura de madera de haya maciza. Ideal para salones minimalistas.', 'sofa', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 899.00),
(2, 'Mesa de Comedor Industrial Roble', 'Mesa robusta con tablero de roble salvaje macizo de 4cm de grosor y patas geométricas de acero lacado en negro mate.', 'mesa', 'https://images.unsplash.com/photo-1577140917170-285929fb55b7', 649.00)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Insert Product Gallery Collections (1:N Relations)
INSERT INTO `fotos_adicionales` (`mueble_id`, `foto_url`)
VALUES 
(1, 'https://images.unsplash.com/photo-1484101403633-562f891dc89a'), -- Sofá detail 1
(1, 'https://images.unsplash.com/photo-1540518614846-7eded433c457'), -- Sofá detail 2
(2, 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf'), -- Mesa detail 1
(2, 'https://images.unsplash.com/photo-1604014237800-1c9102c219da')  -- Mesa detail 2
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `categorias` (`nombre`)
VALUES ('sofa'), ('mesa'), ('silla'), ('dormitorio'), ('decoracion')
ON DUPLICATE KEY UPDATE `id`=`id`;
