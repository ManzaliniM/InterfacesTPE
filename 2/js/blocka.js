const canvas= document.getElementById('blocka')
const ctx= canvas.getContext('2d');

function inicializarJuego(){

    let Xcentro= canvas.width/2;
    //cargamos el fondo
    ctx.fillStyle = '#2B2A2F';

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //cargamos el titulo
    ctx.font = "40px 'Press Start 2P', monospace";
    ctx.fillStyle = "#4B4DED"; 
    ctx.textAlign = "center";

    ctx.fillText("BLOCKA LUNAR", Xcentro, 150);

    ctx.font= "25px 'Nunito Sans', sans-serif";
    ctx.fillStyle= "#D4D4D4";
    ctx.textAlign= "center";
    ctx.fillText("¡Divertite armando puzzles!", Xcentro, 200);

    // boton de juegar
    ctx.fillStyle='#ED4B9E';
    ctx.beginPath();
    ctx.roundRect(Xcentro-(100/2),265, 100,40, 8);  //round rect para el border radius
    ctx.fill();

    ctx.fillStyle="#D4D4D4";
    ctx.fillText("Jugar", canvas.width/2, 295);
}

const anchoBoton = 100;
const altoBoton = 40;
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
        
        iniciarJuego(); 
    }
});

function iniciarJuego() {
    console.log('hola mundo');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle='#2B2A2F';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    elegirJuego();
    const img= new Image();
    img.src='assets/thumbnails/thumnail'+elegirJuego()+'.jpg';
    console.log(img.src);
    img.onload = () => {
    ctx.drawImage(img, 50, 50, 100, 100);
    };
}

let imgAnterior= -1;

function elegirJuego(){
    let cant= Math.floor(Math.random()*3);
    if(imgAnterior!= cant){
    return(cant);
    }
    elegirJuego();
}

inicializarJuego();

