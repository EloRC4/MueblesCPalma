USE muebles_cpalma_db;
SET NAMES utf8mb4;

-- =============================================================================
-- Silla Nórdica Roble y Lino
-- =============================================================================
INSERT INTO muebles (titulo, descripcion, tipo, foto_principal, precio)
VALUES (
  'Silla Nórdica Roble y Lino',
  'Silla de comedor con patas de roble macizo y asiento tapizado en lino color crudo. Diseño escandinavo atemporal, combina con cualquier mesa de comedor.',
  'silla',
  'silla.jpg',
  129.00
);

-- =============================================================================
-- Mesa Auxiliar Roble Natural
-- =============================================================================
INSERT INTO muebles (titulo, descripcion, tipo, foto_principal, precio)
VALUES (
  'Mesa Auxiliar Roble Natural',
  'Mesa auxiliar compacta de roble natural, perfecta como apoyo junto al sofá. Acabado mate que resalta la veta de la madera.',
  'mesa',
  'mesa_main.jpg',
  89.00
);
SET @id_mesa = LAST_INSERT_ID();
INSERT INTO fotos_adicionales (mueble_id, foto_url) VALUES
  (@id_mesa, 'mesa_det1.jpg');

-- =============================================================================
-- Sofá Chaise Longue Confort
-- =============================================================================
INSERT INTO muebles (titulo, descripcion, tipo, foto_principal, precio)
VALUES (
  'Sofá Chaise Longue Confort',
  'Sofá de dos plazas con chaise longue, tapizado en tejido bouclé. Cojines extra acolchados para máximo confort.',
  'sofa',
  'sofa_main.jpg',
  1199.00
);
SET @id_sofa = LAST_INSERT_ID();
INSERT INTO fotos_adicionales (mueble_id, foto_url) VALUES
  (@id_sofa, 'sofa_det1.jpg');
