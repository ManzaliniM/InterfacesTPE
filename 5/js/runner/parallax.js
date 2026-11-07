// parallax.js — capas de fondo. Cada capa avanza a (velocidad del mundo × su factor).

class ParallaxRunner {
  constructor(stage) {
    this.layers = CONFIG_RUNNER.PARALLAX.map(({ id, factor }) => {
      const node = document.createElement('div');
      node.className = `parallax-layer layer-${id}`;
      stage.appendChild(node);
      return { node, factor, offset: 0 };
    });
  }

  update(dt, speed) {
    for (const l of this.layers) {
      l.offset += speed * l.factor * dt;
      l.node.style.backgroundPositionX = `${-l.offset}px`;
    }
  }

  reset() {
    for (const l of this.layers) {
      l.offset = 0;
      l.node.style.backgroundPositionX = '0px';
    }
  }
}
