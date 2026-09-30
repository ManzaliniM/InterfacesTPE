const API_URL = 'https://6aad4daea2413bf0ec1191a0.mockapi.io/juego';
 
async function obtenerJuegos(categoria = null, limite = null, page = null, nombre = null) { // url dinámica
  let url = API_URL;
  if (categoria != null) { // si existen los parámetros de búsqueda, se los agregamos a la url
    url += '?categoria=' + categoria;
    if (limite & page) {
      url += '&page=' + page + '&limit=' + limite;
    }
  }
  if (nombre != null) {
    url += '?nombre=' + nombre;
  }
  const res = await fetch(url); // el await frena el código hasta que se complete el fetch
  if (!res.ok) throw new Error('No se pudieron cargar los juegos');
  return res.json();
}

 
const MOBILE_MAX = 600; // tiene que coincidir con el @media del CSS
 
function esMobile() {
  return window.innerWidth <= MOBILE_MAX;
}
 
// Dispara la animación de "achicar" (se reinicia en cada click)
function achicar(track) {
  track.classList.remove('moviendo');
  track.offsetWidth; // fuerza reflow para reiniciar la animación
  track.classList.add('moviendo');
}
 
// Salto instantáneo (sin animación), para posiciones iniciales y reinicios del loop
function saltar(track, x) {
  track.style.transition = 'none';
  track.style.transform = `translateX(${x}px)`;
  track.offsetHeight; // fuerza reflow
  track.style.transition = ''; // vuelve al transition del CSS
}
 
 
async function mostrarJuegos(categoria, elementoId) {
  let juegos = await obtenerJuegos(categoria, 4, 2);
  const contenedor = document.getElementById(elementoId);
  juegos.push(...await obtenerJuegos(categoria, 4, 3));
  juegos.push(...await obtenerJuegos(categoria));
  juegos.push(...await obtenerJuegos(categoria, 7, 1));
 
  const cardsHTML = juegos.map(juego => `
    <div class="card${juego.premium ? ' card-premium' : ''}">
      <div class="card-img-wrap">
        ${juego.premium
          ? `
            <img class="carrusel-peque premium-card " src="${juego.img}">
            <img class="tagPremium" src="assets/icons/premiumTag.svg">
            `
          : `
            <img class="carrusel-peque" src="${juego.img}">
            `
        }
      </div>
    <p>${juego.nombre}</p>
    </div>`
  ).join('');
 
  contenedor.innerHTML = `<div class="carrusel-track">${cardsHTML}</div>`;
}
 
