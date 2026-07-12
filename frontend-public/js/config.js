// ============================================================
// Configuración de entorno del frontend público.
//
// En desarrollo el sitio se sirve con un servidor estático en el
// puerto 3000 y la API corre aparte en el 8080. En producción,
// nginx sirve la web y hace de proxy de /api/v1 hacia el backend,
// por lo que basta con una ruta relativa al mismo origen.
// ============================================================

const API_BASE_URL = window.location.port === "3000"
    ? "http://localhost:8080/api/v1"
    : "/api/v1";
