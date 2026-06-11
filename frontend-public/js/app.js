// Configuración de la API con los datos exactos de tu Spring Boot
const API_URL = "http://localhost:8080/api/v1/muebles";

document.addEventListener("DOMContentLoaded", () => {
    cargarMuebles();
});

function cargarMuebles() {
    const contenedor = document.getElementById("contenedor-muebles");

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al conectar con el servidor");
            }
            return response.json();
        })
        .then(muebles => {
            contenedor.innerHTML = ""; // Limpiar el mensaje de "Cargando..."

            // Si la base de datos está vacía (como ahora)
            if (muebles.length === 0) {
                contenedor.innerHTML = `
                    <div class="sin-datos">
                        <p>🪑 El catálogo está vacío de momento. ¡Añade muebles en la base de datos!</p>
                    </div>`;
                return;
            }

            // Si hay muebles, los recorremos y creamos sus tarjetas
            // Busca esta sección dentro de tu js/app.js y reemplaza el trozo del foreach:
            muebles.forEach(mueble => {
                const tarjeta = document.createElement("div");
                tarjeta.classList.add("tarjeta-mueble");

                tarjeta.innerHTML = `
        <span class="categoria-badge" style="background: #e74c3c; color: white; padding: 0.2rem 0.5rem; font-size: 0.8rem; border-radius: 4px;">${mueble.tipo}</span>
        <h3 style="margin-top: 0.5rem;">${mueble.titulo}</h3>
        <p>${mueble.descripcion}</p>
        <small style="color: #7f8c8d;">Imagen: ${mueble.foto_principal}</small>
    `;

                contenedor.appendChild(tarjeta);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            contenedor.innerHTML = `
                <div class="sin-datos" style="color: #c0392b;">
                    <p>❌ No se pudo conectar con la API. Asegúrate de que el backend está corriendo.</p>
                </div>`;
        });
}