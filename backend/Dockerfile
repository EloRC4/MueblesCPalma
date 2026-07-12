# =============================================================================
# Production image for the API - Muebles C Palma
# Multi-stage build: compiles with Maven and runs on a slim JRE.
# =============================================================================

# --- Stage 1: build ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Fetch dependencies first to leverage Docker layer caching:
# this layer is only rebuilt when pom.xml changes
COPY pom.xml .
RUN mvn -q dependency:go-offline

COPY src ./src
RUN mvn -q package -DskipTests

# --- Stage 2: runtime image ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Unprivileged user: the application does not need root
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /var/www/assets \
    && chown -R spring:spring /var/www/assets
USER spring

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
