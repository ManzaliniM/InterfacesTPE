/**
 * Inicializador del Carrusel Circular Destacado
 * Conectado con el flujo de home.js y api.js de Moon Arcade
 * @param {HTMLElement} rootContainer - elemento contenedor (#featured-carousel)
 * @param {Array} juegosDestacados - lista de objetos de juegos filtrados por la API
 */

function initCarouselDestacado(rootContainer, juegosDestacados) {
    const track = rootContainer.querySelector('#carousel-track');
    const prevBtn = rootContainer.querySelector('#prev');
    const nextBtn = rootContainer.querySelector('#next');

    if (!track || !juegosDestacados || juegosDestacados.length === 0) return;

    // Renderizado de las cards del carrusel destacado
    track.innerHTML = '';

    juegosDestacados.forEach(juego => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        cardElement.innerHTML = `
            <img src="${juego.imagenPortada}" alt="Portada de ${juego.titulo}" draggable="false" />
            <div class="card-title">${juego.titulo}</div>
        `;
        cardElement.dataset.gameId = juego.id;

        track.appendChild(cardElement);
    });

    // física de la trigonométrica orbital
    const cards = track.querySelectorAll('.card');
    const totalCards = cards.length;
    const angleStep = (2 * Math.PI) / totalCards;
    let rotationAngle = 0;

    function arrangeCarousel() {
        // Separación fija entre la card frontal y su vecina.
        // si usamos 90 o menos quedan solapadas
        // 115 o mas separadas
        const NEIGHBOR_DISTANCE = 120;

        // Radio calculado para que la vecina quede siempre a esa distancia
        const radius = totalCards > 2
            ? NEIGHBOR_DISTANCE / Math.sin(angleStep)
            : NEIGHBOR_DISTANCE;

        // Umbral para considerar "frontal" a una card, según la cantidad de cards
        const frontThreshold = Math.cos(angleStep / 2);

        cards.forEach((card, index) => {
            const cardAngle = (angleStep * index) + rotationAngle;

            const x = Math.sin(cardAngle) * radius; // Posición horizontal en % del ancho de card
            const z = Math.cos(cardAngle);          // Coordenada Z virtual (-1 al fondo, 1 al frente)

            // Curva de escalado: la card del frente llega a 1.15x y las de los costados bajan gradualmente
            const scale = 0.60 + (z + 1) * 0.275;

            // Capas de superposición (z-index dinámico)
            const zIndex = Math.round(((z + 1) / 2) * 20);

            // Visibilidad e interactividad según la posición orbital
            if (z < -0.1) {
                card.style.opacity = "0";
                card.style.pointerEvents = "none";
                card.style.cursor = "default";
                card.dataset.isFront = "false";
            } else {
                // Solo la card frontal es clickeable
                if (z > frontThreshold) {
                    card.dataset.isFront = "true";
                    card.style.cursor = "pointer";
                } else {
                    card.dataset.isFront = "false";
                    card.style.cursor = "default";
                }
                card.style.opacity = "1";
                card.style.pointerEvents = "auto";
            }

            card.style.zIndex = zIndex;
            card.style.transform = `translate(-50%, -50%) translate(${x}%) scale(${scale})`;
        });
    }

    // Eventos de las flechas
    nextBtn.addEventListener('click', () => {
        rotationAngle -= angleStep; // Rotación hacia la derecha
        arrangeCarousel();
    });

    prevBtn.addEventListener('click', () => {
        rotationAngle += angleStep; // Rotación hacia la izquierda
        arrangeCarousel();
    });

    // Desplazamiento táctil
    let swipeStartX = null;
    let swipeTriggered = false;

    track.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'touch') return;
        swipeStartX = event.clientX;
    });

    track.addEventListener('pointerup', event => {
        if (event.pointerType !== 'touch' || swipeStartX === null) return;

        const deltaX = event.clientX - swipeStartX;
        swipeStartX = null;

        if (Math.abs(deltaX) < 48) return;

        swipeTriggered = true;
        if (deltaX < 0) {
            nextBtn.click();
        } else {
            prevBtn.click();
        }

        setTimeout(() => {
            swipeTriggered = false;
        }, 0);
    });

    track.addEventListener('pointercancel', () => {
        swipeStartX = null;
    });

    // 5) Click en la card frontal: ir a la página del juego
    track.addEventListener('click', event => {
        const card = event.target.closest('.card');
        if (!card || swipeTriggered || card.dataset.isFront !== "true") return;
        window.location.href = `game.html?id=${card.dataset.gameId}`;
    });

    // Render
    arrangeCarousel();
}

window.initCarouselDestacado = initCarouselDestacado;