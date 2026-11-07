// config.js — todas las constantes del juego en un solo lugar (aquí se ajusta la dificultad)
const CONFIG_RUNNER = {
  // Escenario (px lógicos; el contenedor se escala por CSS)
  WIDTH: 960,
  HEIGHT: 540,
  GROUND_HEIGHT: 90, // piso lunar (zona no jugable)

  // Jugador
  PLAYER: { x: 180, w: 64, h: 48, hitboxInset: 8 }, // hitbox = sprite menos este margen
  GRAVITY: 1800, // px/s²
  JUMP_VELOCITY: -560, // px/s (impulso hacia arriba)
  MAX_FALL_SPEED: 900,

  // Velocidad del mundo (el piso y los obstáculos se mueven a esta velocidad)
  SPEED_START: 220, // px/s
  SPEED_MAX: 420,
  SPEED_PER_OBSTACLE: 5, // +px/s por obstáculo superado

  // Obstáculos
  OBSTACLE_TYPES: ['laser', 'structure'],
  OBSTACLE_WIDTH: 56,
  OBSTACLE_HITBOX_INSET: 18, // los remates visuales sobresalen: el choque es más angosto
  GAP_START: 230, // hueco vertical inicial
  GAP_MIN: 140,
  GAP_SHRINK: 4, // px que se achica el hueco por cada obstáculo generado
  GAP_MARGIN: 30, // distancia mínima del hueco al borde superior y al piso
  SPACING_MIN: 260, // distancia horizontal entre obstáculos (borde a borde)
  SPACING_MAX: 460,
  CLIMB_RATE: 300, // px/s que el jugador puede subir (valor conservador, define qué cambios de altura son pasables)

  // Ítems
  ITEM_SIZE: 40,
  ITEM_CHANCE: 0.5, // probabilidad de ítem entre dos obstáculos
  ITEM_UFO_CHANCE: 0.3, // de los ítems, proporción de ovnis (el resto son estrellas)
  STAR_POINTS: 5,
  UFO_DURATION: 5, // s
  UFO_GRAVITY_FACTOR: 0.3, // gravedad lunar

  // Parallax: factor × velocidad del mundo (el piso es 1.0)
  PARALLAX: [
    { id: 'sky', factor: 0.04 },
    { id: 'stars', factor: 0.16 },
    { id: 'earth', factor: 0.4 },
    { id: 'ground', factor: 1.0 },
  ],

  STORAGE_KEY: 'moonRunner:highScore',
};

CONFIG_RUNNER.PLAY_HEIGHT = CONFIG_RUNNER.HEIGHT - CONFIG_RUNNER.GROUND_HEIGHT;
