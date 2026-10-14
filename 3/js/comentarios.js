// comentarios.js — interactividad de like/dislike + envío de comentarios nuevos
// Solo para la versión hardcodeada; no depende de game.js ni de games.json

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".comentario-acciones").forEach(wireAcciones);

    const form = document.getElementById("form-comentario");
    const input = document.getElementById("nuevo-comentario");
    const lista = document.getElementById("lista-comentarios");
    const heading = document.getElementById("comentarios-heading");

    if (!form || !input || !lista) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // clave: frena el submit por GET

        const texto = input.value.trim();
        if (!texto) return;

        const li = crearComentario(texto);
        lista.prepend(li); // el nuevo comentario arriba de todo
        wireAcciones(li.querySelector(".comentario-acciones"));

        input.value = "";
        actualizarContador(lista, heading);
    });
});

function crearComentario(texto) {
    const li = document.createElement("li");
    li.className = "comentario";
    li.innerHTML = `
        <img class="comentario-avatar" src="assets/icons/Usuario.svg" alt="">
        <div class="comentario-cuerpo">
            <p class="comentario-usuario">Vos</p>
            <p class="comentario-texto"></p>
            <div class="comentario-acciones">
                <button type="button" class="btn-like" aria-label="Me gusta" aria-pressed="false"
                    data-icon="assets/icons/like.svg" data-icon-active="assets/icons/like-click.svg">
                    <img src="assets/icons/like.svg" alt="">
                </button>
                <button type="button" class="btn-dislike" aria-label="No me gusta" aria-pressed="false"
                    data-icon="assets/icons/dislike.svg" data-icon-active="assets/icons/dislike-click.svg">
                    <img src="assets/icons/dislike.svg" alt="">
                </button>
                <button type="button">Responder</button>
            </div>
        </div>`;
    li.querySelector(".comentario-texto").textContent = texto;
    return li;
}

function actualizarContador(lista, heading) {
    if (!heading) return;
    const cantidad = lista.querySelectorAll(".comentario").length;
    heading.textContent = `Comentarios (${cantidad})`;
}

function wireAcciones(acciones) {
    if (!acciones || acciones.dataset.wired) return;
    acciones.dataset.wired = "true"; // evita enganchar el mismo listener dos veces

    const like = acciones.querySelector(".btn-like");
    const dislike = acciones.querySelector(".btn-dislike");
    if (!like || !dislike) return;

    like.addEventListener("click", () => toggle(like, dislike, true));
    dislike.addEventListener("click", () => toggle(dislike, like, false));
}

function toggle(boton, opuesto, esLike) {
    const estabaActivo = boton.getAttribute("aria-pressed") === "true";
    setEstado(boton, !estabaActivo);
    if (!estabaActivo) {
        setEstado(opuesto, false);
        if (esLike) animarLike(boton);
    }
}

function setEstado(boton, activo) {
    boton.setAttribute("aria-pressed", String(activo));
    boton.querySelector("img").src = activo
        ? boton.dataset.iconActive
        : boton.dataset.icon;
}

function animarLike(boton) {
    const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sinAnimacion) return;

    boton.classList.add("animar");
    boton.addEventListener("animationend", () => boton.classList.remove("animar"), { once: true });

    const cantidadParticulas = 6;
    for (let i = 0; i < cantidadParticulas; i++) {
        const particula = document.createElement("span");
        particula.className = "spark";
        particula.style.setProperty("--angle", `${(360 / cantidadParticulas) * i}deg`);
        boton.appendChild(particula);
        particula.addEventListener("animationend", () => particula.remove(), { once: true });
    }
}