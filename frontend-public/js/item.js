const API_URL = "http://localhost:8080/api/v1/muebles";

const FORMATO_PRECIO = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
});

// Devuelve el precio formateado en euros, o el texto alternativo
// cuando el mueble no tiene precio asignado.
function formatearPrecio(precio) {
    return precio == null ? "Consultar precio en tienda" : FORMATO_PRECIO.format(precio);
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idMueble = urlParams.get('id');
    const contenedor = document.getElementById("contenedor-item");

    if (!idMueble) {
        contenedor.innerHTML = "<p>❌ No se ha seleccionado ningún mueble válido.</p>";
        return;
    }

    fetch(`${API_URL}/${idMueble}`)
        .then(response => {
            if (!response.ok) throw new Error("El mueble no existe");
            return response.json();
        })
        .then(mueble => {
            // 🔄 Solución al Culpable 1: Comprobar si la foto principal es una URL externa
            const rutaImagen = mueble.fotoPrincipal.startsWith('http') 
                ? mueble.fotoPrincipal 
                : `assets/${mueble.fotoPrincipal}`;

            // 🔄 Solución al Culpable 2: Adaptar al mapeo real de tu base de datos (fotosAdicionales -> fotoUrl)
            let galeriaHtml = "";
            
            if (mueble.fotosAdicionales && mueble.fotosAdicionales.length > 0) {
                galeriaHtml = `<div class="item-galeria">`;
                
                mueble.fotosAdicionales.forEach(fotoObj => {
                    // Validar también si las fotos secundarias son URLs externas
                    const rutaSecundaria = fotoObj.fotoUrl.startsWith('http') 
                        ? fotoObj.fotoUrl 
                        : `assets/${fotoObj.fotoUrl}`;

                    galeriaHtml += `
                        <div class="galeria-thumb-wrapper">
                            <img src="${rutaSecundaria}" alt="Imagen adicional del mueble" class="galeria-thumb">
                        </div>`;
                });
                
                galeriaHtml += `</div>`;
            } else {
                galeriaHtml = `<p class="sin-fotos">No hay imágenes adicionales para este modelo.</p>`;
            }

            // Pintar los campos con los nombres exactos de tu entidad
            contenedor.innerHTML = `
                <div class="item-imagen-box">
                    <img src="${rutaImagen}" alt="${mueble.titulo}">
                </div>
                <div class="item-info-box">
                    <span class="item-categoria">${mueble.tipo}</span>
                    <h1>${mueble.titulo}</h1>
                    <p class="item-precio ${mueble.precio == null ? 'item-precio--consultar' : ''}">${formatearPrecio(mueble.precio)}</p>
                    <hr>
                    <p><strong>Descripción detallada:</strong></p>
                    <p>${mueble.descripcion}</p>
                    
                    <p><strong>Galería de imágenes:</strong></p>
                    ${galeriaHtml}
                    
                    <a href="catalogo.html" class="btn-volver">Volver al Catálogo</a>
                </div>
            `;
        })
        .catch(error => {
            console.error("Error:", error);
            contenedor.innerHTML = `<p>❌ Error al cargar los detalles del artículo.</p>`;
        });
});
