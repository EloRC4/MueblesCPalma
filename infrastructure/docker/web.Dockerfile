# =============================================================================
# Imagen web de producción - Muebles C Palma
# Compila el panel de administración con Vite y monta un nginx que sirve
# la web pública, el panel bajo /admin/ y el proxy hacia la API.
#
# Contexto de build: la raíz del repositorio
#   docker build -f infrastructure/docker/web.Dockerfile .
# =============================================================================

# --- Etapa 1: build del panel de administración ---
FROM node:20-alpine AS admin-build
WORKDIR /app

COPY frontend-admin/package*.json ./
RUN npm ci

COPY frontend-admin/ .
# El panel se publica bajo /admin/, por lo que los assets del bundle
# deben generarse con esa ruta base
RUN npm run build -- --base=/admin/

# --- Etapa 2: nginx ---
FROM nginx:1.27-alpine

COPY infrastructure/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend-public/ /usr/share/nginx/html/
COPY --from=admin-build /app/dist/ /usr/share/nginx/html/admin/

EXPOSE 80
