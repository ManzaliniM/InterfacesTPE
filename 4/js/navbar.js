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

// TOGGLE PREMIUM
const PREMIUM_KEY = 'moonArcadePremium';

function initPremium() {
  const avatar = document.querySelector('.user-avatar');
  const btnPremium = document.querySelector('#btn-premium');
  const label = document.querySelector('#premium-label');
  if (!avatar) return;

  // Limpia la clase de la animación al terminar (se registra una sola vez)
  avatar.addEventListener('animationend', (e) => {
    if (e.animationName === 'premium-unlock') {
      avatar.classList.remove('premium-unlock');
    }
  });

  function render(isPremium) {
    avatar.classList.toggle('is-premium', isPremium);
    if (label) {
      label.textContent = isPremium ? 'Mi plan premium' : 'Mejorar a premium';
    }
  }

  // Restaurar el estado guardado al cargar la página
  render(localStorage.getItem(PREMIUM_KEY) === 'true');

  if (!btnPremium) return;

  btnPremium.addEventListener('click', () => {
    const isPremium = !avatar.classList.contains('is-premium');
    localStorage.setItem(PREMIUM_KEY, isPremium);
    render(isPremium);

    avatar.classList.remove('premium-unlock');
    if (isPremium) {
      // Reflow para poder repetir la animación si se activa varias veces seguidas
      void avatar.offsetWidth;
      avatar.classList.add('premium-unlock');
    }
  });
}