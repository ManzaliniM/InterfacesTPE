/* =========================================================
   CARRUSEL FILA (film strip horizontal)
   - Todas las cards iguales
   - Scroll horizontal infinito
   - Flechas prev/next
   - NO carga datos: los recibe desde home.js
   ========================================================= */

const CARRUSEL_DISTANCIA = 455;   // px entre cards + gap


/* ---------- Helpers de animación ---------- */

function achicar(track) {
    track.classList.remove('moviendo');
    track.offsetWidth;
    track.classList.add('moviendo');
}

function saltar(track, x) {
    track.style.transition = 'none';
    track.style.transform = `translateX(${x}px)`;
    track.offsetHeight;
    track.style.transition = '';
}


/* ---------- Render de UN carrusel fila ----------
   elementoId: id del div contenedor (ej: 'carrusel-cocina')
   games: array completo de juegos
   categoria: string de la categoría a filtrar
------------------------------------ */

function renderCarruselFila(elementoId, games, categoria) {
    const contenedor = document.getElementById(elementoId);
    if (!contenedor) return;

    const juegos = games.filter(j => j.categoria === categoria.toLowerCase());

    if (!juegos.length) {
        contenedor.innerHTML = '<p style="padding:1rem">No hay juegos en esta categoría.</p>';
        return;
    }

    // Duplicamos 4 veces para que el scroll no se corte en el medio
    const repetidos = [...juegos, ...juegos, ...juegos, ...juegos];

    const cardsHTML = repetidos.map(juego => `
        <div class="card${juego.premium ? ' card-premium' : ''}">
            <div class="card-img-wrap">
                <img class="carrusel-peque${juego.premium ? ' premium-card' : ''}"
                     src="${juego.imagenPortada}"
                     alt="${juego.titulo}">
                ${juego.premium
            ? '<img class="tagPremium" src="assets/icons/premiumTag.svg" alt="Premium">'
            : ''}
            </div>
            <p title="${juego.titulo}">${juego.titulo}</p>
        </div>
    `).join('');

    contenedor.innerHTML = `<div class="carrusel-track">${cardsHTML}</div>`;
}


/* ---------- Conectar flechas prev/next de TODOS los wrappers ---------- */

function initControlesCarruselesFila() {
    const wrappers = document.querySelectorAll('.carrusel-wrapper');

    wrappers.forEach(wrapper => {
        const track = wrapper.querySelector('.carrusel-track');
        if (!track) return;

        const btnPrev = wrapper.querySelector('.btn-previous');
        const btnNext = wrapper.querySelector('.btn-next');
        let posicion = 1;

        saltar(track, -2700);

        function scrollAtras() {
            posicion--;
            if (posicion == -5) {
                saltar(track, -2700);
                posicion = 1;
                return;
            }
            achicar(track);
            track.style.transform = `translateX(-${(posicion - 1) * CARRUSEL_DISTANCIA + 2700}px)`;
        }

        function scrollAdelante() {
            if (posicion == 6) {
                saltar(track, -2700);
                posicion = 1;
                return;
            }
            posicion++;
            achicar(track);
            track.style.transform = `translateX(-${(posicion - 1) * CARRUSEL_DISTANCIA + 2700}px)`;
        }

        btnPrev?.addEventListener('click', scrollAtras);
        btnNext?.addEventListener('click', scrollAdelante);
    });
}