// ============================================================
// Public catalog — Muebles C Palma
// Loads the furniture from the API and handles filtering,
// search and sorting on the client.
// ============================================================

const API_URL = `${API_BASE_URL}/muebles`;
const RETRASO_BUSQUEDA_MS = 250;

const FORMATO_PRECIO = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
});

// Application state: the full catalog is fetched once and every
// filter operates in memory on this copy.
const estado = {
    muebles: [],
    filtros: {
        busqueda: "",
        tipo: "",
        orden: "defecto",
    },
};

document.addEventListener("DOMContentLoaded", () => {
    inicializarFiltros();
    cargarMuebles();
});

// ------------------------------------------------------------
// Data loading
// ------------------------------------------------------------

async function cargarMuebles() {
    const contenedor = document.getElementById("contenedor-muebles");

    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
            throw new Error(`Error del servidor (${respuesta.status})`);
        }

        estado.muebles = await respuesta.json();

        poblarSelectorDeTipos(estado.muebles);
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
        contenedor.innerHTML = `
            <div class="sin-datos error">
                <p>❌ No se pudieron cargar los datos. Inténtelo de nuevo más tarde.</p>
            </div>`;
    }
}

// ------------------------------------------------------------
// Filters
// ------------------------------------------------------------

function inicializarFiltros() {
    const btnToggle = document.getElementById("btn-toggle-filtros");
    const panel = document.getElementById("panel-filtros");
    const inputBusqueda = document.getElementById("filtro-busqueda");
    const selectTipo = document.getElementById("filtro-tipo");
    const selectOrden = document.getElementById("filtro-orden");
    const btnLimpiar = document.getElementById("btn-limpiar-filtros");

    btnToggle.addEventListener("click", () => {
        const abierto = btnToggle.getAttribute("aria-expanded") === "true";
        btnToggle.setAttribute("aria-expanded", String(!abierto));
        panel.hidden = abierto;
    });

    // Search input is debounced so the grid is not re-rendered
    // on every single keystroke.
    inputBusqueda.addEventListener(
        "input",
        debounce(() => {
            estado.filtros.busqueda = inputBusqueda.value;
            aplicarFiltros();
        }, RETRASO_BUSQUEDA_MS)
    );

    selectTipo.addEventListener("change", () => {
        estado.filtros.tipo = selectTipo.value;
        aplicarFiltros();
    });

    selectOrden.addEventListener("change", () => {
        estado.filtros.orden = selectOrden.value;
        aplicarFiltros();
    });

    btnLimpiar.addEventListener("click", () => {
        estado.filtros.busqueda = "";
        estado.filtros.tipo = "";
        estado.filtros.orden = "defecto";
        inputBusqueda.value = "";
        selectTipo.value = "";
        selectOrden.value = "defecto";
        aplicarFiltros();
    });
}

// Fills the category dropdown with the unique values that actually
// exist in the catalog, sorted alphabetically.
function poblarSelectorDeTipos(muebles) {
    const selectTipo = document.getElementById("filtro-tipo");
    const tipos = [...new Set(muebles.map(mueble => mueble.tipo))]
        .sort((a, b) => a.localeCompare(b, "es"));

    for (const tipo of tipos) {
        const opcion = document.createElement("option");
        opcion.value = tipo;
        opcion.textContent = tipo;
        selectTipo.appendChild(opcion);
    }
}

function aplicarFiltros() {
    const resultado = obtenerMueblesFiltrados();
    renderizarMuebles(resultado);
    actualizarContador(resultado.length, estado.muebles.length);
}

function obtenerMueblesFiltrados() {
    const { busqueda, tipo, orden } = estado.filtros;
    const texto = normalizarTexto(busqueda);

    const filtrados = estado.muebles.filter(mueble => {
        const coincideTexto =
            texto === "" ||
            normalizarTexto(mueble.titulo).includes(texto) ||
            normalizarTexto(mueble.descripcion ?? "").includes(texto);

        const coincideTipo = tipo === "" || mueble.tipo === tipo;

        return coincideTexto && coincideTipo;
    });

    if (orden === "titulo-asc") {
        filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
    } else if (orden === "titulo-desc") {
        filtrados.sort((a, b) => b.titulo.localeCompare(a.titulo, "es"));
    } else if (orden === "precio-asc" || orden === "precio-desc") {
        const direccion = orden === "precio-asc" ? 1 : -1;
        // Items without a price always sink to the end of the list
        filtrados.sort((a, b) => {
            if (a.precio == null && b.precio == null) return 0;
            if (a.precio == null) return 1;
            if (b.precio == null) return -1;
            return (a.precio - b.precio) * direccion;
        });
    }

    return filtrados;
}

// ------------------------------------------------------------
// Rendering
// ------------------------------------------------------------

function renderizarMuebles(muebles) {
    const contenedor = document.getElementById("contenedor-muebles");
    contenedor.innerHTML = "";

    if (estado.muebles.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-datos">
                <p>🪑 El catálogo está vacío de momento. ¡Añade muebles en la base de datos!</p>
            </div>`;
        return;
    }

    if (muebles.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-datos">
                <p>🔍 No hay muebles que coincidan con tu búsqueda.</p>
                <button type="button" class="btn-limpiar" onclick="document.getElementById('btn-limpiar-filtros').click()">
                    Limpiar filtros
                </button>
            </div>`;
        return;
    }

    for (const mueble of muebles) {
        contenedor.appendChild(crearTarjeta(mueble));
    }
}

function crearTarjeta(mueble) {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta-mueble");

    const rutaImagen = mueble.fotoPrincipal
        ? (mueble.fotoPrincipal.startsWith("http") ? mueble.fotoPrincipal : `assets/${mueble.fotoPrincipal}`)
        : "assets/placeholder.jpg";

    tarjeta.innerHTML = `
        <div class="card-image-wrapper">
            <img src="${escaparHtml(rutaImagen)}" alt="${escaparHtml(mueble.titulo)}" class="card-image" loading="lazy">
            <span class="categoria-badge">${escaparHtml(mueble.tipo)}</span>
        </div>
        <div class="card-content">
            <h3>${escaparHtml(mueble.titulo)}</h3>
            <p>${escaparHtml(mueble.descripcion)}</p>
            <div class="card-footer">
                <span class="card-precio ${mueble.precio == null ? "card-precio--consultar" : ""}">${formatearPrecio(mueble.precio)}</span>
                <a href="item.html?id=${encodeURIComponent(mueble.id)}" class="btn-detalle">Ver detalles</a>
            </div>
        </div>
    `;

    return tarjeta;
}

function actualizarContador(visibles, total) {
    const contador = document.getElementById("contador-resultados");

    if (total === 0) {
        contador.textContent = "";
    } else if (visibles === total) {
        contador.textContent = `${total} mueble${total === 1 ? "" : "s"}`;
    } else {
        contador.textContent = `${visibles} de ${total} muebles`;
    }
}

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------

// Returns the price formatted in euros, or the fallback text
// when the item has no published price.
function formatearPrecio(precio) {
    return precio == null ? "Consultar precio" : FORMATO_PRECIO.format(precio);
}

// Lowercases the text and strips accents so that "sillón" and
// "sillon" produce the same search results.
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Prevents database content from being interpreted as HTML
// when injected into the cards.
function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = String(texto ?? "");
    return div.innerHTML;
}

function debounce(funcion, retrasoMs) {
    let temporizador;
    return (...argumentos) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcion(...argumentos), retrasoMs);
    };
}
