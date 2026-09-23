// en main inyectamos los componentes al DOM!

//le pasamos a la funcion la unicacion del archivo (url) y la id de donde queremos inyectarla
async function injectComponent(url, placeholderId) {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById(placeholderId).innerHTML = html; // inyección
}

document.addEventListener('DOMContentLoaded', async () => {
    await injectComponent('components/navbar.html', 'nav-placeholder');
    await injectComponent('components/footer.html', 'footer-placeholder');
    // inicializar listeners que dependen de nav/footer, como el menú hamburguesa
    initNavbar();
    initMenuUsuario();
});