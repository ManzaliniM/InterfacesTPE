/* =========================================================
   HOME — orquestador
   1) Carga todos los juegos desde api.js
   2) Filtra y elige los destacados (Moon Solitaire primero)
   3) Se los pasa al carrusel destacado
   4) Se los pasa a cada carrusel fila
   5) Conecta los controles de los carruseles fila
   ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  // ¿Estamos en el Home? Si no hay wrappers de carrusel, no hacemos nada.
  if (!document.querySelector('.carrusel-wrapper')) return;

  try {
    // 1) Cargamos TODOS los juegos (esto internamente hace 1 sola request)
    const todos = await obtenerJuegosMoon();

    // 2) Elegimos los 5 destacados (Moon Solitaire primero)
    const destacados = elegirDestacados(todos);

    // 3) Carrusel destacado
    const rootDestacado = document.getElementById('featured-carousel');
    if (rootDestacado && destacados.length) {
      initCarouselDestacado(rootDestacado, destacados);
    }

    // 4) Carruseles fila
    renderCarruselFila('carrusel-cocina', todos, 'cocina');
    renderCarruselFila('carrusel-puzzle', todos, 'puzzle');
    renderCarruselFila('carrusel-accion', todos, 'accion');
    renderCarruselFila('carrusel-recomendado', todos, 'recomendados');

    // 5) Conectamos flechas
    initControlesCarruselesFila();

  } catch (err) {
    console.error('No se pudo inicializar el Home:', err);
  }
});


/* ELEGIR LOS 5 DESTACADOS: Moon Solitaire va primero */
function elegirDestacados(todos) {
  if (!todos.length) return [];

  const moon = todos.find(j => {
    const s = j.titulo.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    return s.includes('moonsolitaire') || s.includes('moonsolitarie');
  });

  const resto = todos.filter(j => j !== moon);
  const shuffled = [...resto].sort(() => Math.random() - 0.5);
  const otros = shuffled.slice(0, 4);

  const resultado = moon ? [moon, ...otros] : otros;
  return resultado.slice(0, 5);
}