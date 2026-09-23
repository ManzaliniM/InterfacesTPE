const API_URL = 'https://6aad4daea2413bf0ec1191a0.mockapi.io/juego'; // o la URL de tu mock API

async function obtenerJuegos(categoria= null, limite= null) {  //url dinamica 
  let url= API_URL
  if(categoria!=null){ // evaluamos que existan los parametros de busqueda, si existen se los agregamos a la url
    url+='?categoria='+categoria;
    if(limite){
      url+= '&page=1&limit='+limite;
    }
  }
  const res = await fetch(url); // traemos el contenido del url, el await nos frena el recorrido del codigo hasta que esta accion se complete
  if (!res.ok) throw new Error('No se pudieron cargar los juegos'); //si no hay respuesta tira error
  return res.json();
}

async function mostrarJuegos(categoria, elementoId) {
  let juegos = await obtenerJuegos(categoria);
  const contenedor = document.getElementById(elementoId);

  juegos.push(
    ...await obtenerJuegos(categoria, calcularExtra(9, 3))
  );

  const cardsHTML = juegos.map(juego => `
    <div class="card">
      <img class="carrusel-peque" src='${juego.img}'>
      <p>${juego.nombre}</p>
    </div>
  `).join('');

  contenedor.innerHTML = `<div class="carrusel-track">${cardsHTML}</div>`;
}

function calcularExtra(cantVisible, cantSlide){ //calculamos la cantidad de cards extra que le agregamos al final del carrusel
  return cantVisible-cantSlide +1; //le agrego 1 mas por si las dudas
}


let posicion=1;

function initCarruseles() {
  const wrappers = document.querySelectorAll('.carrusel-wrapper');

  wrappers.forEach(wrapper => {
    const carruselTrack = wrapper.querySelector('.carrusel-track'); // acotado a ESTE wrapper
    const btnPrev = wrapper.querySelector('.btn-previous');
    const btnNext = wrapper.querySelector('.btn-next');
    const distancia = 628;
    let posicion = 1; // propia de este carrusel, no compartida

    function scrollAtras() {
      if (posicion == 1) return;
      posicion--;
      carruselTrack.style.transform = `translateX(-${(posicion - 1) * distancia}px)`;
    }

    function scrollAdelante() {
      if (posicion == 5) {
        posicion = 1;
        carruselTrack.style.transition = 'none';
        carruselTrack.style.transform = `translateX(0px)`;
        carruselTrack.offsetHeight;
        carruselTrack.style.transition = 'transform 0.4s ease';
        return;
      }
      posicion++;
      carruselTrack.style.transform = `translateX(-${(posicion - 1) * distancia}px)`;
    }

    btnPrev.addEventListener('click', scrollAtras);
    btnNext.addEventListener('click', scrollAdelante);
  });
}

async function initTodo() {
  await Promise.all([
    mostrarJuegos('cocina', 'carrusel-cocina'),
    mostrarJuegos('puzzle', 'carrusel-puzzle'),
    mostrarJuegos('accion', 'carrusel-accion'),
    mostrarJuegos('recomendados', 'carrusel-recomendado'),
  ]);

  initCarruseles(); // recién ahora existen los .carrusel-track en el DOM
}

initTodo();


