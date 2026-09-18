   function initNavbar() {
     const btn = document.querySelector('#btn-hamburguesa');
     const menu = document.querySelector('#menu');
     if (!btn || !menu) return;
     btn.addEventListener('click', () => menu.classList.toggle('mostrar'));
   }

   function initMenuUsuario() {
     const btn = document.querySelector('#btn-usuario');
     const menu = document.querySelector('#usuario-menu');
     if (!btn || !menu) return;
     btn.addEventListener('click', () => menu.classList.toggle('mostrar'));
   }