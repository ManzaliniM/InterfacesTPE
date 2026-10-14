const canvas = document.getElementById('blocka');
const ctx = canvas.getContext('2d');
const margenY = 100;
let margenX = 200;          // se recalcula en prepararNivel() para centrar el tablero
const lado = 400;
const filas = 2;
const tamPieza = lado / filas; // cada pieza es un cuadrado de 200x200

// ---- ESTADO DEL JUEGO ----
// Usamos un único listener de click y decidimos qué hacer según la pantalla actual.
// Así evitamos que un click en el tablero "toque" botones de pantallas anteriores.
let estado = 'menu';        // 'menu' | 'seleccion' | 'cargando' | 'listo' | 'jugando' | 'ganado' | 'perdido' | 'error' | 'instrucciones'
let imagenActual = null;    // la imagen cargada del puzzle
let piezas = [];            // [{ fila, col, rotacion, filtro, original, filtrado }]
let columnas = 0;

let cantFichasElegida = 4;  // 4, 6 u 8 (lo elige el usuario)
let nivelActual = 0;        // índice dentro de NIVELES

// ---- AYUDITA E INSTRUCCIONES (estado) ----
const AYUDITAS_POR_NIVEL = 2;     // cuántas veces se puede pedir ayuda en cada nivel
const PENALIDAD_AYUDITA = 5000;   // ms que se suman al tiempo por cada ayudita
let ayudasRestantes = 0;
let estadoAnterior = 'menu';      // pantalla a la que se vuelve al cerrar las instrucciones
let inicioPausa = 0;              // momento en que se abrieron las instrucciones durante una partida

// ---- NIVELES ----
// Para agregar un nivel nuevo alcanza con sumar un objeto a este arreglo.
//  - modo 'global':   todas las piezas usan el filtro filtros[0]
//  - modo 'porPieza': cada pieza recibe un filtro distinto de la lista
//  - tiempoMax:       en milisegundos, o null si el nivel no tiene límite
const NIVELES = [
    { nombre: 'Nivel 1', filtros: ['gris'], modo: 'global', tiempoMax: null },
    { nombre: 'Nivel 2', filtros: ['negativo'], modo: 'global', tiempoMax: null },
    { nombre: 'Nivel 3', filtros: ['gris', 'brillo', 'negativo'], modo: 'porPieza', tiempoMax: 90000 }
];

// ---- FILTROS ----
// Cada filtro recibe el arreglo de píxeles [r, g, b, a, r, g, b, a, ...] y lo modifica.
// Se aplican UNA sola vez, al preparar el nivel (no en cada dibujado).
const FILTROS = {
    gris(d) {
        for (let i = 0; i < d.length; i += 4) {
            const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            d[i] = d[i + 1] = d[i + 2] = g;
        }
    },
    brillo(d) {
        // +30% de brillo. Uint8ClampedArray satura solo en 255, no hace falta controlar el máximo.
        for (let i = 0; i < d.length; i += 4) {
            d[i] *= 1.3;
            d[i + 1] *= 1.3;
            d[i + 2] *= 1.3;
        }
    },
    negativo(d) {
        for (let i = 0; i < d.length; i += 4) {
            d[i] = 255 - d[i];
            d[i + 1] = 255 - d[i + 1];
            d[i + 2] = 255 - d[i + 2];
        }
    }
};

function aplicarFiltro(canvasPieza, nombre) {
    const c = canvasPieza.getContext('2d');
    const datos = c.getImageData(0, 0, canvasPieza.width, canvasPieza.height);
    FILTROS[nombre](datos.data);
    c.putImageData(datos, 0, 0);
}

// ---- BOTÓN JUGAR ----
const anchoBoton = 110;
const altoBoton = 60;
const xBtn = (canvas.width / 2) - (anchoBoton / 2);
const yBtn = 290;

