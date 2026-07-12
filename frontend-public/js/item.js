const API_URL = `${API_BASE_URL}/muebles`;

const FORMATO_PRECIO = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
});

// Returns the price formatted in euros, or the fallback text
// when the item has no published price.
function formatearPrecio(precio) {
    return precio == null ? "Consultar precio en tienda" : FORMATO_PRECIO.format(precio);
}

// Pre-fills the WhatsApp and e-mail links with a message that
// already mentions the item the visitor is looking at.
function personalizarEnlacesContacto(mueble) {
    const mensaje = `Hola, me interesa el mueble «${mueble.titulo}» que he visto en vuestra web.`;

    const whatsapp = document.getElementById("accion-whatsapp");
    if (whatsapp) {
        whatsapp.href = `https://wa.me/34646408588?text=${encodeURIComponent(mensaje)}`;
    }

    const correo = document.getElementById("accion-correo");
    if (correo) {
        const asunto = `Consulta sobre «${mueble.titulo}»`;
        correo.href = `mailto:mueblesc.palma@gmail.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
    }
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
            // The photo may be an absolute URL or a local file under assets/
            const rutaImagen = mueble.fotoPrincipal.startsWith('http')
                ? mueble.fotoPrincipal
                : `assets/${mueble.fotoPrincipal}`;

            let galeriaHtml = "";
            
            if (mueble.fotosAdicionales && mueble.fotosAdicionales.length > 0) {
                galeriaHtml = `<div class="item-galeria">`;
                
                mueble.fotosAdicionales.forEach(fotoObj => {
                    // Gallery photos may also be external URLs
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

            // Render the item details
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

            personalizarEnlacesContacto(mueble);
        })
        .catch(error => {
            console.error("Error:", error);
            contenedor.innerHTML = `<p>❌ Error al cargar los detalles del artículo.</p>`;
        });
});
