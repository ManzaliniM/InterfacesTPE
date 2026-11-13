
/** Estados posibles de la partida. */
const ESTADO = {
  JUGANDO: "jugando",
  GANADO: "ganado",            // queda 1 sola ficha
  SIN_MOVIMIENTOS: "sin_movimientos",
  TIEMPO_AGOTADO: "tiempo_agotado",
};

/**
 * MODELO - JuegoModelo
 * Concentra la lógica del juego: tablero, estado de la partida y timer.
 * No sabe nada de canvas ni de mouse (eso es Vista/Controlador).
 */
class JuegoModelo {
  /**
   * @param {object} cfg Configuración: tamCelda, origenX, origenY, tiempoLimite (segundos).
   */
  constructor({ tamCelda = 100, origenX = 50, origenY = 50, tiempoLimite = 300, plantilla } = {}) {
    this.tablero = new Tablero(tamCelda, origenX, origenY, undefined, plantilla);
    this.tiempoLimite = tiempoLimite;
    this.reiniciar();
  }

  /** Reinicia la partida completa (tablero, estado y timer). */
  reiniciar() {
    this.tablero.reiniciar();
    this.estado = ESTADO.JUGANDO;
    this.tiempoRestante = this.tiempoLimite;
    this.movimientosRealizados = 0;
  }

  /** Elige el estilo (tipo) que usarán TODAS las fichas y reinicia la partida. */
  elegirEstilo(tipo) {
    this.tablero.estiloFicha = tipo;
    this.reiniciar();
  }

  /** True mientras la partida sigue en curso. */
  estaJugando() {
    return this.estado === ESTADO.JUGANDO;
  }

  /** Rutas más cortas desde una ficha hacia cada destino alcanzable. */
  rutasDe(ficha) {
    return this.tablero.rutasDesde(ficha.fila, ficha.col);
  }

  /** Destinos de un salto para validar y ejecutar movimientos individuales. */
  destinosDe(ficha) {
    const rutas = this.rutasDe(ficha);
    return rutas
      .map((ruta) => ruta.secuencia[0])
      .filter((movimiento, indice, movimientos) =>
        movimientos.findIndex((otro) => otro.fila === movimiento.fila && otro.col === movimiento.col) === indice,
      );
  }

  /**
   * Intenta mover una ficha a la celda (fila, col).
   * Solo se ejecuta si es un destino válido. Luego verifica fin de juego.
   * returns {boolean} true si el movimiento se realizó.
   */
  intentarMover(ficha, fila, col) {
    if (!this.estaJugando()) return false;
    const mov = this.destinosDe(ficha).find((d) => d.fila === fila && d.col === col);
    if (!mov) return false;
    this.tablero.ejecutarMovimiento(ficha, mov);
    this.movimientosRealizados++;
    this.verificarFin();
    return true;
  }

  /** Registra un movimiento completo, aunque incluya varios saltos. */
  registrarMovimiento() {
    this.movimientosRealizados++;
  }

  /**
   * Se llama después de cada movimiento: gana si queda 1 ficha,
   * pierde si no hay más movimientos posibles.
   */
  verificarFin() {
    if (this.tablero.contarFichas() === 1) {
      this.estado = ESTADO.GANADO;
    } else if (!this.tablero.hayMovimientosPosibles()) {
      this.estado = ESTADO.SIN_MOVIMIENTOS;
    }
  }

  /** Descuenta tiempo del timer. param {number} dt segundos transcurridos. */
  actualizarTiempo(dt) {
    if (!this.estaJugando()) return;
    this.tiempoRestante = Math.max(0, this.tiempoRestante - dt);
    if (this.tiempoRestante === 0) this.estado = ESTADO.TIEMPO_AGOTADO;
  }
}
