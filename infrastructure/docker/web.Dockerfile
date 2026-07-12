# =============================================================================
# Production web image - Muebles C Palma
# Builds the admin panel with Vite and assembles an nginx image serving
# the public site, the panel under /admin/ and the reverse proxy to the API.
#
# Build context: the repository root
#   docker build -f infrastructure/docker/web.Dockerfile .
# =============================================================================

# --- Stage 1: admin panel build ---
FROM node:20-alpine AS admin-build
WORKDIR /app

COPY frontend-admin/package*.json ./
RUN npm ci

COPY frontend-admin/ .
# The panel is published under /admin/, so the bundle assets must be
# generated with that base path
RUN npm run build -- --base=/admin/

# --- Stage 2: nginx ---
FROM nginx:1.27-alpine

COPY infrastructure/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend-public/ /usr/share/nginx/html/
COPY --from=admin-build /app/dist/ /usr/share/nginx/html/admin/

EXPOSE 80