function initCarruseles() {
  const wrappers = document.querySelectorAll('.carrusel-wrapper');
 
  wrappers.forEach(wrapper => {
    const carruselTrack = wrapper.querySelector('.carrusel-track');
    const btnPrev = wrapper.querySelector('.btn-previous');
    const btnNext = wrapper.querySelector('.btn-next');
    const distancia = 455;
    let posicion = 1; // propia de este carrusel
 
    saltar(carruselTrack, -2700); // posición inicial real
 
    function scrollAtras() {
      posicion--;
      if (posicion == -5) {
        saltar(carruselTrack, -2700);
        posicion = 1;
        return;
      }
      achicar(carruselTrack);
      carruselTrack.style.transform = `translateX(-${(posicion - 1) * distancia + 2700}px)`;
    }
 
    function scrollAdelante() {
      if (posicion == 6) {
        saltar(carruselTrack, -2700);
        posicion = 1;
        return;
      }
      posicion++;
      achicar(carruselTrack);
      carruselTrack.style.transform = `translateX(-${(posicion - 1) * distancia + 2700}px)`;
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
 
 
async function obetenerJuegosCarruselGrande() {
  let zombieRoad = await obtenerJuegos(null, null, null, 'Zombie road');
  let moonSol = await obtenerJuegos(null, null, null, 'Moon solitairie');
  let findCow = await obtenerJuegos(null, null, null, 'Find the cow');
  let papa = await obtenerJuegos(null, null, null, "Papa's bakeria");
 
  let juegos = [];
  juegos.push(findCow, papa, zombieRoad, moonSol, findCow, papa, zombieRoad, moonSol);
  armarCarruselGrande(juegos);
 
  if (esMobile()) iniciarMobile(); // tiene que ir después de armar las cards
}
 
function armarCarruselGrande(juegos) {
  const track = document.querySelector('.carrusel-grande-track');
 
  track.innerHTML = juegos.map((juego, i) => {
    let clase;
    if (i == 3) {
      clase = 'card-grande';
    } else if (i == 4) {
      clase = 'card-chica prox-grande';
    } else {
      clase = 'card-chica';
    }
 
    return `<div class="${clase}">
        <img src="${juego[0].img}">
        <h2>${juego[0].nombre}</h2>
      </div>
    `;
  }).join('');
}
 
obetenerJuegosCarruselGrande();

 
let indiceMobile = 3;
 
// Offset que deja la card i centrada en el viewport (se mide, no está hardcodeado)
function offsetMobile(track, i) {
  const card = track.children[0];
  if (!card) return 0; // todavía no hay cards
 
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const paso = card.offsetWidth + gap;
  const centrado = (track.parentElement.offsetWidth - card.offsetWidth) / 2;
  return -(i * paso - centrado);
}
 
function iniciarMobile() {
  const track = document.querySelector('.carrusel-grande-track');
  if (!track || !track.children.length) return; // nada que posicionar aún
  saltar(track, offsetMobile(track, indiceMobile)); // mantiene la card actual
}
 
function moverMobile(direccion) {
  const track = document.querySelector('.carrusel-grande-track');
  if (!track || !track.children.length) return;
  const total = track.children.length / 2; // 4 únicas, el resto son copias
 
  if (direccion === 1) {
    // si quedó en la copia del final, volvemos al inicio sin animación
    if (indiceMobile >= total) {
      indiceMobile = 0;
      saltar(track, offsetMobile(track, 0));
    }
    indiceMobile++;
    achicar(track);
    track.style.transform = `translateX(${offsetMobile(track, indiceMobile)}px)`;
 
    // al llegar a la copia, esperamos que termine la animación y saltamos al inicio real
    if (indiceMobile === total) {
      const fin = (e) => {
        if (e.target !== track) return;
        track.removeEventListener('transitionend', fin);
        if (indiceMobile === total) {
          indiceMobile = 0;
          saltar(track, offsetMobile(track, 0));
        }
      };
      track.addEventListener('transitionend', fin);
    }
    return;
  }
 
  if (direccion === -1) {
    // desde el inicio, saltamos a la copia del final y retrocedemos animado
    if (indiceMobile <= 0) {
      indiceMobile = total;
      saltar(track, offsetMobile(track, total));
    }
    indiceMobile--;
    achicar(track);
    track.style.transform = `translateX(${offsetMobile(track, indiceMobile)}px)`;
  }
}
 
 
const btnPrev = document.querySelector('.btn-previous-principal');
const btnNext = document.querySelector('.btn-next-principal');
let posicion2 = 2;
 
function mover(direccion) {
  if (esMobile()) return moverMobile(direccion);
 
  const track = document.querySelector('.carrusel-grande-track');
  const cards = track.querySelectorAll('div');
  const distancia = 500;
 
  if (direccion === 1) {
    if (posicion2 == 5) {
      saltar(track, -1074);
      posicion2 = 2;
      cards[posicion2 + 1].classList.remove('card-chica');
      cards[posicion2 + 1].classList.add('card-grande');
      cards[posicion2 + 4].classList.remove('card-grande');
      cards[posicion2 + 4].classList.add('card-chica');
      return;
    }
 
    achicar(track);
    track.style.transform = `translateX(-${(posicion2 - 1) * distancia + 1074}px)`;
    cards[posicion2 + 1].classList.remove('card-grande');
    cards[posicion2 + 1].classList.add('card-chica');
    cards[posicion2 + 2].classList.remove('card-chica');
    cards[posicion2 + 2].classList.add('card-grande');
    posicion2++;
    return;
  }
 
  if (direccion === -1) {
    if (posicion2 == 2) {
      saltar(track, -((5 - 2) * distancia + 1074));
      posicion2 = 5;
      cards[posicion2 + 1].classList.remove('card-chica');
      cards[posicion2 + 1].classList.add('card-grande');
      cards[posicion2 - 2].classList.remove('card-grande');
      cards[posicion2 - 2].classList.add('card-chica');
      return;
    }
 
    achicar(track);
    track.style.transform = `translateX(-${(posicion2 - 3) * distancia + 1074}px)`;
    cards[posicion2 + 1].classList.remove('card-grande');
    cards[posicion2 + 1].classList.add('card-chica');
    cards[posicion2].classList.remove('card-chica');
    cards[posicion2].classList.add('card-grande');
    posicion2--;
    return;
  }
}
 
btnPrev.addEventListener('click', () => mover(-1));
btnNext.addEventListener('click', () => mover(1));
 
 
let eraMobile = esMobile();
let anchoPrevio = window.innerWidth;
 
window.addEventListener('resize', () => {
  if (window.innerWidth === anchoPrevio) return; // cambió solo el alto (barra del navegador, teclado)
  anchoPrevio = window.innerWidth;
 
  if (esMobile() !== eraMobile) {
    location.reload(); // cambió de desktop a mobile o al revés
    return;
  }
  if (esMobile()) iniciarMobile(); // rotación / cambio de ancho dentro de mobile
});




