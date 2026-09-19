const API_URL = 'https://6aad4daea2413bf0ec1191a0.mockapi.io/juego'; // o la URL de tu mock API

async function obtenerJuegos() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('No se pudieron cargar los juegos');
  return res.json();
}
