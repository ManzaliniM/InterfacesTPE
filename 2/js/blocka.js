const canvas= document.getElementById('blocka')
const ctx= canvas.getContext('2d');
const margenY=100;
const margenX=200;
const lado=400;
const filas=2;


function inicializarJuego(){

    let Xcentro= canvas.width/2;
    //cargamos el fondo
    ctx.fillStyle = '#2B2A2F';

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //cargamos el titulo
    ctx.font = "50px 'Press Start 2P', monospace";
    ctx.fillStyle = "#4B4DED"; 
    ctx.textAlign = "center";

    ctx.fillText("BLOCKA LUNAR", Xcentro, 220);

    ctx.font= "35px 'Nunito Sans', sans-serif";
    ctx.fillStyle= "#D4D4D4";
    ctx.textAlign= "center";
    ctx.fillText("¡Divertite armando puzzles!", Xcentro, 260);

    // boton de juegar
    ctx.fillStyle='#ED4B9E';
    ctx.beginPath();
    ctx.roundRect(Xcentro-(100/2),290, 110,60, 8);  //round rect para el border radius
    ctx.fill();

    ctx.fillStyle="#D4D4D4";
    ctx.fillText("Jugar", canvas.width/2, 330);
}

const anchoBoton = 110;
const altoBoton = 60;
const xBtn = (canvas.width / 2) - (anchoBoton / 2);
const yBtn = 265;

canvas.addEventListener('click', (event) => {
    // Obtenemos las medidas reales a las que se está mostrando el canvas en la pantalla
    const rect = canvas.getBoundingClientRect();
    
    // Calculamos dónde hizo clic el usuario respecto al tamaño real del canvas (por si se escaló por CSS)
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height; //esta cuenta nos devuelve el equivalente de pixeles que ultiliza la pantalla real

    const clickX = (event.clientX - rect.left) * escalaX;  //nos da la posicion exacta del click, sin importa el responsive
    const clickY = (event.clientY - rect.top) * escalaY;

    // Evaluamos si el clic está DENTRO de los límites del rectángulo del botón
    if (
        clickX >= xBtn &&
        clickX <= xBtn + anchoBoton &&
        clickY >= yBtn &&
        clickY <= yBtn + altoBoton
    ) {
        
        elegirFichas();
    }
});


const botonesFichas = [
    { x: 160, y: 260, ancho: 120, alto: 50, radio: 8, fichas: 4, texto: '4 fichas' },
    { x: 160 * 3, y: 260, ancho: 120, alto: 50, radio: 8, fichas: 6, texto: '6 fichas' },
    { x: 160 * 5, y: 260, ancho: 120, alto: 50, radio: 8, fichas: 8, texto: '8 fichas' }
];

function elegirFichas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo de la pantalla
    ctx.fillStyle = '#2B2A2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Títulos
    ctx.font = "35px 'Nunito Sans', sans-serif";
    ctx.fillStyle = '#D4D4D4';
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic"; // Restauramos por defecto para los títulos superiores
    ctx.fillText("Selecciona la cantidad de piezas", canvas.width / 2, 150);
    
    ctx.font = "30px 'Nunito Sans', sans-serif";
    ctx.fillText("¡Cuantas mas fichas, mas dificultad!", canvas.width / 2, 200);

    // Dibujar todos los botones de forma dinámica usando el arreglo
    botonesFichas.forEach(btn => {
        // Dibujar rectángulo
        ctx.fillStyle = '#383AB1';
        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y, btn.ancho, btn.alto, btn.radio);
        ctx.fill();
       
        // Dibujar texto perfectamente centrado usando la fórmula que vimos
        ctx.font = "25px 'Nunito Sans', sans-serif";
        ctx.fillStyle = "#D4D4D4";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(btn.texto, btn.x + (btn.ancho / 2), btn.y + (btn.alto / 2));
    });
}



// Escuchador de clics en el canvas (se pone una sola vez por fuera de la función)
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height; //esta cuenta nos devuelve el equivalente de pixeles que ultiliza la pantalla real

    const clickX = (event.clientX - rect.left) * escalaX;  //nos da la posicion exacta del click, sin importa el responsive
    const clickY = (event.clientY - rect.top) * escalaY;

    // Comprobamos si el clic cayó dentro de alguno de los botones
    botonesFichas.forEach(btn => {
        if (
            clickX >= btn.x &&
            clickX <= btn.x + btn.ancho &&
            clickY >= btn.y &&
            clickY <= btn.y + btn.alto
        ) {
            iniciarJuego(btn.fichas); // ¡Llama a la función pasando el parámetro!
        }
    });
});


let pxImg=400;


function iniciarJuego(cantFichas) {

    console.log(cantFichas);
    //limpiamos el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //le volvemos a poner el fondo
    ctx.fillStyle='#2B2A2F';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    //elegimos de manera aleatoria el thumbnail
    const img= new Image();
    img.src='assets/thumbnails/thumnail'+elegirJuego()+'.jpg'; //url dinamicaaa
    img.onload = () => {
        // 1. Primero se dibuja la imagen de fondo

       ctx.drawImage(img, margenX, margenY,(pxImg/2)*(cantFichas/2), pxImg);
       let alto= lado;
       let ancho= (pxImg/2)*(cantFichas/2);
       

        // 2. DESPUÉS se dibujan los trazos encima de la imagen
        ctx.strokeStyle = '#ED4B9E';
        ctx.lineWidth = 4;
        ctx.strokeRect(margenX, margenY, ancho, lado);

        // 3. Y la línea horizontal en el medio
        ctx.beginPath();
        ctx.moveTo(margenX, margenY + (lado / 2));          // Punto de inicio (izquierda)
        ctx.lineTo(margenX + ancho, margenY + (lado / 2));   // Punto final (derecha)
        ctx.stroke();

        let columnas = cantFichas / 2;

        for(let i=0; i<cantFichas/2;i++){
            ctx.beginPath();
            ctx.moveTo(margenX + ((ancho / columnas) * i), margenY);
            ctx.lineTo(margenX + ((ancho/ columnas) * i), margenY + lado);
            ctx.stroke();
        }


    };
    

}

let imgAnterior= -1;

function elegirJuego(){
    let cant= Math.floor(Math.random()*3);
    console.log(imgAnterior);
    if(imgAnterior!= cant){
        imgAnterior=cant;
        console.log(cant);
        return(imgAnterior);
    }
    elegirJuego();
}




inicializarJuego();

