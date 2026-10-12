(function () {
    const DURATION = 5000; // ms
    const screen = document.getElementById('loading-screen');
    const percentEl = document.getElementById('loader-percent-value');
    const progressBar = document.getElementById('progress-bar-fill');
    const rocket = screen?.querySelector('.pixel-rocket');
    // el cohete es un elemento hijo de la loading screen. usamos querySelector

    if (!screen || !percentEl || !progressBar || !rocket) return;

    document.body.classList.add('is-loading');
    const start = performance.now();

    function finishLoading(event) {
        // checkea que event handler que se triggerea cuando termina la animacion de lanzamiento del cohete
        if (event.target !== rocket || event.animationName !== 'rocket-launch') return;

        // quita el event listener para el final de la anim
        rocket.removeEventListener('animationend', finishLoading);
        
        //  quita la clase 'is-loading' del body y agrega loading-done.
        screen.classList.add('loading-done');
        document.body.classList.remove('is-loading');

        //timeout para quitar la loading screen
        setTimeout(() => screen.remove(), 500);
    }

    function tick(now) {
        const elapsed = now - start;
        // porcentaje
        const percent = Math.min(100, Math.round((elapsed / DURATION) * 100));

        // texto + barra
        percentEl.textContent = percent;
        progressBar.style.width = percent + '%';

        if (elapsed < DURATION) {
            requestAnimationFrame(tick);
        } else {
            rocket.addEventListener('animationend', finishLoading);
            rocket.classList.add('launching');
        }
    }

    requestAnimationFrame(tick);
})();