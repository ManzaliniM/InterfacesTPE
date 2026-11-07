// entities.js — jugador, obstáculos e ítems. Cada uno crea y mueve sus propios elementos DOM.

function runnerEl(cls, parent) {
  const n = document.createElement('div');
  n.className = cls;
  if (parent) parent.appendChild(n);
  return n;
}

// Sprite = .sprite (recibe las animaciones de estado) > .sprite-strip (hoja de frames horizontal, ver runner.css)
function runnerSprite(parent, cls) {
  const sprite = runnerEl(`sprite ${cls}`, parent);
  runnerEl('sprite-strip', sprite);
  return sprite;
}

class PlayerRunner {
  constructor(layer) {
    const { x, w, h } = CONFIG_RUNNER.PLAYER;
    this.x = x;
    this.w = w;
    this.h = h;
    this.el = runnerEl('player', layer); // JS lo posiciona con transform
    this.el.style.width = `${w}px`;
    this.el.style.height = `${h}px`;
    this.sprite = runnerSprite(this.el, 'player-sprite'); // el CSS lo anima (keyframes)
    this.sprite.addEventListener('animationend', (e) => {
      if (e.animationName === 'cat-flap') this.sprite.classList.remove('is-flap');
      if (e.animationName === 'cat-glow') this.sprite.classList.remove('is-glow');
    });
    this.reset();
  }

  reset() {
    this.y = (CONFIG_RUNNER.PLAY_HEIGHT - this.h) / 2;
    this.vy = 0;
    this.lowGravityTime = 0;
    this.sprite.className = 'sprite player-sprite';
    this.render();
  }

  // Reinicia una animación CSS aunque la clase ya esté puesta
  play(cls) {
    this.sprite.classList.remove(cls);
    void this.sprite.offsetWidth; // fuerza reflow
    this.sprite.classList.add(cls);
  }

  flap() {
    // Con gravedad lunar el impulso se reduce para que la altura del salto sea la misma, pero más flotante
    const k = this.lowGravityTime > 0 ? Math.sqrt(CONFIG_RUNNER.UFO_GRAVITY_FACTOR) : 1;
    this.vy = CONFIG_RUNNER.JUMP_VELOCITY * k;
    this.sprite.classList.remove('is-fall');
    this.play('is-flap');
  }

  collect(kind) {
    if (kind === 'ufo') {
      this.lowGravityTime = CONFIG_RUNNER.UFO_DURATION;
      this.sprite.classList.add('is-lowgrav');
    }
    this.play('is-glow');
  }

  crash() {
    this.sprite.classList.remove('is-fall', 'is-flap', 'is-glow');
    this.sprite.classList.add('is-crash');
  }

  update(dt) {
    if (this.lowGravityTime > 0) {
      this.lowGravityTime -= dt;
      if (this.lowGravityTime <= 0) this.sprite.classList.remove('is-lowgrav');
    }
    const g = CONFIG_RUNNER.GRAVITY * (this.lowGravityTime > 0 ? CONFIG_RUNNER.UFO_GRAVITY_FACTOR : 1);
    this.vy = Math.min(this.vy + g * dt, CONFIG_RUNNER.MAX_FALL_SPEED);
    this.y += this.vy * dt;
    if (this.y < 0) {
      this.y = 0; // el techo frena al jugador, no lo mata
      this.vy = 0;
    }
    this.sprite.classList.toggle('is-fall', this.vy > 250);
    this.render();
  }

  get hitbox() {
    const i = CONFIG_RUNNER.PLAYER.hitboxInset;
    return { x: this.x + i, y: this.y + i, w: this.w - 2 * i, h: this.h - 2 * i };
  }

  render() {
    this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }
}

// Un obstáculo = dos piezas (arriba y abajo) con un hueco en el medio.
// Cada pieza es un tile repetible (rayo, mástil, cable) más un remate (.cap: emisor, antena, satélite),
// así cualquier altura funciona sin deformar el arte.
class ObstacleRunner {
  constructor(layer, { x, gapY, gap, type }) {
    this.x = x;
    this.w = CONFIG_RUNNER.OBSTACLE_WIDTH;
    this.type = type;
    this.gapTop = gapY - gap / 2;
    this.gapBottom = gapY + gap / 2;
    this.scored = false;

    this.top = runnerEl(`obstacle-piece obstacle-${type} is-top`, layer);
    this.bottom = runnerEl(`obstacle-piece obstacle-${type} is-bottom`, layer);
    for (const p of [this.top, this.bottom]) {
      p.style.width = `${this.w}px`;
      runnerEl('cap', p);
    }
    this.top.style.height = `${this.gapTop}px`;
    this.bottom.style.top = `${this.gapBottom}px`;
    this.bottom.style.height = `${CONFIG_RUNNER.PLAY_HEIGHT - this.gapBottom}px`;
    this.render();
  }

  get right() {
    return this.x + this.w;
  }

  get rects() {
    const inset = CONFIG_RUNNER.OBSTACLE_HITBOX_INSET;
    const x = this.x + inset;
    const w = this.w - 2 * inset;
    return [
      { x, y: 0, w, h: this.gapTop },
      { x, y: this.gapBottom, w, h: CONFIG_RUNNER.PLAY_HEIGHT - this.gapBottom },
    ];
  }

  move(dx) {
    this.x -= dx;
    this.render();
  }

  render() {
    const t = `translate3d(${this.x}px, 0, 0)`;
    this.top.style.transform = t;
    this.bottom.style.transform = t;
  }

  destroy() {
    this.top.remove();
    this.bottom.remove();
  }
}

// kind: 'star' (+puntos) | 'ufo' (gravedad lunar temporal)
class ItemRunner {
  constructor(layer, { kind, x, y }) {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.w = this.h = CONFIG_RUNNER.ITEM_SIZE;
    this.collected = false;
    this.el = runnerEl(`item item-${kind}`, layer);
    this.el.style.width = this.el.style.height = `${this.w}px`;
    runnerSprite(this.el, 'item-sprite');
    this.render();
  }

  get rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  move(dx) {
    this.x -= dx;
    this.render();
  }

  render() {
    this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }

  collect() {
    this.collected = true;
    this.el.classList.add('is-collected'); // animación de "pop" en CSS
    setTimeout(() => this.destroy(), 300);
  }

  destroy() {
    this.el.remove();
  }
}
