
/** Valores posibles de cada celda de la matriz. */
const INVALIDA = -1; // fuera del tablero (esquinas de la cruz)
const VACIA = 0;     // lugar válido sin ficha
const OCUPADA = 1;   // lugar válido con ficha

/** Plantilla inicial: tablero en cruz de 7x7 con el centro vacío. */
const PLANTILLA = [
  [-1, -1, 1, 1, 1, -1, -1],
  [-1, -1, 1, 1, 1, -1, -1],
  [ 1,  1, 1, 1, 1,  1,  1],
  [ 1,  1, 1, 0, 1,  1,  1],
  [ 1,  1, 1, 1, 1,  1,  1],
  [-1, -1, 1, 1, 1, -1, -1],
  [-1, -1, 1, 1, 1, -1, -1],
];

/** Direcciones de salto: [deltaFila, deltaCol]. Siempre de a 2 celdas. */
const SALTOS = [[-2, 0], [2, 0], [0, -2], [0, 2]];

/**
 * MODELO - Tablero
 * Guarda la matriz de estados y las fichas. Conoce la correspondencia
 * entre celdas (fila, col) y píxeles (x, y) del canvas.
 */
class Tablero {
  /**
   * @param {number} tamCelda Tamaño de cada celda en píxeles.
   * @param {number} origenX  X del borde izquierdo del tablero en el canvas.
   * @param {number} origenY  Y del borde superior del tablero en el canvas.
   * @param {number} tiposDeFicha Cantidad de tipos de ficha distintos.
   */
  constructor(tamCelda, origenX, origenY, tiposDeFicha = 3) {
    this.tamCelda = tamCelda;
    this.origenX = origenX;
    this.origenY = origenY;
    this.tiposDeFicha = tiposDeFicha;
    this.matriz = [];
    this.fichas = []; // todas las fichas (activas y desactivadas)
    this.reiniciar();
  }

  /** Vuelve el tablero al estado inicial: copia la plantilla y crea las fichas. */
  reiniciar() {
    this.matriz = PLANTILLA.map((fila) => [...fila]);
    this.fichas = [];
    this.grilla = PLANTILLA.map((fila) => fila.map(() => null)); // ficha por celda
    let id = 0;
    for (let f = 0; f < this.matriz.length; f++) {
      for (let c = 0; c < this.matriz[f].length; c++) {
        if (this.matriz[f][c] === OCUPADA) {
          const { x, y } = this.celdaAPixeles(f, c);
          const tipo = Math.floor(Math.random() * this.tiposDeFicha);
          const ficha = new Ficha(id++, f, c, tipo, x, y, this.tamCelda * 0.4);
          this.fichas.push(ficha);
          this.grilla[f][c] = ficha;
        }
      }
    }
  }

  /** Devuelve el centro en píxeles de una celda. */
  celdaAPixeles(fila, col) {
    return {
      x: this.origenX + col * this.tamCelda + this.tamCelda / 2,
      y: this.origenY + fila * this.tamCelda + this.tamCelda / 2,
    };
  }

  /** Devuelve la celda {fila, col} que contiene el punto (x, y), o null si cae afuera. */
  pixelesACelda(x, y) {
    const col = Math.floor((x - this.origenX) / this.tamCelda);
    const fila = Math.floor((y - this.origenY) / this.tamCelda);
    return this.enRango(fila, col) ? { fila, col } : null;
  }

  /** True si (fila, col) está dentro de los límites de la matriz. */
  enRango(fila, col) {
    return fila >= 0 && col >= 0 && fila < this.matriz.length && col < this.matriz[0].length;
  }

  /** True si la celda es válida (no es -1). */
  esValida(fila, col) {
    return this.enRango(fila, col) && this.matriz[fila][col] !== INVALIDA;
  }

  /** True si la celda es válida y tiene una ficha. */
  estaOcupada(fila, col) {
    return this.enRango(fila, col) && this.matriz[fila][col] === OCUPADA;
  }

  /** True si la celda es válida y está libre. */
  estaVacia(fila, col) {
    return this.enRango(fila, col) && this.matriz[fila][col] === VACIA;
  }

  /** Devuelve la ficha activa ubicada en una celda (o null). */
  fichaEn(fila, col) {
    return this.enRango(fila, col) ? this.grilla[fila][col] : null;
  }

  /**
   * Calcula los destinos válidos de una ficha: saltar sobre una vecina
   * ocupada hacia una celda vacía, en línea recta (sin diagonales).
   * @returns {{fila:number, col:number, medioFila:number, medioCol:number}[]}
   */
  movimientosDesde(fila, col) {
    const destinos = [];
    if (!this.estaOcupada(fila, col)) return destinos;
    for (const [destFila, destCol] of SALTOS) {
      const medioFila = fila + destFila / 2;
      const medioCol = col + destCol / 2;
      const df2 = fila + destFila;
      const dc2 = col + destCol;
      if (this.estaOcupada(medioFila, medioCol) && this.estaVacia(df2, dc2)) {
        destinos.push({ fila: df2, col: dc2, medioFila: mf, medioCol: mc });
      }
    }
    return destinos;
  }

  /** True si queda al menos un movimiento posible en todo el tablero. */
  hayMovimientosPosibles() {
    for (let f = 0; f < this.matriz.length; f++) {
      for (let c = 0; c < this.matriz[f].length; c++) {
        if (this.movimientosDesde(f, c).length > 0) return true;
      }
    }
    return false;
  }

  /**
   * Ejecuta un salto ya validado: mueve la ficha, quita la del medio
   * y actualiza la matriz y la grilla.
   * returns {Ficha} la ficha capturada.
   */
  ejecutarMovimiento(ficha, mov) {
    const capturada = this.grilla[mov.medioFila][mov.medioCol];

    // Actualizo la matriz
    this.matriz[ficha.fila][ficha.col] = VACIA;
    this.matriz[mov.medioFila][mov.medioCol] = VACIA;
    this.matriz[mov.fila][mov.col] = OCUPADA;

    // Actualizo la grilla de fichas
    this.grilla[ficha.fila][ficha.col] = null;
    this.grilla[mov.medioFila][mov.medioCol] = null;
    this.grilla[mov.fila][mov.col] = ficha;

    capturada.desactivar();
    this.ubicarFichaEnCelda(ficha, mov.fila, mov.col);
    return capturada;
  }

  /** Coloca la ficha en el centro de una celda (también sirve para "volverla" a su lugar). */
  ubicarFichaEnCelda(ficha, fila, col) {
    const { x, y } = this.celdaAPixeles(fila, col);
    ficha.asignarCelda(fila, col, x, y);
  }

  /** Cantidad de fichas que siguen en juego. */
  contarFichas() {
    return this.fichas.filter((f) => f.activa).length;
  }
}
