const API_URL = 'https://6aad4daea2413bf0ec1191a0.mockapi.io/juego'; // o la URL de tu mock API

async function obtenerJuegos() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('No se pudieron cargar los juegos');
  return res.json();
}

async function injectComponent(url, placeholderId) {
  const res = await fetch(url);
  const html = await res.text();
  document.getElementById(placeholderId).innerHTML = html;
}

document.addEventListener('DOMContentLoaded', async () => {
  await injectComponent('components/navbar.html', 'nav-placeholder');
  await injectComponent('components/footer.html', 'footer-placeholder');
  // inicializar listeners que dependen de nav/footer, como el menú hamburguesa
  initNavbar();
  initMenuUsuario();
});

async function mostrarJuegos(categoria, elementoId) {
  console.log(categoria);
  const juegos = await obtenerJuegos();
  const contenedor = document.getElementById(elementoId);
  const juegosCategoria= juegos.filter(j => j.categoria === categoria);

  juegosCategoria.forEach(juegosCategoria => {
    contenedor.innerHTML += `
      <div class="card">
        <img class="carrusel-peque" src='${juegosCategoria.img}'>
        <body>${juegosCategoria.nombre}<body>
      </div>
    `;
  });
}

mostrarJuegos('cocina','carrusel-cocina');
mostrarJuegos('puzzle','carrusel-puzzle');
mostrarJuegos('accion','carrusel-accion');
mostrarJuegos('recomendados','carrusel-recomendado');