function inicializarJuego() {
    estado = 'menu';
    let Xcentro = canvas.width / 2;

    // fondo
    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // titulo
    ctx.font = "50px 'Press Start 2P', monospace";
    ctx.fillStyle = "#4B4DED";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("BLOCKA LUNAR", Xcentro, 220);

    ctx.font = "35px 'Nunito Sans', sans-serif";
    ctx.fillStyle = "#D4D4D4";
    ctx.fillText("¡Divertite armando puzzles!", Xcentro, 260);

    // boton jugar (usamos las mismas constantes que la detección de click)
    ctx.fillStyle = '#ED4B9E';
    ctx.beginPath();
    ctx.roundRect(xBtn, yBtn, anchoBoton, altoBoton, 8);
    ctx.fill();

    ctx.fillStyle = "#D4D4D4";
    ctx.textBaseline = "middle";
    ctx.fillText("Jugar", xBtn + anchoBoton / 2, yBtn + altoBoton / 2);
    
    dibujarBotonInstrucciones();
}

// ---- SELECCIÓN DE FICHAS ----
const botonesFichas = [
    { x: 160, y: 260, ancho: 120, alto: 50, radio: 8, fichas: 4, texto: '4 fichas' },
    { x: 160 * 3, y: 260, ancho: 120, alto: 50, radio: 8, fichas: 6, texto: '6 fichas' },
    { x: 160 * 5, y: 260, ancho: 120, alto: 50, radio: 8, fichas: 8, texto: '8 fichas' }
];

function elegirFichas() {
    estado = 'seleccion';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "35px 'Nunito Sans', sans-serif";
    ctx.fillStyle = '#D4D4D4';
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Selecciona la cantidad de piezas", canvas.width / 2, 150);

    ctx.font = "30px 'Nunito Sans', sans-serif";
    ctx.fillText("¡Cuantas mas fichas, mas dificultad!", canvas.width / 2, 200);

    botonesFichas.forEach(btn => {
        ctx.fillStyle = '#383AB1';
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y, btn.ancho, btn.alto, btn.radio);
        ctx.fill();

        ctx.font = "25px 'Nunito Sans', sans-serif";
        ctx.fillStyle = "#D4D4D4";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(btn.texto, btn.x + (btn.ancho / 2), btn.y + (btn.alto / 2));
    });

    dibujarBotonMenu();
    dibujarBotonInstrucciones();
}

// ---- UTILIDADES DE DIBUJO ----
// Dibuja un botón genérico a partir de un objeto { x, y, ancho, alto, texto }
function dibujarBoton(btn, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.ancho, btn.alto, 8);
    ctx.fill();

    ctx.font = "22px 'Nunito Sans', sans-serif";
    ctx.fillStyle = '#D4D4D4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // el texto puede tener varias líneas (separadas con \n)
    const lineas = btn.texto.split('\n');
    const interlineado = 26;
    lineas.forEach((linea, i) => {
        const desplazamiento = (i - (lineas.length - 1) / 2) * interlineado;
        ctx.fillText(linea, btn.x + btn.ancho / 2, btn.y + btn.alto / 2 + desplazamiento);
    });
}

function clickEnBoton(x, y, btn) {
    return x >= btn.x && x <= btn.x + btn.ancho &&
        y >= btn.y && y <= btn.y + btn.alto;
}

function formatear(ms) {
    return (ms / 1000).toFixed(1) + 's';
}

// ---- BOTONES EXTRA (instrucciones y Ayudita) ----
const btnInstrucciones = { x: canvas.width - 70, y: 20, ancho: 50, alto: 50, texto: '?' };
// La Ayudita va al costado del tablero (su x se ajusta en prepararNivel()): así no queda
// debajo de la barra de compartir de la página, que tapa la parte inferior del canvas.
const btnAyudita = { x: 8, y: margenY + lado / 2 - 35, ancho: 134, alto: 70, texto: 'Ayudita' };
const btnMenu = { x: 20, y: 20, ancho: 110, alto: 50, texto: '← Menú' };
const btnCerrarInstrucciones = { x: (canvas.width / 2) - 100, y: 510, ancho: 200, alto: 55, texto: 'Entendido' };

