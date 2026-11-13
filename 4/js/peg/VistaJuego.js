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

  /**
   * Carga todas las imágenes. Devuelve una promesa que se resuelve al terminar.
   * Si una imagen falla, se avisa por consola y se usa un dibujo de respaldo
   * (así el juego sigue funcionando aunque falte algún archivo).
   */
  cargarImagenes() {
    const cargar = (src) =>
      new Promise((ok) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => {
          console.warn("No se pudo cargar " + src);
          ok(null);
        };
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

    // 1) Imagen de fondo (tablero vacío), o dibujo de respaldo si no cargó
    if (this.imgFondo) {
      ctx.drawImage(this.imgFondo, 0, 0, canvas.width, canvas.height);
    } else {
      this.dibujarFondoRespaldo();
    }
    
    // DEBUG temporal: dibuja un aro magenta en el centro de cada celda válida. Borrar al terminar.
    if (window.PEG_DEBUG) {
      for (let f = 0; f < modelo.tablero.matriz.length; f++) {
        for (let c = 0; c < modelo.tablero.matriz[f].length; c++) {
          if (modelo.tablero.matriz[f][c] === INVALIDA) continue;
          const p = modelo.tablero.celdaAPixeles(f, c);
          ctx.strokeStyle = "magenta";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // 2) Fichas activas (la arrastrada se dibuja al final para quedar arriba)
    for (const f of modelo.tablero.fichas) {
      if (f.activa && f !== seleccionada) this.dibujarFicha(f);
    }

    // 3) Hints animados sobre los destinos posibles
    if (seleccionada) {
      for (const ruta of hints) this.dibujarCamino(ruta, seleccionada);
      for (const ruta of hints) this.dibujarHint(ruta, tiempoMs);
      this.dibujarFicha(seleccionada, true);
    }

    // 4) Cartel de fin de partida
    if (!modelo.estaJugando()) this.dibujarFin();
  }

  /**
   * Fondo de respaldo: una luna con un cráter por cada celda válida del tablero.
   * Solo se usa si la imagen de fondo no pudo cargarse.
   */
  dibujarFondoRespaldo() {
    const { ctx, canvas, modelo } = this;
    const t = modelo.tablero;
    ctx.save();
    // ctx.fillStyle = "#14162b";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#cfd3e0";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.49, 0, Math.PI * 2);
    ctx.fill();
    for (let f = 0; f < t.matriz.length; f++) {
      for (let c = 0; c < t.matriz[f].length; c++) {
        if (t.matriz[f][c] === INVALIDA) continue;
        const { x, y } = t.celdaAPixeles(f, c);
        ctx.fillStyle = "#8d93ab";
        ctx.strokeStyle = "#6b7089";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, t.tamCelda * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Dibuja una ficha con la imagen de su tipo (o un círculo de color si no hay imagen).
   * Si se arrastra, se agranda y tiene sombra.
   */
  dibujarFicha(f, arrastrada = false) {
    const ctx = this.ctx;
    const r = arrastrada ? f.radio * 1.1 : f.radio;
    const img = this.imgFichas[f.tipo];
    ctx.save();
    if (arrastrada) {
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 15;
    }
    if (img) {
      ctx.drawImage(img, f.x - r, f.y - r, r * 2, r * 2);
    } else {
      const colores = ["#ff4fa3", "#6c63ff", "#ffd700"];
      ctx.fillStyle = colores[f.tipo % colores.length];
      ctx.beginPath();
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Hint animado: un aro que pulsa y una flecha que rebota arriba del destino.
   */
  dibujarCamino(ruta, ficha) {
    const ctx = this.ctx;
    const origen = this.modelo.tablero.celdaAPixeles(ficha.fila, ficha.col);
    ctx.save();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.55)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(origen.x, origen.y);
    for (const movimiento of ruta.secuencia) {
      const destino = this.modelo.tablero.celdaAPixeles(movimiento.fila, movimiento.col);
      ctx.lineTo(destino.x, destino.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  dibujarHint(ruta, tiempoMs) {
    const ctx = this.ctx;
    const { x, y } = this.modelo.tablero.celdaAPixeles(ruta.fila, ruta.col);
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
    ctx.textAlign = "center";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(mensajes[modelo.estado], canvas.width / 2, canvas.height / 2);
    ctx.font = "22px sans-serif";
    ctx.fillText("Fichas restantes: " + modelo.tablero.contarFichas(), canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText("Pulsa «Reiniciar» para jugar de nuevo", canvas.width / 2, canvas.height / 2 + 75);
    ctx.restore();
  }

  /** Actualiza el timer y el contador de fichas en el HTML (mm:ss). */
  actualizarHUD(elTimer, elFichas, elMovimientos) {
    const s = Math.ceil(this.modelo.tiempoRestante);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    elTimer.textContent = `${mm}:${ss}`;
    elFichas.textContent = this.modelo.tablero.contarFichas();
    elMovimientos.textContent = this.modelo.movimientosRealizados;
  }
}