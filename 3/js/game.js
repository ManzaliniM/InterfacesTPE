// game.js — lógica específica de game.html
// Usa la API compartida (js/api.js)

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("id");

    try {
        // Si no hay ID en la URL, mostramos Moon Solitaire por defecto
        const idFinal = gameId || 'moon-solitaire';

        const juego = await obtenerJuegoPorId(idFinal)
            ?? (await obtenerJuegosMoon())[0];

        if (!juego) return;

        renderJuego(juego);

        const todos = await obtenerJuegosMoon();
        renderCarrusel(todos, juego.id);
    } catch (error) {
        console.error("No se pudieron cargar los datos del juego:", error);
    }
});

function renderJuego(juego) {
    // raw tiene el objeto original (enriquecido con el JSON local)
    const raw = juego.raw || {};

    document.title = `Moon Arcade — ${juego.titulo}`;

    setText("[data-bind='titulo']", juego.titulo);
    setText("[data-bind='titulo-breadcrumb']", juego.titulo);
    setText("[data-bind='titulo-inline']", juego.titulo);
    setText("[data-bind='categoria-link']", raw.categoria ?? juego.categoria);

    setParagraphs("[data-bind='descripcion']", raw.descripcion ?? "");
    setParagraphs("[data-bind='como-jugar']", raw.comoJugar ?? "");
    setText("[data-bind='controles-texto']", raw.controlesTexto ?? "");

    const portada = document.querySelector("[data-bind='imagen-principal']");
    if (portada) {
        portada.src = juego.imagenPortada;
        portada.alt = `Captura de ${juego.titulo}`;
        portada.onerror = () => portada.remove();
    }

    // Si el juego es jugable en la página (ej: Blocka), reemplaza la portada por su canvas
    montarJuegoJugable(raw);

    renderGaleriaControles(raw.galeria);
    renderTutorial(juego, raw);

    toggleSection("controles", raw.controlesTexto || (raw.galeria && raw.galeria.length));
    toggleSection("tutorial", raw.tutorialUrl);
}

// Un juego del JSON es "jugable en la página" si define estos campos:
//   "script": "js/blocka.js"                          -> código del juego
//   "canvas": { "id": "blocka", "width": 1100, "height": 600 }
//   "css":    "css/blocka.css"                        -> (opcional) estilos propios
// Los juegos que no los tienen no se ven afectados.
function montarJuegoJugable(raw) {
    if (!raw.script || !raw.canvas) return;

    if (raw.css) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = raw.css;
        document.head.appendChild(link);
    }

    const canvas = document.createElement("canvas");
    canvas.id = raw.canvas.id;
    canvas.width = raw.canvas.width;
    canvas.height = raw.canvas.height;

    // marca el contenedor para poder darle estilos distintos a los juegos con canvas
    document.querySelector(".portada-wrapper")?.classList.add("con-canvas");

    const contenedor = document.createElement("div");
    contenedor.className = "contenedor-canvas";
    contenedor.appendChild(canvas);

    const portada = document.querySelector("[data-bind='imagen-principal']");
    if (portada) {
        portada.replaceWith(contenedor);
    } else {
        document.querySelector(".portada-wrapper")?.prepend(contenedor);
    }

    // El canvas tiene que existir ANTES de ejecutar el script del juego
    const script = document.createElement("script");
    script.src = raw.script;
    document.body.appendChild(script);
}

function toggleSection(nombre, tieneDatos) {
    const el = document.querySelector(`[data-section='${nombre}']`);
    if (el) el.hidden = !tieneDatos;
}

function renderGaleriaControles(galeria) {
    const galeriaEl = document.querySelector("[data-bind='galeria-controles']");
    if (!galeriaEl || !Array.isArray(galeria)) return;

    galeriaEl.innerHTML = galeria
        .map(item => `
            <figure>
                <img src="${item.src}" alt="${item.alt ?? ""}">
                <figcaption>${item.caption ?? ""}</figcaption>
            </figure>`)
        .join("");
}

function renderTutorial(juego, raw) {
    const subtitulo = document.querySelector("[data-bind='tutorial-subtitulo']");
    const contenedor = document.querySelector("[data-bind='tutorial']");
    if (!raw.tutorialUrl) return;

    if (subtitulo) {
        subtitulo.innerHTML = `${juego.titulo} en acción! <a href="${raw.tutorialUrl}" target="_blank" rel="noopener">Tutorial</a>`;
    }

    if (contenedor) {
        contenedor.innerHTML = `
            <a class="tutorial-video" href="${raw.tutorialUrl}" target="_blank" rel="noopener"
               aria-label="Ver tutorial de ${juego.titulo} en YouTube (se abre en una pestaña nueva)">
                <img src="${juego.imagenPortada}" alt="">
                <span class="play-button" aria-hidden="true"></span>
            </a>`;
    }
}

function renderCarrusel(games, currentId) {
    const contenedor = document.querySelector("#carrusel-vertical");
    if (!contenedor) return;

    // Excluimos el juego actual y limitamos a NUM
    const num = 7;
    const otros = games
        .filter(g => String(g.id) !== String(currentId))
        .slice(0, num);

    contenedor.innerHTML = otros
        .map(g => `
            <a class="carrusel-item" href="game.html?id=${encodeURIComponent(g.id)}">
                <img src="${g.imagenPortada}" alt="" loading="lazy"
                     onerror="this.parentElement.remove()">
                <span>${g.titulo}</span>
            </a>`)
        .join("");
}

/* ---------- Helpers ---------- */

function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
}

function setParagraphs(selector, paragraphs) {
    const el = document.querySelector(selector);
    if (!el || paragraphs == null) return;
    const lista = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    el.innerHTML = lista.filter(Boolean).map(p => `<p>${p}</p>`).join("");
}