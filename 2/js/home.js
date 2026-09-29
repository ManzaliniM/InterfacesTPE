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
  console.log(url);
  const res = await fetch(url); // traemos el contenido del url, el await nos frena el recorrido del codigo hasta que esta accion se complete
  if (!res.ok) throw new Error('No se pudieron cargar los juegos'); //si no hay respuesta tira error
  return res.json();
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

  console.log(juegos)

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
  
    function scrollAtras() {
      posicion--;
      carruselTrack.style.transform = `translateX(-${(posicion - 1) * distancia +2700}px )`;
      console.log(posicion);
      if(posicion== -5){
        carruselTrack.style.transform = `translateX(-2700px)`;
        posicion=1;
        return;
      }
    }

    function scrollAdelante() {
      if (posicion == 6) {
        posicion = 1;
        carruselTrack.style.transition = 'none';
        carruselTrack.style.transform = `translateX(-2700px)`;
        carruselTrack.offsetHeight;
        //carruselTrack.style.transition = 'transform 0.4s ease';
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


async function formarCarruselGrande(){
  let zombieRoad= await(obtenerJuegos(null,null,null,'Zombie road'));
  let moonSol=await(obtenerJuegos(null,null,null,'Moon solitairie'));
  let findCow=await(obtenerJuegos(null,null,null,'Find the cow'));
  let papa=await(obtenerJuegos(null,null,null,"Papa's bakeria"));
  console.log(zombieRoad)
  document.querySelector('.carrusel-grande-track').innerHTML =  
  `<div class="img-chica">
      <img src="${zombieRoad[0].img}" class="img1">
      <h2> ${zombieRoad[0].nombre}
    </div>
    <div>
      <img src="${moonSol[0].img}" class="img2">
      <h2> ${moonSol[0].nombre}
    </div>
    <div class="img-chica">
      <img src="${findCow[0].img}" class="img3">
      <h2> ${findCow[0].nombre}
    </div>
    <div class="img-chica">
      <img src="${papa[0].img}" class="img4">
      <h2> ${papa[0].nombre}
    </div>`

 
}

formarCarruselGrande();





