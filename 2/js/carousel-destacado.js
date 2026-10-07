/**
 * Inicializador del Carrusel Circular Destacado
 * Conectado con el flujo de home.js y api.js de Moon Arcade
 * @param {HTMLElement} rootContainer - El elemento contenedor (#featured-carousel)
 * @param {Array} juegosDestacados - Lista de objetos de juegos filtrados por la API
 */
function initCarouselDestacado(rootContainer, juegosDestacados) {
    const track = rootContainer.querySelector('#carousel-track');
    const prevBtn = rootContainer.querySelector('#prev');
    const nextBtn = rootContainer.querySelector('#next');

    if (!track || !juegosDestacados || juegosDestacados.length === 0) return;

    // 1) Renderizar dinámicamente las tarjetas del carrusel destacado
    track.innerHTML = '';

    juegosDestacados.forEach(juego => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        cardElement.innerHTML = `
            <img src="${juego.imagenPortada}" alt="Portada de ${juego.titulo}" draggable="false" />
            <div class="card-title">${juego.titulo}</div>
        `;

        // Enlace clickeable restringido exclusivamente a la tarjeta del frente destacado
        cardElement.addEventListener('click', () => {
            if (cardElement.style.pointerEvents !== "none" && cardElement.dataset.isFront === "true") {
                window.location.href = `game.html?id=${juego.id}`;
            }
        });

        track.appendChild(cardElement);
    });

    // 2) Configuración de la física trigonométrica orbital (Foco central aumentado)
    const cards = track.querySelectorAll('.card');
    const totalCards = cards.length;
    const angleStep = (2 * Math.PI) / totalCards;
    let rotationAngle = 0;

    function arrangeCarousel() {
        cards.forEach((card, index) => {
            const cardAngle = (angleStep * index) + rotationAngle;

            // Fórmulas matemáticas para proyectar la elipse espacial
            const x = Math.sin(cardAngle) * 140; // Separación horizontal elíptica calibrada
            const z = Math.cos(cardAngle);        // Coordenada Z virtual (-1 al fondo, 1 al frente)

            // ARREGLADO: Curva de escalado potenciada. 
            // La tarjeta del frente destaca masivamente escalando a 1.15x; los costados bajan armónicamente.
            const scale = 0.60 + (z + 1) * 0.275;

            // Manejo de capas de superposición (Z-Index dinámico)
            const zIndex = Math.round(((z + 1) / 2) * 20);

            // Detección e interactividad selectiva según posición orbital
            if (z < -0.1) {
                card.style.opacity = "0";
                card.style.pointerEvents = "none";
                card.style.cursor = "default";
                card.dataset.isFront = "false";
            } else {
                // Si la tarjeta está firmemente al frente, se habilita su puntero de acción
                if (z > 0.9) {
                    card.dataset.isFront = "true";
                    card.style.cursor = "pointer";
                } else {
                    card.dataset.isFront = "false";
                    card.style.cursor = "default";
                }
                card.style.opacity = "1";
                card.style.pointerEvents = "auto";
            }

            // Aplicamos los valores en los estilos en línea CSS
            card.style.zIndex = zIndex;
            card.style.transform = `translate(-50%, -50%) translate(${x}%) scale(${scale})`;
        });
    }

    // 3) Eventos nativos de las flechas del bloque principal
    nextBtn.addEventListener('click', () => {
        rotationAngle -= angleStep; // Rotación fluida manual hacia la derecha
        arrangeCarousel();
    });

    prevBtn.addEventListener('click', () => {
        rotationAngle += angleStep; // Rotación fluida manual hacia la izquierda
        arrangeCarousel();
    });

    // Inicializar render inicial
    arrangeCarousel();
}

// Globalización de la función constructora para home.js
window.initCarouselDestacado = initCarouselDestacado;