// pantallas desde las que se puede abrir el "?"
const ESTADOS_CON_INSTRUCCIONES = ['menu', 'seleccion', 'listo', 'jugando'];
// pantallas desde las que se puede volver al menú principal
const ESTADOS_CON_MENU = ['seleccion', 'listo', 'jugando'];

function dibujarBotonInstrucciones() {
    dibujarBoton(btnInstrucciones, '#383AB1');
}

function dibujarBotonMenu() {
    dibujarBoton(btnMenu, '#383AB1');
}

function dibujarBotonAyudita() {
    btnAyudita.texto = 'Ayudita (' + ayudasRestantes + ')\n+' + (PENALIDAD_AYUDITA / 1000) + 's';
    dibujarBoton(btnAyudita, ayudasRestantes > 0 ? '#ED4B9E' : '#555555');
}

// ---- JUEGO ----
function rotacionAleatoria() {
    const opciones = [90, 180, 270]; // nunca 0: ninguna pieza arranca bien puesta
    return opciones[Math.floor(Math.random() * opciones.length)];
}

// Se llama al elegir la cantidad de fichas: arranca la partida desde el nivel 1
function iniciarJuego(cantFichas) {
    cantFichasElegida = cantFichas;
    nivelActual = 0;
    prepararNivel();
}

// Recorta de la imagen el pedazo que le corresponde a una pieza.
// Se recorta del centro de la imagen con la proporción del tablero (columnas x filas),
// así la imagen no se deforma aunque cambie la cantidad de piezas.
function recortarPieza(img, fila, col) {
    const aspecto = columnas / filas;
    let cropAncho = img.width;
    let cropAlto = cropAncho / aspecto;
    if (cropAlto > img.height) {
        cropAlto = img.height;
        cropAncho = cropAlto * aspecto;
    }
    const cropX = (img.width - cropAncho) / 2;
    const cropY = (img.height - cropAlto) / 2;
    const srcAncho = cropAncho / columnas;
    const srcAlto = cropAlto / filas;

    const c = document.createElement('canvas');
    c.width = tamPieza;
    c.height = tamPieza;
    c.getContext('2d').drawImage(
        img,
        cropX + col * srcAncho, cropY + fila * srcAlto, srcAncho, srcAlto, // recorte (origen)
        0, 0, tamPieza, tamPieza                                            // destino
    );
    return c;
}

function copiarCanvas(origen) {
    const c = document.createElement('canvas');
    c.width = origen.width;
    c.height = origen.height;
    c.getContext('2d').drawImage(origen, 0, 0);
    return c;
}

// Carga la imagen y arma las piezas del nivel actual (acá se aplican los filtros)
function prepararNivel() {
    estado = 'cargando';
    imagenActual = null;
    columnas = cantFichasElegida / filas;
    margenX = (canvas.width - tamPieza * columnas) / 2; // centra el tablero en el canvas
    btnAyudita.x = Math.max(8, margenX - 150);           // la Ayudita queda pegada al tablero
    const nivel = NIVELES[nivelActual];

    const img = new Image();
    img.onload = () => {
        try {
            imagenActual = img;
            piezas = [];
            let i = 0;
            for (let fila = 0; fila < filas; fila++) {
                for (let col = 0; col < columnas; col++) {
                    const original = recortarPieza(img, fila, col);
                    const filtrado = copiarCanvas(original);
                    const nombreFiltro = (nivel.modo === 'global')
                        ? nivel.filtros[0]
                        : nivel.filtros[i % nivel.filtros.length];
                    aplicarFiltro(filtrado, nombreFiltro);

                    piezas.push({
                        fila: fila,
                        col: col,
                        rotacion: rotacionAleatoria(),
                        fija: false,          // true si la dejó fija la Ayudita
                        filtro: nombreFiltro,
                        original: original,   // sin filtro (se muestra al ganar)
                        filtrado: filtrado    // con filtro (se muestra mientras se juega)
                    });
                    i++;
                }
            }
            pantallaListo();
        } catch (e) {
            // típico: abrir el HTML con file:// hace que el navegador bloquee getImageData
            console.error(e);
            pantallaError('No se pudieron aplicar los filtros');
        }
    };
    img.onerror = () => {
        console.error('No se pudo cargar la imagen:', img.src);
        pantallaError('No se pudo cargar la imagen');
    };
    img.src = BANCO_IMAGENES[elegirJuego()];
}

