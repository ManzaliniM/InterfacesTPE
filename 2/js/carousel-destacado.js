/* =========================================================
   CARRUSEL DESTACADO (coverflow)
   - 5 slots fijos: posiciones -2 a 2
   - La card central es la protagonista
   - Autoplay, dots, teclado, pop
   - NO carga datos: los recibe desde home.js
   ========================================================= */

const FEATURED_COUNT = 5;
const AUTOPLAY_MS = 5000;
const VISIBLE_POSITIONS = [-2, -1, 0, 1, 2];


/* ---------- Creación de un slot ---------- */

function createSlot(pos) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.pos = pos;
    slot.setAttribute("role", "group");
    slot.setAttribute("aria-roledescription", "diapositiva");
    slot.innerHTML = `
        <a class="card" href="#">
            <span class="card__media">
                <img alt="" loading="eager" decoding="async">
            </span>
            <h3 class="card__title"></h3>
        </a>`;
    return slot;
}


/* ---------- Inicialización ----------
   root: el div #featured-carousel
   games: array de juegos ya normalizados
------------------------------------ */

function initCarouselDestacado(root, games) {
    if (!root || !games || !games.length) return;

    const stage = root.querySelector("#carousel-stage");
    const dotsEl = root.querySelector("#carousel-dots");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const total = games.length;

    let active = 0;
    let autoplayId = null;

    const slots = VISIBLE_POSITIONS.map((pos) => {
        const slot = createSlot(pos);
        stage.appendChild(slot);
        return slot;
    });

    const dots = games.map((game, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("aria-label", `Ir a ${game.titulo}`);
        dot.addEventListener("click", () => goTo(i));
        dotsEl.appendChild(dot);
        return dot;
    });

    const wrap = (i) => ((i % total) + total) % total;

    /* ---------- Render ---------- */

    function render() {
        slots.forEach((slot) => {
            const pos = Number(slot.dataset.pos);
            const index = wrap(active + pos);
            const game = games[index];

            const link = slot.querySelector(".card");
            const img = slot.querySelector("img");
            const title = slot.querySelector(".card__title");

            link.href = `game.html?id=${encodeURIComponent(game.id)}`;
            link.dataset.index = index;
            link.tabIndex = Math.abs(pos) <= 1 ? 0 : -1;

            if (img.getAttribute("src") !== game.imagenPortada) {
                img.src = game.imagenPortada;
            }
            img.alt = game.titulo;
            title.textContent = game.titulo;

            slot.setAttribute("aria-label", `${index + 1} de ${total}: ${game.titulo}`);
            slot.setAttribute("aria-hidden", Math.abs(pos) > 1 ? "true" : "false");
        });

        dots.forEach((dot, i) =>
            dot.setAttribute("aria-current", i === active ? "true" : "false")
        );
    }

    /* ---------- Pop de la card central ---------- */

    function animarPop() {
        if (reduceMotion.matches) return;

        const centerSlot = slots.find(s => Number(s.dataset.pos) === 0);
        if (!centerSlot) return;

        const media = centerSlot.querySelector(".card__media");
        if (!media) return;

        media.classList.remove("is-popping");
        void media.offsetWidth;
        media.classList.add("is-popping");

        media.addEventListener("animationend", () => {
            media.classList.remove("is-popping");
        }, { once: true });
    }

    /* ---------- Movimiento ---------- */

    function move(step) {
        if (step === 0) return;
        active = wrap(active + step);
        render();
        animarPop();
    }

    function goTo(index) {
        const forward = wrap(index - active);
        const step = forward <= total / 2 ? forward : forward - total;
        move(step);
        restartAutoplay();
    }

    /* ---------- Controles ---------- */

    root.querySelector('[data-action="prev"]').addEventListener("click", () => {
        move(-1);
        restartAutoplay();
    });
    root.querySelector('[data-action="next"]').addEventListener("click", () => {
        move(1);
        restartAutoplay();
    });

    stage.addEventListener("click", (e) => {
        const slot = e.target.closest(".slot");
        if (!slot) return;
        const pos = Number(slot.dataset.pos);
        if (pos !== 0) {
            e.preventDefault();
            move(pos);
            restartAutoplay();
        }
    });

    root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { move(-1); restartAutoplay(); }
        if (e.key === "ArrowRight") { move(1); restartAutoplay(); }
    });

    /* ---------- Autoplay ---------- */

    function startAutoplay() {
        if (reduceMotion.matches || autoplayId) return;
        stage.setAttribute("aria-live", "off");
        autoplayId = setInterval(() => move(1), AUTOPLAY_MS);
    }
    function stopAutoplay() {
        clearInterval(autoplayId);
        autoplayId = null;
        stage.setAttribute("aria-live", "polite");
    }
    function restartAutoplay() {
        stopAutoplay();
        if (!root.matches(":hover, :focus-within")) startAutoplay();
    }

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", (e) => {
        if (!root.contains(e.relatedTarget)) startAutoplay();
    });
    document.addEventListener("visibilitychange", () => {
        document.hidden ? stopAutoplay() : startAutoplay();
    });

    /* ---------- Arranque ---------- */

    render();
    root.dataset.loading = "false";
    startAutoplay();
    animarPop();
}