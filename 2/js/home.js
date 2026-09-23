const API_URL = 'https://6aad4daea2413bf0ec1191a0.mockapi.io/juego'; // o la URL de tu mock API

async function obtenerJuegos() {
    const res = await fetch(API_URL); // traemos el contenido del url, el await nos frena el recorrido del codigo hasta que esta accion se complete
    if (!res.ok) throw new Error('No se pudieron cargar los juegos'); //si no hay respuesta tira error
    return res.json();
}

async function mostrarJuegos(categoria, elementoId) {
    const juegos = await obtenerJuegos();
    const contenedor = document.getElementById(elementoId);
    const juegosCategoria = juegos.filter(j => j.categoria === categoria);

    juegosCategoria.forEach(juegosCategoria => {
        contenedor.innerHTML += `
      <div class="card">
        <img class="carrusel-peque" src='${juegosCategoria.img}'>
        <p>${juegosCategoria.nombre}<p>
      </div>
    `;
    });
}

mostrarJuegos('cocina', 'carrusel-cocina');
mostrarJuegos('puzzle', 'carrusel-puzzle');
mostrarJuegos('accion', 'carrusel-accion');
mostrarJuegos('recomendados', 'carrusel-recomendado');

function initCarruseles() {
    const wrappers = document.querySelectorAll('.carrusel-wrapper'); //seleccionamos todos los wrapers del documento

    wrappers.forEach(wrapper => {//recorremos cada wraper
        const scroller = wrapper.querySelector('.carrusel');
        const btnPrev = wrapper.querySelector('.btn-previous');
        const btnNext = wrapper.querySelector('.btn-next');
        //por cada uno guardamos el carrusel, y los botones siguiente y anterior
        const distancia = 620; // ancho aproximado de 3 cards + el gap

        btnPrev.addEventListener('click', () => {
            scroller.scrollBy({ left: -distancia });
        });

        btnNext.addEventListener('click', () => {
            scroller.scrollBy({ left: distancia });
        });

        //les asignamos los eventlistener a los botones
    });
}

initCarruseles();