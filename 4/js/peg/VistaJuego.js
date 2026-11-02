
/**
 * VISTA - VistaJuego
 * Dibuja el modelo en el canvas. No modifica el modelo ni maneja eventos.
 */
class VistaJuego {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {JuegoModelo} modelo
   * @param {{fondo:string, fichas:string[]}} rutas Rutas de imágenes (fondo y un array con una imagen por tipo de ficha).
   */
  constructor(canvas, modelo, rutas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.modelo = modelo;
    this.rutas = rutas;
    this.imgFondo = null;
    this.imgFichas = [];
  }

  /** Carga todas las imágenes. Devuelve una promesa que se resuelve al terminar. */
  cargarImagenes() {
    const cargar = (src) =>
      new Promise((ok, error) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => error(new Error("No se pudo cargar " + src));
        img.src = src;
      });
    return Promise.all([cargar(this.rutas.fondo), ...this.rutas.fichas.map(cargar)]).then(
      ([fondo, ...fichas]) => {
        this.imgFondo = fondo;
        this.imgFichas = fichas;
      }
    );
  }

  /**
   * Dibuja un cuadro completo.
   * @param {Ficha|null} seleccionada Ficha que se está arrastrando.
   * @param {Array} hints Destinos válidos de la ficha seleccionada.
   * @param {number} tiempoMs Tiempo actual (ms) para las animaciones.
   */
  render(seleccionada, hints, tiempoMs) {
    const { ctx, canvas, modelo } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1) Imagen de fondo (tablero vacío)
    ctx.drawImage(this.imgFondo, 0, 0, canvas.width, canvas.height);

    // 2) Fichas activas (la arrastrada se dibuja al final para quedar arriba)
    for (const f of modelo.tablero.fichas) {
      if (f.activa && f !== seleccionada) this.dibujarFicha(f);
    }

    // 3) Hints animados sobre los destinos posibles
    if (seleccionada) {
      for (const h of hints) this.dibujarHint(h, tiempoMs);
      this.dibujarFicha(seleccionada, true);
    }

    // 4) Cartel de fin de partida
    if (!modelo.estaJugando()) this.dibujarFin();
  }

  /** Dibuja una ficha con la imagen de su tipo. Si se arrastra, se agranda y tiene sombra. */
  dibujarFicha(f, arrastrada = false) {
    const ctx = this.ctx;
    const r = arrastrada ? f.radio * 1.1 : f.radio;
    ctx.save();
    if (arrastrada) {
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 15;
    }
    ctx.drawImage(this.imgFichas[f.tipo], f.x - r, f.y - r, r * 2, r * 2);
    ctx.restore();
  }

  /**
   * Hint animado: un aro que pulsa y una flecha que rebota arriba del destino.
   */
  dibujarHint(h, tiempoMs) {
    const ctx = this.ctx;
    const { x, y } = this.modelo.tablero.celdaAPixeles(h.fila, h.col);
    const t = tiempoMs / 1000;
    const pulso = 0.5 + 0.5 * Math.sin(t * 5);   // 0..1
    const rebote = Math.sin(t * 6) * 8;          // desplazamiento vertical

    // Aro pulsante
    ctx.save();
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + 0.5 * pulso})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, this.modelo.tablero.tamCelda * (0.3 + 0.08 * pulso), 0, Math.PI * 2);
    ctx.stroke();

    // Flecha hacia abajo que rebota
    const ay = y - this.modelo.tablero.tamCelda * 0.55 + rebote;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.moveTo(x, ay + 16);
    ctx.lineTo(x - 12, ay - 4);
    ctx.lineTo(x + 12, ay - 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** Dibuja el cartel según cómo terminó la partida. */
  dibujarFin() {
    const { ctx, canvas, modelo } = this;
    const mensajes = {
      [ESTADO.GANADO]: "¡Ganaste!",
      [ESTADO.SIN_MOVIMIENTOS]: "Sin movimientos posibles",
      [ESTADO.TIEMPO_AGOTADO]: "¡Se acabó el tiempo!",
    };
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(mensajes[modelo.estado], canvas.width / 2, canvas.height / 2);
    ctx.font = "24px sans-serif";
    ctx.fillText("Fichas restantes: " + modelo.tablero.contarFichas(), canvas.width / 2, canvas.height / 2 + 45);
    ctx.restore();
  }

  /** Actualiza el timer y el contador de fichas en el HTML (mm:ss). */
  actualizarHUD(elTimer, elFichas) {
    const s = Math.ceil(this.modelo.tiempoRestante);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    elTimer.textContent = `${mm}:${ss}`;
    elFichas.textContent = this.modelo.tablero.contarFichas();
  }
}
