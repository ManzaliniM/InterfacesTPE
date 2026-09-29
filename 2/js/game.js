// game.js — lógica específica de game.html
// Depende de que main.js ya haya inyectado nav.html / footer.html

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("id");

    try {
        const response = await fetch("data/games.json");
        const games = await response.json();

        const juego = games.find(g => g.id === gameId) ?? games[0];
        if (!juego) return;

        renderJuego(juego);
        renderCarrusel(games, juego.id);
    } catch (error) {
        console.error("No se pudieron cargar los datos del juego:", error);
    }
});

function renderJuego(juego) {
    document.title = `Moon Arcade — ${juego.titulo}`;

    setText("[data-bind='titulo']", juego.titulo);
    setText("[data-bind='titulo-breadcrumb']", juego.titulo);
    setText("[data-bind='categoria-link']", juego.categoria);

    setParagraphs("[data-bind='descripcion']", juego.descripcion);
    setParagraphs("[data-bind='como-jugar']", juego.comoJugar);
    setText("[data-bind='controles-texto']", juego.controlesTexto);

    const portada = document.querySelector("[data-bind='imagen-principal']");
    if (portada) {
        portada.src = juego.imagenPortada;
        portada.alt = `Captura de ${juego.titulo}`;
    }

    renderGaleriaControles(juego.galeria);
    renderTutorial(juego);
}

function renderGaleriaControles(galeria) {
    const galeriaEl = document.querySelector("[data-bind='galeria-controles']");
    if (!galeriaEl || !Array.isArray(galeria)) return;

    galeriaEl.innerHTML = galeria
        .map(
            (item) => `
      <figure>
        <img src="${item.src}" alt="${item.alt ?? ""}">
        <figcaption>${item.caption ?? ""}</figcaption>
      </figure>`
        )
        .join("");
}

function renderTutorial(juego) {
    const subtitulo = document.querySelector("[data-bind='tutorial-subtitulo']");
    const contenedor = document.querySelector("[data-bind='tutorial']");
    if (!juego.tutorialUrl) return;

    if (subtitulo) {
        subtitulo.innerHTML = `${juego.titulo} en acción! <a href="${juego.tutorialUrl}" target="_blank" rel="noopener">Tutorial</a>`;
    }

    if (contenedor) {
        contenedor.innerHTML = `
      <a class="tutorial-video" href="${juego.tutorialUrl}" target="_blank" rel="noopener"
        aria-label="Ver tutorial de ${juego.titulo} en YouTube (se abre en una pestaña nueva)">
        <img src="${juego.imagenPortada}" alt="">
        <span class="play-button" aria-hidden="true"></span>
      </a>`;
    }
}

function renderCarrusel(games, currentId) {
    const contenedor = document.querySelector("#carrusel-vertical");
    if (!contenedor) return;

    // "sin categoria fija": mezcla de otros juegos, excluyendo el actual
    const otros = games.filter((g) => g.id !== currentId);

    contenedor.innerHTML = otros
        .map(
            (g) => `
      <a class="carrusel-item" href="game.html?id=${g.id}">
        <img src="${g.imagenPortada}" alt="" loading="lazy">
        <span>${g.titulo}</span>
      </a>`
        )
        .join("");
}

function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.textContent = value;
}

function setParagraphs(selector, paragraphs) {
    const el = document.querySelector(selector);
    if (!el || !Array.isArray(paragraphs)) return;
    el.innerHTML = paragraphs.map((p) => `<p>${p}</p>`).join("");
}