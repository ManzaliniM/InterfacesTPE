/**
 * MODELO - Ficha
 * Representa una pieza del juego. Guarda:
 *  - su posición lógica en la matriz (fila, col)
 *  - su posición en el plano del canvas (x, y), que se actualiza al arrastrar
 *  - su estado (activa / desactivada) y su tipo (para elegir la imagen)
 */
class Ficha {
  /**
   * @param {number} id    Identificador único de la ficha.
   * @param {number} fila  Fila inicial en la matriz.
   * @param {number} col   Columna inicial en la matriz.
   * @param {number} tipo  Tipo de ficha (0, 1, 2...) -> define qué imagen usa la vista.
   * @param {number} x     Posición X (centro) en el canvas.
   * @param {number} y     Posición Y (centro) en el canvas.
   * @param {number} radio Radio de la ficha en píxeles.
   */
  constructor(id, fila, col, tipo, x, y, radio) {
    this.id = id;
    this.fila = fila;
    this.col = col;
    this.tipo = tipo;
    this.x = x;
    this.y = y;
    this.radio = radio;
    this.activa = true;        // false cuando fue "comida" (sale del juego)
    this.arrastrando = false;  // true mientras el usuario la mueve con el mouse
  }

  /**
   * Actualiza la posición en el plano (x, y). Se llama en cada
   * movimiento del mouse mientras se arrastra la ficha.
   */
  actualizarPosicion(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Asigna una nueva celda lógica y ubica la ficha en el centro de esa celda.
   * Se usa al soltar la ficha en un destino válido o al volverla a su lugar.
   */
  asignarCelda(fila, col, x, y) {
    this.fila = fila;
    this.col = col;
    this.actualizarPosicion(x, y);
  }

  /** Desactiva la ficha (fue capturada). La vista deja de dibujarla. */
  desactivar() {
    this.activa = false;
    this.arrastrando = false;
  }

  /**
   * Indica si un punto (px, py) está dentro de la ficha.
   * Sirve para detectar el click del mouse sobre ella.
   */
  contienePunto(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radio * this.radio;
  }
}
