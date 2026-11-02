
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
  constructor({ tamCelda = 100, origenX = 50, origenY = 50, tiempoLimite = 300 } = {}) {
    this.tablero = new Tablero(tamCelda, origenX, origenY);
    this.tiempoLimite = tiempoLimite;
    this.reiniciar();
  }

  /** Reinicia la partida completa (tablero, estado y timer). */
  reiniciar() {
    this.tablero.reiniciar();
    this.estado = ESTADO.JUGANDO;
    this.tiempoRestante = this.tiempoLimite;
  }

  /** True mientras la partida sigue en curso. */
  estaJugando() {
    return this.estado === ESTADO.JUGANDO;
  }

  /** Destinos válidos para una ficha (usados por los hints). */
  destinosDe(ficha) {
    return this.tablero.movimientosDesde(ficha.fila, ficha.col);
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
    this.verificarFin();
    return true;
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