// Pantalla de error visible (si no, el juego se queda "trabado" sin avisar)
function pantallaError(mensaje) {
    estado = 'error';
    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    mostrarCartel('ERROR', mensaje, [
        { texto: 'Menú principal', accion: inicializarJuego }
    ]);
}

// ---- PANTALLA PREVIA AL NIVEL ("Comenzar") ----
const btnComenzar = { x: (canvas.width / 2) - 90, y: 300, ancho: 180, alto: 60, texto: 'Comenzar' };

function pantallaListo() {
    estado = 'listo';
    const nivel = NIVELES[nivelActual];
    const cx = canvas.width / 2;

    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = "40px 'Press Start 2P', monospace";
    ctx.fillStyle = '#4B4DED';
    ctx.fillText(nivel.nombre, cx, 150);

    ctx.font = "25px 'Nunito Sans', sans-serif";
    ctx.fillStyle = '#D4D4D4';
    const textoFiltro = (nivel.modo === 'global')
        ? 'Filtro: ' + nivel.filtros[0]
        : 'Filtros mezclados: ' + nivel.filtros.join(', ');
    ctx.fillText(textoFiltro, cx, 210);
    if (nivel.tiempoMax) {
        ctx.fillText('Tiempo máximo: ' + (nivel.tiempoMax / 1000) + ' s', cx, 250);
    }

    dibujarBoton(btnComenzar, '#ED4B9E');
    dibujarBotonMenu();
    dibujarBotonInstrucciones();
}

// ---- TEMPORIZADOR ----
let tiempoInicio = 0;   // momento (performance.now) en que se apretó "Comenzar"
let tiempoFinal = 0;    // momento en que terminó el nivel (ganó o perdió)
let tiempoExtra = 0;    // penalidades en ms (acá se sumarían los +5000 de la "Ayudita")

function tiempoTranscurrido() {
    // mientras se juega corre con el reloj; cuando termina queda congelado en tiempoFinal
    const fin = (estado === 'jugando') ? performance.now() : tiempoFinal;
    return fin - tiempoInicio + tiempoExtra;
}

function comenzarNivel() {
    estado = 'jugando';
    tiempoInicio = performance.now();
    tiempoExtra = 0;
    ayudasRestantes = AYUDITAS_POR_NIVEL;
    bucle();
}

// Bucle de juego: redibuja el tablero y el cronómetro ~60 veces por segundo
function bucle() {
    if (estado !== 'jugando') return;

    const nivel = NIVELES[nivelActual];
    if (nivel.tiempoMax && tiempoTranscurrido() >= nivel.tiempoMax) {
        perder();
        return;
    }
    dibujarTablero();
    requestAnimationFrame(bucle);
}

// ---- VICTORIA / DERROTA ----
// El nivel se gana cuando TODAS las piezas tienen rotación 0
function estaResuelto() {
    return piezas.every(p => p.rotacion === 0);
}

let botonesCartel = []; // botones del cartel actual (ganado / perdido)

function ganar() {
    tiempoFinal = performance.now();   // congela el cronómetro
    estado = 'ganado';
    const tiempo = tiempoTranscurrido();

    // récord: mejor tiempo por nivel y por cantidad de fichas
    const clave = 'blocka_record_n' + (nivelActual + 1) + '_f' + cantFichasElegida;
    const guardado = localStorage.getItem(clave);
    const esRecord = (guardado === null || tiempo < Number(guardado));
    if (esRecord) localStorage.setItem(clave, tiempo);
    const mejor = esRecord ? tiempo : Number(guardado);

    dibujarTablero(); // ahora dibuja las piezas ORIGINALES (sin filtro)

    const subtitulo = esRecord
        ? '¡Nuevo récord! ' + formatear(tiempo)
        : 'Tiempo: ' + formatear(tiempo) + ' | Récord: ' + formatear(mejor);

    const hayOtroNivel = nivelActual < NIVELES.length - 1;
    mostrarCartel('¡GANASTE!', subtitulo, [
        { texto: 'Menú principal', accion: inicializarJuego },
        hayOtroNivel
            ? { texto: 'Siguiente nivel', accion: () => { nivelActual++; prepararNivel(); } }
            : { texto: 'Jugar de nuevo', accion: () => { nivelActual = 0; prepararNivel(); } }
    ]);
}

