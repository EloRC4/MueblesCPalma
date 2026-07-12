# =============================================================================
# Imagen de producción de la API - Muebles C Palma
# Build multi-etapa: compila con Maven y ejecuta sobre un JRE ligero.
# =============================================================================

# --- Etapa 1: compilación ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Descargamos las dependencias primero para aprovechar la caché de Docker:
# mientras el pom.xml no cambie, esta capa no se repite
COPY pom.xml .
RUN mvn -q dependency:go-offline

COPY src ./src
RUN mvn -q package -DskipTests

# --- Etapa 2: imagen final ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuario sin privilegios: la aplicación no necesita root
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /var/www/assets \
    && chown -R spring:spring /var/www/assets
USER spring

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
