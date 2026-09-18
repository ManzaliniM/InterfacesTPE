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