function perder() {
    tiempoFinal = performance.now();
    estado = 'perdido';
    dibujarTablero();
    mostrarCartel('¡TIEMPO!', 'No lograste armar la imagen a tiempo', [
        { texto: 'Menú principal', accion: inicializarJuego },
        { texto: 'Reintentar', accion: prepararNivel }
    ]);
}

// Cartel centrado sobre el tablero, con una fila de botones
function mostrarCartel(titulo, subtitulo, botones) {
    const cx = canvas.width / 2;
    const w = 500;
    const h = 190;
    const px = cx - w / 2;
    const py = margenY + lado / 2 - h / 2;

    ctx.fillStyle = 'rgba(43, 42, 47, 0.92)';
    ctx.beginPath();
    ctx.roundRect(px, py, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = '#ED4B9E';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = "28px 'Press Start 2P', monospace";
    ctx.fillStyle = '#4B4DED';
    ctx.fillText(titulo, cx, py + 50);

    ctx.font = "22px 'Nunito Sans', sans-serif";
    ctx.fillStyle = '#D4D4D4';
    ctx.fillText(subtitulo, cx, py + 90);

    const anchoBtn = 200;
    const altoBtn = 50;
    const sep = 20;
    const total = botones.length * anchoBtn + (botones.length - 1) * sep;
    botonesCartel = botones.map((b, i) => ({
        x: cx - total / 2 + i * (anchoBtn + sep),
        y: py + h - altoBtn - 20,
        ancho: anchoBtn,
        alto: altoBtn,
        texto: b.texto,
        accion: b.accion
    }));
    botonesCartel.forEach(b => dibujarBoton(b, '#383AB1'));
}

// ---- AYUDITA ----
// Deja una pieza mal puesta en su posición correcta y la fija. Suma tiempo al contador.
function usarAyudita() {
    if (ayudasRestantes <= 0) return;

    const candidatas = piezas.filter(p => !p.fija && p.rotacion !== 0);
    if (candidatas.length === 0) return;

    const pieza = candidatas[Math.floor(Math.random() * candidatas.length)];
    pieza.rotacion = 0;
    pieza.fija = true;
    ayudasRestantes--;
    tiempoExtra += PENALIDAD_AYUDITA;

    if (estaResuelto()) ganar();
}

// ---- INSTRUCCIONES ----
function dibujarInstrucciones() {
    const cx = canvas.width / 2;
    const lineas = [
        'Gira cada pieza hasta reconstruir la imagen completa.',
        'Clic izquierdo: la pieza gira hacia la izquierda.',
        'Clic derecho: la pieza gira hacia la derecha.',
        'El tiempo corre desde que pulsas «Comenzar».',
        'Ayudita: deja una pieza bien puesta y fija, pero suma ' + (PENALIDAD_AYUDITA / 1000) + ' segundos.',
        'Los niveles avanzados tienen tiempo máximo: si se agota, pierdes.',
        'Al terminar, los filtros se quitan y ves la foto original.'
    ];

    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = "32px 'Press Start 2P', monospace";
    ctx.fillStyle = '#4B4DED';
    ctx.fillText('CÓMO JUGAR', cx, 110);

    ctx.font = "24px 'Nunito Sans', sans-serif";
    ctx.fillStyle = '#D4D4D4';
    lineas.forEach((linea, i) => ctx.fillText(linea, cx, 180 + i * 42));

    dibujarBoton(btnCerrarInstrucciones, '#ED4B9E');
}

// Si se abre durante una partida, el cronómetro queda en pausa (el tablero queda tapado)
function abrirInstrucciones() {
    estadoAnterior = estado;
    if (estado === 'jugando') inicioPausa = performance.now();
    estado = 'instrucciones';
    dibujarInstrucciones();
}

function cerrarInstrucciones() {
    if (estadoAnterior === 'jugando') {
        reanudarPartida();
    } else if (estadoAnterior === 'seleccion') {
        elegirFichas();
    } else if (estadoAnterior === 'listo') {
        pantallaListo();
    } else {
        inicializarJuego();
    }
}

// Sale de la pausa y sigue la partida (el tiempo en pausa no cuenta)
function reanudarPartida() {
    tiempoInicio += performance.now() - inicioPausa;
    estado = 'jugando';
    bucle();
}

// Botón "← Menú". Durante una partida se pide confirmación (y el cronómetro queda en pausa)
// para no perder el progreso por un click accidental.
function pedirVolverAlMenu() {
    if (estado !== 'jugando') {
        inicializarJuego();
        return;
    }
    inicioPausa = performance.now();
    estado = 'confirmando';
    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    mostrarCartel('¿SALIR?', 'Perderás el progreso de este nivel', [
        { texto: 'Seguir jugando', accion: reanudarPartida },
        { texto: 'Salir al menú', accion: inicializarJuego }
    ]);
}

// La primera vez que se entra a jugar se muestran solas (después quedan en el botón "?")
function mostrarInstruccionesLaPrimeraVez() {
    try {
        if (localStorage.getItem('blocka_instrucciones_vistas')) return;
        localStorage.setItem('blocka_instrucciones_vistas', '1');
    } catch (e) {
        return;
    }
    abrirInstrucciones();
}

// ---- DIBUJO DEL TABLERO ----
function dibujarTablero() {
    const ancho = tamPieza * columnas;

    // fondo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // al ganar se muestra la imagen original (sin filtro); mientras tanto, la filtrada
    const mostrarOriginal = (estado === 'ganado');

    piezas.forEach(p => {
        const x = margenX + p.col * tamPieza;
        const y = margenY + p.fila * tamPieza;

        ctx.save();
        // movemos el origen al CENTRO de la pieza, para que rote sobre sí misma
        ctx.translate(x + tamPieza / 2, y + tamPieza / 2);
        ctx.rotate(p.rotacion * Math.PI / 180);
        ctx.drawImage(
            mostrarOriginal ? p.original : p.filtrado,
            -tamPieza / 2, -tamPieza / 2, tamPieza, tamPieza
        );
        ctx.restore(); // volvemos el contexto a como estaba (sin translate ni rotate)
    });

    // las piezas fijadas por la Ayudita se marcan con un borde dorado
    piezas.forEach(p => {
        if (!p.fija || mostrarOriginal) return;
        ctx.strokeStyle = '#FFD84D';
        ctx.lineWidth = 6;
        ctx.strokeRect(margenX + p.col * tamPieza + 3, margenY + p.fila * tamPieza + 3,
            tamPieza - 6, tamPieza - 6);
    });

    // cuadrícula encima
    ctx.strokeStyle = '#ED4B9E';
    ctx.lineWidth = 4;
    ctx.strokeRect(margenX, margenY, ancho, lado);

    for (let f = 1; f < filas; f++) {
        ctx.beginPath();
        ctx.moveTo(margenX, margenY + tamPieza * f);
        ctx.lineTo(margenX + ancho, margenY + tamPieza * f);
        ctx.stroke();
    }
    for (let c = 1; c < columnas; c++) {
        ctx.beginPath();
        ctx.moveTo(margenX + tamPieza * c, margenY);
        ctx.lineTo(margenX + tamPieza * c, margenY + lado);
        ctx.stroke();
    }

    dibujarHUD(ancho);

    if (estado === 'jugando') {
        dibujarBotonMenu();
        dibujarBotonInstrucciones();
        dibujarBotonAyudita();
    }
}

// Nombre del nivel (izquierda) y cronómetro (derecha) arriba del tablero
function dibujarHUD(anchoTablero) {
    const nivel = NIVELES[nivelActual];

    ctx.font = "25px 'Nunito Sans', sans-serif";
    ctx.fillStyle = '#D4D4D4';
    ctx.textBaseline = 'middle';

    ctx.textAlign = 'left';
    ctx.fillText(nivel.nombre, margenX, 50);

    let texto = 'Tiempo: ' + formatear(tiempoTranscurrido());
    if (nivel.tiempoMax) texto += ' / ' + formatear(nivel.tiempoMax);
    ctx.textAlign = 'right';
    ctx.fillText(texto, margenX + anchoTablero, 50);
}

// Devuelve el número de ficha clickeada (1, 2, 3...) o null si el click cayó fuera del tablero.
// Usa las MISMAS constantes globales que dibujarTablero(), así siempre coinciden.
function calcularFicha(clickX, clickY) {
    const cantFichas = filas * columnas;

    // las piezas son cuadradas: el ancho NO es lado/columnas, es igual al alto
    const anchoFicha = tamPieza;
    const altoFicha = tamPieza;

    for (let i = 1; i <= cantFichas; i++) {
        // en qué columna y fila está la ficha actual (restando 1 para que empiece en 0)
        let col = (i - 1) % columnas;
        let row = Math.floor((i - 1) / columnas);

        // los límites exactos de ESTA ficha
        let xInicio = margenX + (col * anchoFicha);
        let xFin = xInicio + anchoFicha;

        let yInicio = margenY + (row * altoFicha);
        let yFin = yInicio + altoFicha;

        if (
            clickX >= xInicio && clickX <= xFin &&
            clickY >= yInicio && clickY <= yFin
        ) {
            return i;
        }
    }
    return null; // el click no cayó en ninguna ficha
}

// ---- IMÁGENES ----
// Banco de imágenes: para sumar una, alcanza con agregar su ruta a esta lista
// (la consigna pide 6 o más). Las rutas deben coincidir EXACTAMENTE con los archivos.
const BANCO_IMAGENES = [
    'assets/thumbnails/thumbnail0.jpg',
    'assets/thumbnails/thumbnail1.jpg',
    'assets/thumbnails/thumbnail2.jpg',
    'assets/thumbnails/thumbnail3.jpg',
    'assets/thumbnails/thumbnail4.jpg',
    'assets/thumbnails/thumbnail5.jpg'
];
let imgAnterior = -1;

function elegirJuego() {
    let cant;
    do {
        cant = Math.floor(Math.random() * BANCO_IMAGENES.length);
    } while (cant === imgAnterior); // repetimos hasta que salga una distinta
    imgAnterior = cant;
    return cant;
}

// ---- CLICKS ----
// Un solo manejador para los dos botones del mouse.
// boton: 'izquierdo' | 'derecho'
// Convierte la posición del mouse (en pantalla) a coordenadas del canvas,
// teniendo en cuenta que el CSS puede escalar el canvas.
function posicionEnCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function manejarClick(event, boton) {
    const { x: clickX, y: clickY } = posicionEnCanvas(event);

    // botón "?": disponible en el menú, antes de cada nivel y durante la partida
    if (ESTADOS_CON_INSTRUCCIONES.includes(estado) && boton === 'izquierdo' &&
        clickEnBoton(clickX, clickY, btnInstrucciones)) {
        abrirInstrucciones();
        return;
    }

    // botón "← Menú": disponible al elegir fichas, antes de cada nivel y durante la partida
    if (ESTADOS_CON_MENU.includes(estado) && boton === 'izquierdo' &&
        clickEnBoton(clickX, clickY, btnMenu)) {
        pedirVolverAlMenu();
        return;
    }

    if (estado === 'menu') {
        if (clickX >= xBtn && clickX <= xBtn + anchoBoton &&
            clickY >= yBtn && clickY <= yBtn + altoBoton) {
            elegirFichas();
            mostrarInstruccionesLaPrimeraVez();
        }
    } else if (estado === 'seleccion') {
        botonesFichas.forEach(btn => {
            if (clickX >= btn.x && clickX <= btn.x + btn.ancho &&
                clickY >= btn.y && clickY <= btn.y + btn.alto) {
                iniciarJuego(btn.fichas);
            }
        });
    } else if (estado === 'listo') {
        if (clickEnBoton(clickX, clickY, btnComenzar)) {
            comenzarNivel();
        }
    } else if (estado === 'jugando' && imagenActual) {
        // botón "Ayudita"
        if (boton === 'izquierdo' && clickEnBoton(clickX, clickY, btnAyudita)) {
            usarAyudita();
            return;
        }

        let fichaActual = calcularFicha(clickX, clickY);
        if (fichaActual !== null) {
            // el arreglo empieza en 0 y tus fichas en 1, por eso el -1
            const pieza = piezas[fichaActual - 1];
            if (pieza.fija) return; // las piezas fijadas por la Ayudita no se pueden girar
            // click derecho gira a la derecha (+90), click izquierdo a la izquierda (-90)
            const giro = (boton === 'derecho') ? 90 : -90;
            pieza.rotacion = ((pieza.rotacion + giro) % 360 + 360) % 360; // siempre entre 0 y 270

            if (estaResuelto()) ganar();
            // si no, el bucle() la redibuja en el próximo frame
        }
    } else if (estado === 'ganado' || estado === 'perdido' || estado === 'error' || estado === 'confirmando') {
        const btn = botonesCartel.find(b => clickEnBoton(clickX, clickY, b));
        if (btn) btn.accion();
    } else if (estado === 'instrucciones') {
        if (clickEnBoton(clickX, clickY, btnCerrarInstrucciones)) cerrarInstrucciones();
    }
}

canvas.addEventListener('click', (event) => manejarClick(event, 'izquierdo'));

// El click derecho dispara 'contextmenu': hay que cancelar el menú del navegador
canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    manejarClick(event, 'derecho');
});

