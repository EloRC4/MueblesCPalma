// ============================================================
// Environment configuration for the public frontend.
//
// In development the site is served by a static server on port
// 3000 while the API runs separately on 8080. In production,
// nginx serves the site and proxies /api/v1 to the backend, so
// a same-origin relative path is all we need.
// ============================================================

const API_BASE_URL = window.location.port === "3000"
    ? "http://localhost:8080/api/v1"
    : "/api/v1";
