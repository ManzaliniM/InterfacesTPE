// runner.js — loop principal, generación de obstáculos, dificultad progresiva, colisiones y puntaje

const runnerRand = (a, b) => a + Math.random() * (b - a);
const runnerClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const runnerPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const runnerOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

class Runner {
  // hud: { score, best } (elementos de texto) — callbacks: { onStart, onGameOver({ score, best, isNewBest }) }
  constructor(stage, hud, callbacks = {}) {
    this.hud = hud;
    this.cb = callbacks;
    this.parallax = new ParallaxRunner(stage); // las capas se crean primero: quedan detrás
    this.layer = document.createElement('div');
    this.layer.className = 'entities';
    stage.appendChild(this.layer);
    this.player = new PlayerRunner(this.layer);
    this.best = this.loadBest();
    this.obstacles = [];
    this.items = [];
    this.raf = 0;
    this.loop = this.loop.bind(this);
    this.reset();
    this.bindInput(stage);
  }

  get score() {
    return this.passed + this.bonus; // obstáculos superados + bonus de ítems
  }

  // ---------- Estado ----------
  reset() {
    this.obstacles.forEach((o) => o.destroy());
    this.items.forEach((i) => i.destroy());
    this.obstacles = [];
    this.items = [];
    this.player.reset();
    this.parallax.reset();
    this.speed = CONFIG_RUNNER.SPEED_START;
    this.passed = 0;
    this.bonus = 0;
    this.spawned = 0;
    this.lastGapY = CONFIG_RUNNER.PLAY_HEIGHT / 2;
    this.nextX = CONFIG_RUNNER.WIDTH + 200; // posición x del próximo obstáculo
    this.spacing = 400; // distancia respecto del obstáculo anterior
    this.state = 'ready'; // ready | playing | over
    this.updateHud();
  }

  start() {
    if (this.state === 'playing') return;
    if (this.state === 'over') this.reset();
    this.state = 'playing';
    this.last = performance.now();
    this.player.flap();
    this.cb.onStart?.();
    this.raf = requestAnimationFrame(this.loop);
  }

  gameOver() {
    this.state = 'over';
    cancelAnimationFrame(this.raf);
    this.player.crash();
    const isNewBest = this.score > this.best;
    if (isNewBest) {
      this.best = this.score;
      this.saveBest();
    }
    this.updateHud();
    this.cb.onGameOver?.({ score: this.score, best: this.best, isNewBest });
  }

  // ---------- Entrada ----------
  bindInput(stage) {
    const flap = (e) => {
      if (this.state !== 'playing') return; // fuera de partida no se bloquea el scroll ni los botones
      e.preventDefault();
      this.player.flap();
    };
    document.addEventListener('keydown', (e) => {
      if (e.repeat || !['Space', 'ArrowUp'].includes(e.code)) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return; // ej. formulario de comentarios
      flap(e);
    });
    stage.addEventListener('pointerdown', flap);
  }

  // ---------- Loop ----------
  loop(now) {
    if (this.state !== 'playing') return;
    const dt = Math.min((now - this.last) / 1000, 0.05); // tope: evita saltos al volver de otra pestaña
    this.last = now;
    this.update(dt);
    if (this.state === 'playing') this.raf = requestAnimationFrame(this.loop);
  }

