// comentarios.js — interactividad de like/dislike + animación de partículas al likear
// Solo para la versión hardcodeada; no depende de game.js ni de games.json

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".comentario-acciones").forEach((acciones) => {
        const like = acciones.querySelector(".btn-like");
        const dislike = acciones.querySelector(".btn-dislike");
        if (!like || !dislike) return;

        like.addEventListener("click", () => toggle(like, dislike, true));
        dislike.addEventListener("click", () => toggle(dislike, like, false));
    });
});

function toggle(boton, opuesto, esLike) {
    const estabaActivo = boton.getAttribute("aria-pressed") === "true";
    setEstado(boton, !estabaActivo);
    if (!estabaActivo) {
        setEstado(opuesto, false); // no pueden estar ambos activos
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