// ---- CURSOR ----
// El canvas no tiene hover como un botón HTML, así que lo simulamos:
// si el mouse está sobre algo clickeable en la pantalla actual, mostramos la manito.
function hayAlgoClickeableEn(x, y) {
    if (ESTADOS_CON_INSTRUCCIONES.includes(estado) && clickEnBoton(x, y, btnInstrucciones)) return true;
    if (ESTADOS_CON_MENU.includes(estado) && clickEnBoton(x, y, btnMenu)) return true;
    switch (estado) {
        case 'menu':
            return clickEnBoton(x, y, { x: xBtn, y: yBtn, ancho: anchoBoton, alto: altoBoton });
        case 'seleccion':
            return botonesFichas.some(b => clickEnBoton(x, y, b));
        case 'listo':
            return clickEnBoton(x, y, btnComenzar);
        case 'instrucciones':
            return clickEnBoton(x, y, btnCerrarInstrucciones);
        case 'jugando': {
            const ficha = calcularFicha(x, y);
            if (ficha !== null) return !piezas[ficha - 1].fija;
            return ayudasRestantes > 0 && clickEnBoton(x, y, btnAyudita);
        }
        case 'ganado':
        case 'perdido':
        case 'error':
        case 'confirmando':
            return botonesCartel.some(b => clickEnBoton(x, y, b));
        default:
            return false;
    }
}

canvas.addEventListener('mousemove', (event) => {
    const { x, y } = posicionEnCanvas(event);
    canvas.style.cursor = hayAlgoClickeableEn(x, y) ? 'pointer' : 'default';
});

// El canvas se dibuja una sola vez por pantalla: si las fuentes todavía no cargaron,
// el texto quedaría con la fuente de respaldo. Por eso esperamos a que estén listas.
Promise.all([
    document.fonts.load("50px 'Press Start 2P'"),
    document.fonts.load("25px 'Nunito Sans'")
]).catch(() => { }).then(inicializarJuego);