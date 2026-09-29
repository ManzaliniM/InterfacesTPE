(function () {
    const DURATION = 5000; // ms
    const screen = document.getElementById('loading-screen');
    const percentEl = document.getElementById('loader-percent-value');
    if (!screen || !percentEl) return;

    document.body.classList.add('is-loading');
    const start = performance.now();

    function tick(now) {
        const elapsed = now - start;
        const percent = Math.min(100, Math.round((elapsed / DURATION) * 100));
        percentEl.textContent = percent;

        if (elapsed < DURATION) {
            requestAnimationFrame(tick);
        } else {
            screen.classList.add('loading-done');
            document.body.classList.remove('is-loading');
            setTimeout(() => screen.remove(), 500); // esperar el fade-out
        }
    }

    requestAnimationFrame(tick);
})();