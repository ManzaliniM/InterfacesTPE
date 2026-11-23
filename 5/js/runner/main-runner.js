// main-runner.js — punto de entrada: arma la interfaz, escala el escenario y conecta las pantallas con el juego.
// Se carga al final, después de config, parallax, entities y runner (ver "script" en games.json).
// Necesita un contenedor <div id="runner-root"></div> o, si no existe, reemplaza el <canvas id="runner"> que crea game.html.

const TEMPLATE = `
  <div class="runner-wrap">
    <div class="runner-stage">
      <div class="hud">
        <span>Puntos <b class="hud-score">0</b></span>
        <span class="orb-status" hidden>GRAVEDAD CERO · <b class="orb-time">5</b>s</span>
        <span class="hud-best">Récord <b class="hud-best-value">0</b></span>
      </div>
      <section class="overlay start-overlay" data-screen="start">
        <div class="start-card">
          <h2>Moon Runner</h2>
          <p class="start-tagline">Vuela tan lejos como puedas</p>
          <div class="start-instructions">
            <p class="start-row">
              <strong class="start-label start-controls">IMPULSO</strong>
              <span>Espacio / Flecha arriba / Clic</span>
            </p>
            <p class="start-row">
              <strong class="start-label start-objective">OBJETIVO</strong>
              <span>Esquiva los obstáculos</span>
            </p>
            <p class="start-row">
              <strong class="start-label start-star">ESTRELLA</strong>
              <span>+${CONFIG_RUNNER.STAR_POINTS} puntos</span>
            </p>
            <p class="start-row">
              <strong class="start-label start-orb">ORBE DE GRAVEDAD CERO</strong>
              <span>Gravedad reducida durante ${CONFIG_RUNNER.GRAVITY_ORB_DURATION} segundos</span>
            </p>
          </div>
          <button type="button" class="runner-btn" data-action="play">Jugar</button>
        </div>
      </section>
      <section class="overlay" data-screen="over" hidden>
        <h2>Fin del juego</h2>
        <p class="over-score"></p>
        <button type="button" class="runner-btn" data-action="play">Jugar de nuevo</button>
      </section>
    </div>
  </div>`;

function findRunnerRoot() {
  let root = document.getElementById('runner-root');
  if (root) return root;
  const canvas = document.getElementById('runner'); // lo crea game.html a partir del campo "canvas" de games.json
  if (!canvas) return null;
  root = document.createElement('div');
  root.id = 'runner-root';
  canvas.replaceWith(root);
  return root;
}

function initRunner(root = findRunnerRoot()) {
  if (!root) return null;
  root.innerHTML = TEMPLATE;
  const q = (sel) => root.querySelector(sel);
  const wrap = q('.runner-wrap');
  const stage = q('.runner-stage');
  const startScreen = q('[data-screen="start"]');
  const overScreen = q('[data-screen="over"]');

  const runner = new Runner(
    stage,
    {
      score: q('.hud-score'),
      best: q('.hud-best-value'),
      orbStatus: q('.orb-status'),
      orbTime: q('.orb-time'),
    },
    {
      onStart: () => {
        startScreen.hidden = true;
        overScreen.hidden = true;
      },
      onGameOver: ({ score, best, isNewBest }) => {
        q('.over-score').textContent = isNewBest ? `Nuevo récord: ${score}` : `Puntos: ${score}. Récord: ${best}`;
        setTimeout(() => {
          overScreen.hidden = false; // se muestra después de la animación de choque
          overScreen.querySelector('button').focus({ preventScroll: true });
        }, 700);
      },
    }
  );

  root.querySelectorAll('[data-action="play"]').forEach((b) => b.addEventListener('click', () => runner.start()));

  // El escenario mide siempre 960×540 internamente; se escala para llenar el ancho disponible
  const fit = () => {
    const s = wrap.clientWidth / CONFIG_RUNNER.WIDTH;
    stage.style.transform = `scale(${s})`;
    wrap.style.height = `${CONFIG_RUNNER.HEIGHT * s}px`;
  };
  new ResizeObserver(fit).observe(wrap);
  fit();

  startScreen.querySelector('button').focus({ preventScroll: true }); // Espacio o Enter inician la partida
  return runner;
}

// Arranque automático. Si game.html prefiere iniciarlo por su cuenta, quitar estas líneas y llamar a initRunner().
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initRunner());
else initRunner();
