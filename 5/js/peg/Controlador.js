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
    this.pausado = false;     // true mientras se muestra la pantalla de elegir estilo
    this.hints = [];          // destinos válidos de la ficha seleccionada
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
    if (!this.modelo.estaJugando()) return;
    e.preventDefault(); // evita que el navegador seleccione texto o arrastre la imagen
    const { x, y } = this.posicionMouse(e);
    const ficha = this.modelo.tablero.fichas.find((f) => f.activa && f.contienePunto(x, y));
    if (!ficha) return;
    const destinos = this.modelo.destinosDe(ficha);
    if (destinos.length === 0) return; // ficha bloqueada: no se puede mover
    this.seleccionada = ficha;
    this.hints = destinos;
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
   * Soltar: si la celda bajo la ficha es un destino válido, se mueve;
   * si no, la ficha vuelve a su celda original.
   */
  alSoltar() {
    const f = this.seleccionada;
    if (!f) return;
    const celda = this.modelo.tablero.pixelesACelda(f.x, f.y);
    const movio = celda && this.modelo.intentarMover(f, celda.fila, celda.col);
    if (!movio) this.modelo.tablero.ubicarFichaEnCelda(f, f.fila, f.col);
    f.arrastrando = false;
    this.seleccionada = null;
    this.hints = [];
  }

  /** Reinicia la partida y limpia la selección. */
  reiniciar() {
    this.modelo.reiniciar();
    this.seleccionada = null;
    this.hints = [];
  }

  /** Cambia el estilo de las fichas (lo decide el modelo) y limpia la selección. */
  elegirEstilo(tipo) {
    this.modelo.elegirEstilo(tipo);
    this.seleccionada = null;
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
      if (!this.pausado) this.modelo.actualizarTiempo(dt); // el timer no corre mientras se elige el estilo
      this.vista.render(this.seleccionada, this.hints, ahora);
      this.vista.actualizarHUD(this.html.timer, this.html.fichas);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}