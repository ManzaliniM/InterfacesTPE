const canvas = document.getElementById('blocka');
const ctx = canvas.getContext('2d');
const margenY = 100;
const margenX = 200;
const lado = 400;
const filas = 2;
const tamPieza = lado / filas; // cada pieza es un cuadrado de 200x200

// ---- ESTADO DEL JUEGO ----
// Usamos un único listener de click y decidimos qué hacer según la pantalla actual.
// Así evitamos que un click en el tablero "toque" botones de pantallas anteriores.
let estado = 'menu';        // 'menu' | 'seleccion' | 'jugando'
let imagenActual = null;    // la imagen cargada del puzzle
let piezas = [];            // [{ fila, col, rotacion }]
let columnas = 0;

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
}

// ---- SELECCIÓN DE FICHAS ----
const botonesFichas = [
    { x: 160,     y: 260, ancho: 120, alto: 50, radio: 8, fichas: 4, texto: '4 fichas' },
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
}

// ---- JUEGO ----
function rotacionAleatoria() {
    const opciones = [90, 180, 270];
    return opciones[Math.floor(Math.random() * opciones.length)];
}

function iniciarJuego(cantFichas) {
    estado = 'jugando';
    columnas = cantFichas / filas;

    // armamos las piezas, cada una con una rotación inicial al azar
    piezas = [];
    for (let fila = 0; fila < filas; fila++) {
        for (let col = 0; col < columnas; col++) {
            piezas.push({ fila: fila, col: col, rotacion: rotacionAleatoria() });
        }
    }

    const img = new Image();
    img.src = 'assets/thumbnails/thumnail' + elegirJuego() + '.jpg';
    img.onload = () => {
        imagenActual = img;
        dibujarTablero();
    };
}

function dibujarTablero() {
    const ancho = tamPieza * columnas;

    // fondo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // tamaño de cada pieza DENTRO de la imagen original (en píxeles de la imagen)
    const srcAncho = imagenActual.width / columnas;
    const srcAlto = imagenActual.height / filas;

    piezas.forEach(p => {
        const x = margenX + p.col * tamPieza;
        const y = margenY + p.fila * tamPieza;

        ctx.save();
        // movemos el origen al CENTRO de la pieza, para que rote sobre sí misma
        ctx.translate(x + tamPieza / 2, y + tamPieza / 2);
        ctx.rotate(p.rotacion * Math.PI / 180);
        // recortamos solo el pedazo de imagen de esta pieza y lo dibujamos centrado
        ctx.drawImage(
            imagenActual,
            p.col * srcAncho, p.fila * srcAlto, srcAncho, srcAlto, // recorte (origen)
            -tamPieza / 2, -tamPieza / 2, tamPieza, tamPieza        // destino
        );
        ctx.restore(); // volvemos el contexto a como estaba (sin translate ni rotate)
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
let imgAnterior = -1;

function elegirJuego() {
    let cant;
    do {
        cant = Math.floor(Math.random() * 3);
    } while (cant === imgAnterior); // repetimos hasta que salga una distinta
    imgAnterior = cant;
    return cant;
}

// ---- CLICKS (un solo listener) ----
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * escalaX;
    const clickY = (event.clientY - rect.top) * escalaY;

    if (estado === 'menu') {
        if (clickX >= xBtn && clickX <= xBtn + anchoBoton &&
            clickY >= yBtn && clickY <= yBtn + altoBoton) {
            elegirFichas();
        }
    } else if (estado === 'seleccion') {
        botonesFichas.forEach(btn => {
            if (clickX >= btn.x && clickX <= btn.x + btn.ancho &&
                clickY >= btn.y && clickY <= btn.y + btn.alto) {
                iniciarJuego(btn.fichas);
            }
        });
    } else if (estado === 'jugando' && imagenActual) {
        let fichaActual = calcularFicha(clickX, clickY);
        if (fichaActual !== null) {
            // el arreglo empieza en 0 y tus fichas en 1, por eso el -1
            const pieza = piezas[fichaActual - 1];
            pieza.rotacion = (pieza.rotacion + 90) % 360; // giramos 90° a la derecha
            dibujarTablero();
        }
    }
});

inicializarJuego();
