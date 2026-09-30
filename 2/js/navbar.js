function initNavbar() {
  const btn = document.querySelector('#btn-hamburguesa');
  const menu = document.querySelector('#menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('mostrar');
    btn.classList.toggle('active', isOpen); // Añade/quita la clase 'active' al botón
    btn.setAttribute('aria-expanded', isOpen);
  });
}

   function initMenuUsuario() {
     const btn = document.querySelector('#btn-usuario');
     const menu = document.querySelector('#usuario-menu');
     if (!btn || !menu) return;
     btn.addEventListener('click', () => menu.classList.toggle('mostrar'));
   }

   