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
            contenedor.innerHTML = ""; // Limpiar el mensaje de carga

            // Si la base de datos está vacía
            if (muebles.length === 0) {
                contenedor.innerHTML = `
                    <div class="sin-datos">
                        <p>🪑 El catálogo está vacío de momento. ¡Añade muebles en la base de datos!</p>
                    </div>`;
                return;
            }

            // Mapeo y renderizado de tarjetas

            muebles.forEach(mueble => {
                const tarjeta = document.createElement("div");
                tarjeta.classList.add("tarjeta-mueble");

                const rutaImagen = mueble.fotoPrincipal
                    ? (mueble.fotoPrincipal.startsWith('http') ? mueble.fotoPrincipal : `assets/${mueble.fotoPrincipal}`)
                    : 'assets/placeholder.jpg';

                tarjeta.innerHTML = `
        <div class="card-image-wrapper">
            <img src="${rutaImagen}" alt="${mueble.titulo}" class="card-image" loading="lazy">
            <span class="categoria-badge">${mueble.tipo}</span>
        </div>
        <div class="card-content">
            <h3>${mueble.titulo}</h3>
            <p>${mueble.descripcion}</p>
            <a href="item.html?id=${mueble.id}" class="btn-detalle">Ver detalles</a>
        </div>
    `;

                contenedor.appendChild(tarjeta);
            });

        })
        .catch(error => {
            console.error("Error:", error);
            contenedor.innerHTML = `
                <div class="sin-datos error">
                    <p>❌ No se pudo conectar con la API. Asegúrate de que el backend está corriendo.</p>
                </div>`;
        });
}