  update(dt) {
    const p = this.player;
    p.update(dt);
    this.parallax.update(dt, this.speed);

    const dx = this.speed * dt;
    this.obstacles.forEach((o) => o.move(dx));
    this.items.forEach((i) => i.move(dx));
    this.nextX -= dx;
    while (this.nextX <= CONFIG_RUNNER.WIDTH + 100) this.spawn();

    // Puntaje y dificultad: cada obstáculo superado suma 1 y acelera el mundo
    for (const o of this.obstacles) {
      if (!o.scored && o.right < p.x) {
        o.scored = true;
        this.passed++;
        this.speed = Math.min(CONFIG_RUNNER.SPEED_MAX, this.speed + CONFIG_RUNNER.SPEED_PER_OBSTACLE);
        this.updateHud();
      }
    }

    // Colisión con piso u obstáculos: fin de la partida
    const hb = p.hitbox;
    if (hb.y + hb.h >= CONFIG_RUNNER.PLAY_HEIGHT || this.obstacles.some((o) => o.rects.some((r) => runnerOverlap(hb, r)))) {
      this.gameOver();
      return;
    }

    // Ítems: NO terminan la partida
    for (const it of this.items) {
      if (!it.collected && runnerOverlap(hb, it.rect)) {
        it.collect();
        p.collect(it.kind);
        if (it.kind === 'star') {
          this.bonus += CONFIG_RUNNER.STAR_POINTS;
          this.updateHud();
        }
      }
    }

    this.obstacles = this.obstacles.filter((o) => (o.right > -60 ? true : (o.destroy(), false)));
    this.items = this.items.filter((i) => {
      if (i.collected) return false; // se destruye solo al terminar su animación
      if (i.x + i.w < -60) return (i.destroy(), false);
      return true;
    });
  }

  // ---------- Generación ----------
  spawn() {
    const gap = Math.max(CONFIG_RUNNER.GAP_MIN, CONFIG_RUNNER.GAP_START - this.spawned * CONFIG_RUNNER.GAP_SHRINK);
    const gapY = this.pickGapY(gap, this.spacing);
    const x = this.nextX;
    this.obstacles.push(new ObstacleRunner(this.layer, { x, gapY, gap, type: runnerPick(CONFIG_RUNNER.OBSTACLE_TYPES) }));

    // Ítem opcional en el "corredor" entre el obstáculo anterior y este (siempre alcanzable)
    if (this.spawned > 0 && Math.random() < CONFIG_RUNNER.ITEM_CHANCE) {
      const kind = Math.random() < CONFIG_RUNNER.ITEM_UFO_CHANCE ? 'ufo' : 'star';
      const mid = (this.lastGapY + gapY) / 2 + runnerRand(-20, 20);
      const y = runnerClamp(mid - CONFIG_RUNNER.ITEM_SIZE / 2, CONFIG_RUNNER.GAP_MARGIN, CONFIG_RUNNER.PLAY_HEIGHT - CONFIG_RUNNER.GAP_MARGIN - CONFIG_RUNNER.ITEM_SIZE);
      this.items.push(new ItemRunner(this.layer, { kind, x: x - this.spacing / 2 - CONFIG_RUNNER.ITEM_SIZE / 2, y }));
    }

    this.lastGapY = gapY;
    this.spawned++;
    this.spacing = runnerRand(CONFIG_RUNNER.SPACING_MIN, CONFIG_RUNNER.SPACING_MAX); // distancia variable al siguiente
    this.nextX = x + CONFIG_RUNNER.OBSTACLE_WIDTH + this.spacing;
  }

  // Altura del hueco: varía, pero solo dentro de lo que se puede alcanzar en el tiempo disponible
  pickGapY(gap, spacing) {
    const min = CONFIG_RUNNER.GAP_MARGIN + gap / 2;
    const max = CONFIG_RUNNER.PLAY_HEIGHT - CONFIG_RUNNER.GAP_MARGIN - gap / 2;
    const t = spacing / this.speed; // tiempo entre un hueco y el siguiente
    const up = CONFIG_RUNNER.CLIMB_RATE * t;
    const down = 0.5 * CONFIG_RUNNER.GRAVITY * t * t;
    const lo = Math.max(min, this.lastGapY - up);
    const hi = Math.min(max, this.lastGapY + down);
    return lo > hi ? runnerClamp(this.lastGapY, min, max) : runnerRand(lo, hi);
  }

  // ---------- HUD y récord ----------
  updateHud() {
    this.hud.score.textContent = this.score;
    this.hud.best.textContent = this.best;
  }

  loadBest() {
    try {
      return Number(localStorage.getItem(CONFIG_RUNNER.STORAGE_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  saveBest() {
    try {
      localStorage.setItem(CONFIG_RUNNER.STORAGE_KEY, String(this.best));
    } catch {
      /* sin almacenamiento: el récord solo vale durante la sesión */
    }
  }
}
