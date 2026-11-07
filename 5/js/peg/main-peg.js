/**
 * main-peg.js - Arranque de Moon Solitaire.
 * Se carga al final (después de Ficha, Tablero, JuegoModelo, VistaJuego y Controlador).
 * Crea el HUD (timer, fichas, reiniciar) y la pantalla de elección de ficha,
 * arma el MVC e inicia el loop.
 *
 * Está envuelto en una función autoejecutable (IIFE) para que sus variables
 * no queden como globales y no choquen con las del resto del sitio.
 */
(function () {
    // Canvas creado por game.js (el id "peg" viene de games.json).
    // Si no existe, estamos en una página que no es de este juego: no hacemos nada.
    const canvas = document.getElementById("peg");
    if (!canvas) return;

    // El tablero ocupa 7x7 celdas centradas en una grilla de 8x8: queda media celda de margen.
    // Así la imagen de fondo debe dividirse en 8x8 casillas y el tamaño se adapta al canvas.
    const TIEMPO_LIMITE = 300; // segundos (5 minutos)
    const tamCelda = canvas.width / 8; // lado de cada celda en píxeles
    const origen = tamCelda / 2;       // margen de media celda a izquierda y arriba

    // Rutas relativas a game.html. Cada imagen de ficha es una opción que se elige antes de jugar.
    const carpeta = "assets/juegos/moon-solitaire/";
    const rutas = {
        fondo: carpeta + "tablero.png",
        fichas: [carpeta + "ficha-0.png", carpeta + "ficha-1.png", carpeta + "ficha-2.png"],
    };

    // Envolvemos HUD + canvas en un contenedor propio para no depender del layout del padre.
    // replaceChild saca el canvas de su lugar original y pone el contenedor en su lugar.
    const juego = document.createElement("div");
    juego.className = "peg-juego";
    canvas.parentElement.replaceChild(juego, canvas);

    // HUD: barra superior con el tiempo restante, la cantidad de fichas y el botón de reinicio.
    // Los valores "--" se reemplazan en cada cuadro por VistaJuego.actualizarHUD().
    const hud = document.createElement("div");
    hud.className = "peg-hud";
    hud.innerHTML = `
    <span>Tiempo: <strong id="peg-timer">--:--</strong></span>
    <span>Fichas: <strong id="peg-fichas">--</strong></span>
    <button type="button" id="peg-reiniciar" class="peg-btn">Reiniciar</button>`;

    // Pantalla de elección de ficha: una opción (botón con la imagen) por cada ficha disponible.
    // No muestra nombres; el aria-label es solo para lectores de pantalla.
    // Ocupa el mismo lugar que el canvas y se alterna con él.
    const seleccion = document.createElement("div");
    seleccion.className = "peg-seleccion";
    seleccion.innerHTML = `
    <p>Elige tus fichas</p>
    <div class="peg-opciones">
        ${rutas.fichas.map((src, i) => `
        <button type="button" class="peg-opcion" data-tipo="${i}" aria-label="Ficha ${i + 1}">
            <img src="${src}" alt="">
        </button>`).join("")}
    </div>`;

    // Orden visual: HUD arriba; debajo, la pantalla de selección o el canvas (uno a la vez).
    juego.appendChild(hud);
    juego.appendChild(seleccion);
    juego.appendChild(canvas);

    // Modo demo: con "&demo" en la URL (game.html?id=moon-solitaire&demo) se juega con un tablero
    // de 3 fichas que se gana en 2 movimientos y con 30 segundos, para probar los finales rápido.
    const demo = new URLSearchParams(window.location.search).has("demo");

    // MODELO: toda la lógica del juego (tablero, fichas, reglas, timer, estado de la partida).
    // No sabe nada de canvas ni de mouse.
    const modelo = new JuegoModelo({
        tamCelda,
        origenX: origen,
        origenY: origen,
        tiempoLimite: demo ? 30 : TIEMPO_LIMITE,
        plantilla: demo ? PLANTILLA_DEMO : undefined,
    });

    // VISTA: dibuja el modelo en el canvas (fondo, fichas, hints animados y cartel final).
    const vista = new VistaJuego(canvas, modelo, rutas);

    // CONTROLADOR: traduce los eventos del mouse en acciones sobre el modelo,
    // le pide a la vista que dibuje y maneja el loop y el reinicio.
    const controlador = new Controlador(modelo, vista, {
        timer: document.getElementById("peg-timer"),
        fichas: document.getElementById("peg-fichas"),
        reiniciar: document.getElementById("peg-reiniciar"),
    });

    /** Muestra la pantalla de elegir ficha: oculta el canvas y pausa el timer. */
    function mostrarSeleccion() {
        controlador.pausado = true;
        canvas.style.display = "none";
        seleccion.hidden = false;
    }

    /** Aplica la ficha elegida (reinicia la partida) y vuelve al tablero. */
    function elegirFicha(tipo) {
        controlador.elegirEstilo(tipo);
        seleccion.hidden = true;
        canvas.style.display = "";
        controlador.pausado = false;
    }

    // Click en una opción (un solo listener para las tres, por delegación de eventos).
    seleccion.addEventListener("click", (e) => {
        const opcion = e.target.closest(".peg-opcion");
        if (opcion) elegirFicha(Number(opcion.dataset.tipo));
    });

    // Cada partida nueva empieza eligiendo ficha. El Controlador ya reinicia el modelo con este
    // mismo botón; acá, además, se muestra la pantalla de selección (la partida queda pausada
    // hasta elegir, y al elegir se reinicia de nuevo con la ficha nueva).
    document.getElementById("peg-reiniciar").addEventListener("click", mostrarSeleccion);

    // Al abrir el juego también se elige ficha primero. El loop arranca cuando las imágenes
    // terminaron de cargar, pero el timer queda pausado hasta que se elija una ficha.
    mostrarSeleccion();
    vista.cargarImagenes().then(() => controlador.iniciar());
})();