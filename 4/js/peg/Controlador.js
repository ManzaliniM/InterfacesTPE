/**
 * CONTROLADOR - Controlador
 * Traduce los eventos del mouse en acciones sobre el modelo y
 * le pide a la vista que dibuje. También maneja el loop y el reinicio.
 */
class Controlador {
  /**
   * @param {JuegoModelo} modelo
   * @param {VistaJuego} vista
   * @param {{timer:HTMLElement, fichas:HTMLElement, reiniciar:HTMLElement}} elementosHTML
   */
  constructor(modelo, vista, elementosHTML) {
    this.modelo = modelo;
    this.vista = vista;
    this.html = elementosHTML;
    this.seleccionada = null; // ficha que se está arrastrando
    this.animacion = null;
    this.pausado = false;     // true mientras se muestra la pantalla de elegir estilo
    this.hints = [];          // destinos y rutas válidas de la ficha seleccionada
    this.offsetX = 0;         // distancia click -> centro de la ficha
    this.offsetY = 0;
    this.ultimoTiempo = performance.now();
    this.registrarEventos();
  }

  /**
   * Registra los listeners. mousemove y mouseup van en window para que el
   * arrastre no se corte si el mouse sale del canvas mientras se mueve la ficha.
   */
  registrarEventos() {
    this.vista.canvas.addEventListener("mousedown", (e) => this.alPresionar(e));
    window.addEventListener("mousemove", (e) => this.alMover(e));
    window.addEventListener("mouseup", () => this.alSoltar());
    this.html.reiniciar.addEventListener("click", () => this.reiniciar());
  }

  /** Convierte las coordenadas del mouse a coordenadas internas del canvas. */
  posicionMouse(e) {
    const r = this.vista.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (this.vista.canvas.width / r.width),
      y: (e.clientY - r.top) * (this.vista.canvas.height / r.height),
    };
  }

  /** Click: selecciona la ficha bajo el mouse (si tiene movimientos) y calcula sus hints. */
  alPresionar(e) {
    if (!this.modelo.estaJugando() || this.animacion) return;
    e.preventDefault(); // evita que el navegador seleccione texto o arrastre la imagen
    const { x, y } = this.posicionMouse(e);
    const ficha = this.modelo.tablero.fichas.find((f) => f.activa && f.contienePunto(x, y));
    if (!ficha) return;
    const rutas = this.modelo.rutasDe(ficha);
    if (rutas.length === 0) return; // ficha bloqueada: no se puede mover
    this.seleccionada = ficha;
    this.hints = rutas;
    ficha.arrastrando = true;
    this.offsetX = ficha.x - x;
    this.offsetY = ficha.y - y;
  }

  /** Arrastre: actualiza la posición (x, y) de la ficha seleccionada. */
  alMover(e) {
    if (!this.seleccionada) return;
    const { x, y } = this.posicionMouse(e);
    this.seleccionada.actualizarPosicion(x + this.offsetX, y + this.offsetY);
  }

  /**
   * Soltar: si la celda es un destino alcanzable, anima la ruta más corta;
   * si no, la ficha vuelve a su celda original.
   */
  alSoltar() {
    const f = this.seleccionada;
    if (!f) return;
    if (!this.modelo.estaJugando()) {
      f.arrastrando = false;
      this.modelo.tablero.ubicarFichaEnCelda(f, f.fila, f.col);
      this.seleccionada = null;
      this.hints = [];
      return;
    }

    const celda = this.modelo.tablero.pixelesACelda(f.x, f.y);
    const ruta = celda && this.hints.find(
      (opcion) => opcion.fila === celda.fila && opcion.col === celda.col,
    );
    f.arrastrando = false;
    if (ruta) {
      this.modelo.tablero.ubicarFichaEnCelda(f, f.fila, f.col);
      this.iniciarAnimacion(f, ruta.secuencia);
    } else {
      this.modelo.tablero.ubicarFichaEnCelda(f, f.fila, f.col);
    }
    this.seleccionada = null;
    this.hints = [];
  }

  /** Anima los saltos de la ruta en orden y aplica cada uno al terminar. */
  iniciarAnimacion(ficha, secuencia) {
    const movimiento = secuencia[0];
    const destino = this.modelo.tablero.celdaAPixeles(movimiento.fila, movimiento.col);
    this.animacion = {
      ficha,
      secuencia,
      indice: 0,
      inicio: performance.now(),
      desde: { x: ficha.x, y: ficha.y },
      hasta: destino,
    };
    ficha.arrastrando = true;
  }

  /** Actualiza la posición animada y confirma cada salto al llegar a su destino. */
  actualizarAnimacion(ahora) {
    if (!this.animacion) return;
    const duracion = 180;
    const progreso = Math.min((ahora - this.animacion.inicio) / duracion, 1);
    const { ficha, secuencia, indice, desde, hasta } = this.animacion;
    ficha.actualizarPosicion(
      desde.x + (hasta.x - desde.x) * progreso,
      desde.y + (hasta.y - desde.y) * progreso,
    );
    if (progreso < 1) return;

    this.modelo.tablero.ejecutarMovimiento(ficha, secuencia[indice]);
    if (indice + 1 === secuencia.length) {
      ficha.arrastrando = false;
      this.animacion = null;
      this.modelo.registrarMovimiento();
      this.modelo.verificarFin();
      return;
    }

    const siguiente = secuencia[indice + 1];
    this.animacion = {
      ficha,
      secuencia,
      indice: indice + 1,
      inicio: ahora,
      desde: { x: ficha.x, y: ficha.y },
      hasta: this.modelo.tablero.celdaAPixeles(siguiente.fila, siguiente.col),
    };
  }

  /** Reinicia la partida y limpia la selección. */
  reiniciar() {
    this.modelo.reiniciar();
    this.seleccionada = null;
    this.animacion = null;
    this.hints = [];
  }

  /** Cambia el estilo de las fichas (lo decide el modelo) y limpia la selección. */
  elegirEstilo(tipo) {
    this.modelo.elegirEstilo(tipo);
    this.seleccionada = null;
    this.animacion = null;
    this.hints = [];
  }

  /**
   * Loop principal: actualiza el timer, dibuja y vuelve a programarse.
   * Se reinicia la referencia de tiempo al arrancar (para no descontar el
   * tiempo de carga de imágenes) y se limita dt (para que el timer no
   * salte si el usuario cambia de pestaña).
   */
  iniciar() {
    this.ultimoTiempo = performance.now();
    const loop = (ahora) => {
      const dt = Math.min(Math.max((ahora - this.ultimoTiempo) / 1000, 0), 0.1);
      this.ultimoTiempo = ahora;
      const estabaAnimando = Boolean(this.animacion);
      this.actualizarAnimacion(ahora);
      if (!this.pausado && !estabaAnimando) this.modelo.actualizarTiempo(dt); // el timer se pausa al reproducir una ruta
      const fichaVisible = this.seleccionada || (this.animacion && this.animacion.ficha);
      this.vista.render(fichaVisible, this.seleccionada ? this.hints : [], ahora);
      this.vista.actualizarHUD(this.html.timer, this.html.fichas, this.html.movimientos);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}