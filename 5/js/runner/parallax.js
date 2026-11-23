// parallax.js — capas de fondo. Cada capa avanza a (velocidad del mundo × su factor).

class ParallaxRunner {
  constructor(stage) {
    this.layers = CONFIG_RUNNER.PARALLAX.map(({ id, factor }) => {
      const node = document.createElement('div');
      node.className = `parallax-layer layer-${id}`;
      stage.appendChild(node);
      const earth = id === 'earth' ? document.createElement('div') : null;
      if (earth) {
        earth.className = 'earth-sprite';
        node.appendChild(earth);
      }
      const ufo = id === 'ufo' ? document.createElement('div') : null;
      if (ufo) {
        ufo.className = 'ufo-sprite';
        node.appendChild(ufo);
      }
      return { node, earth, ufo, factor, offset: 0 };
    });
  }

  update(dt, speed) {
    for (const l of this.layers) {
      l.offset += speed * l.factor * dt;
      if (l.earth) {
        l.offset %= CONFIG_RUNNER.EARTH_REPEAT_DISTANCE;
        l.earth.style.transform = `translate3d(${-l.offset}px, 0, 0)`;
      } else if (l.ufo) {
        l.offset %= CONFIG_RUNNER.UFO_REPEAT_DISTANCE;
        l.ufo.style.transform = `translate3d(${-l.offset}px, 0, 0)`;
      } else {
        l.node.style.backgroundPositionX = `${-l.offset}px`;
      }
    }
  }

  reset() {
    for (const l of this.layers) {
      l.offset = 0;
      if (l.earth) l.earth.style.transform = 'translate3d(0, 0, 0)';
      else if (l.ufo) l.ufo.style.transform = 'translate3d(0, 0, 0)';
      else l.node.style.backgroundPositionX = '0px';
    }
  }
}
