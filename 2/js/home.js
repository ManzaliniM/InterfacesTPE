const API_URL = 'https://6aad4daea2413bf0ec1191a0.mockapi.io/juego'; // o la URL de tu mock API

async function obtenerJuegos(categoria= null, limite= null, page=null, nombre=null) {  //url dinamica 
  let url= API_URL
  if(categoria!=null){ // evaluamos que existan los parametros de busqueda, si existen se los agregamos a la url
    url+='?categoria='+categoria;
    if(limite & page){
      url+= '&page='+page+'&limit='+limite;
    }
  }
  if(nombre!=null){
    url+='?nombre='+ nombre;
  }
  const res = await fetch(url); // traemos el contenido del url, el await nos frena el recorrido del codigo hasta que esta accion se complete
  if (!res.ok) throw new Error('No se pudieron cargar los juegos'); //si no hay respuesta tira error
  return res.json();
}


// Salto instantáneo (sin animación) para los reinicios del loop
function saltar(track, x) {
  track.style.transition = 'none';
  track.style.transform = `translateX(${x}px)`;
  track.offsetHeight;              // fuerza reflow
  track.style.transition = '';     // vuelve al transition del CSS
}

async function mostrarJuegos(categoria, elementoId) {
  let juegos = await obtenerJuegos(categoria,4,2);
  const contenedor = document.getElementById(elementoId);
  juegos.push(
    ...await obtenerJuegos(categoria,4,3)
  ); 
  juegos.push(
    ...await obtenerJuegos(categoria)
  );  
  juegos.push(
    ...await obtenerJuegos(categoria, 7,1)
  );


  const cardsHTML = juegos.map(juego => `
    <div class="card"> 
      ${juego.premium
        ? `
          <img class="carrusel-peque premium-card " src="${juego.img}">
          <img class="tagPremium" src="assets/icons/premiumTag.svg">
          `
        : `
          <img class="carrusel-peque" src="${juego.img}">
          `
      }
    <p>${juego.nombre}</p>
    </div>`
  ).join('');

  contenedor.innerHTML = `<div class="carrusel-track">${cardsHTML}</div>`;
}




let posicion=1;

function initCarruseles() {
  const wrappers = document.querySelectorAll('.carrusel-wrapper');

  wrappers.forEach(wrapper => {
    const carruselTrack = wrapper.querySelector('.carrusel-track'); // acotado a ESTE wrapper
    const btnPrev = wrapper.querySelector('.btn-previous');
    const btnNext = wrapper.querySelector('.btn-next');
    const distancia = 455;
    let posicion = 1; // propia de este carrusel, no compartida
    saltar(carruselTrack, -2700)
    function scrollAtras() {
      posicion--;
      carruselTrack.style.transform = `translateX(-${(posicion - 1) * distancia +2700}px )`;
      if (posicion == -5) {
        saltar(carruselTrack, -2700);
        posicion = 1;
        return;
      }
    }

    function scrollAdelante() {
      if (posicion == 6) {
        saltar(carruselTrack, -2700);
        posicion = 1;
        return;
      }
      posicion++;
      carruselTrack.style.transform = `translateX(-${(posicion - 1) * distancia+2700}px)`;
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


async function obetenerJuegosCarruselGrande(){
  let zombieRoad= await(obtenerJuegos(null,null,null,'Zombie road'));
  let moonSol=await(obtenerJuegos(null,null,null,'Moon solitairie'));
  let findCow=await(obtenerJuegos(null,null,null,'Find the cow'));
  let papa=await(obtenerJuegos(null,null,null,"Papa's bakeria"));

  let juegos=[]
  juegos.push(findCow, papa, zombieRoad,moonSol,findCow,papa,zombieRoad,moonSol);
  //console.log(juegos);
  armarCarruselGrande(juegos);

}

function armarCarruselGrande(juegos){
  const track = document.querySelector('.carrusel-grande-track');


  track.innerHTML = juegos.map((juego, i) => {
    let clase;
    if (i==3) {
      clase = 'card-grande';
      console.log(clase);
    } else{
      clase= 'card-chica';
      console.log(clase);
    }

     return `<div class="${clase}">
        <img src="${juego[0].img}">
        <h2>${juego[0].nombre}</h2>
      </div>
    `;
  }).join('');
}


obetenerJuegosCarruselGrande();

const btnPrev = document.querySelector('.btn-previous-principal');
const btnNext = document.querySelector('.btn-next-principal');
 let posicion2 = 2;
  

function mover(direccion) {
  const track = document.querySelector('.carrusel-grande-track');
  const cards = track.querySelectorAll('div'); // las 8, en orden, una sola vez
  const distancia = 500;
    console.log(posicion2);

  if(direccion===1){
  
    if(posicion2== 5){
      saltar(track, -1074);   
      posicion2=2;
      cards[posicion2+1].classList.remove('card-chica');
      cards[posicion2+1].classList.add('card-grande'); //cambiamos los tamaños de las cards

      cards[posicion2+4].classList.remove('card-grande');
      cards[posicion2+4].classList.add('card-chica');
      return;
    }

    track.style.transform = `translateX(-${(posicion2- 1) * distancia+1074}px)`;
    cards[posicion2+1].classList.remove('card-grande');
    cards[posicion2+1].classList.add('card-chica'); //cambiamos los tamaños de las cards

    cards[posicion2+2].classList.remove('card-chica');
    cards[posicion2+2].classList.add('card-grande');
    posicion2++;
    return;
  }

  if(direccion===-1){
    if(posicion2==2){
      saltar(track, -((5 - 2) * distancia + 1074));
      posicion2=5;
      cards[posicion2+1].classList.remove('card-chica');
      cards[posicion2+1].classList.add('card-grande');

      cards[posicion2-2].classList.remove('card-grande');
      cards[posicion2-2].classList.add('card-chica');
      return;
    }

    track.style.transform = `translateX(-${(posicion2-3) * distancia+1074}px)`;
    cards[posicion2+1].classList.remove('card-grande');
    cards[posicion2+1].classList.add('card-chica');

    cards[posicion2].classList.remove('card-chica');
    cards[posicion2].classList.add('card-grande');
    posicion2--;
    return;
}
}

btnPrev.addEventListener('click', () => mover(-1));
btnNext.addEventListener('click', () => mover(1));




