/* =========================================================
   API COMPARTIDA — Moon Arcade
   - Una sola llamada a MockAPI (o fallback al JSON local)
   - Cachea el resultado
   - Mergea con el JSON local para enriquecer datos
   - Normaliza: { id, titulo, categoria, imagenPortada, premium, raw }
   ========================================================= */

const MOON_API_URL = 'https://6aad4daea2413bf0ec1191a0.mockapi.io/juego';
const MOON_FALLBACK_URL = 'data/games.json';
const MOON_TIMEOUT_MS = 4000;

let moonCacheJuegos = null;
let moonCachePromesa = null;

/* ---------- Fetch con timeout ---------- */
async function moonFetchJson(url, timeoutMs = MOON_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

/* ---------- Normalización ---------- */
function moonNormalizarJuego(j) {
    return {
        id: j.id ?? j.titulo ?? j.nombre ?? '',
        titulo: j.titulo ?? j.nombre ?? 'Sin título',
        categoria: (j.categoria ?? '').toLowerCase(),
        imagenPortada: j.imagenPortada ?? j.img ?? '',
        premium: Boolean(j.premium),
        raw: j
    };
}

/* ---------- Slug para comparar títulos ----------
   "Moon Solitaire" → "moonsolitaire"
   "moon-solitaire" → "moonsolitaire"
   Así matcheamos aunque MockAPI use espacios y el JSON guiones.
------------------------------------ */

function moonSlug(str) {
    return (str || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // quita tildes
        .replace(/[^a-z0-9]/g, '');        // quita todo lo que no sea alfanumérico
}

/* ---------- Merge: enriquece los juegos de MockAPI con el JSON local ----------
   Para cada juego de MockAPI, si existe un juego en el JSON local con
   el mismo slug de título, fusionamos ambos objetos. Los campos del JSON
   pisan a los de MockAPI (porque el JSON tiene más información).
------------------------------------ */

function moonMergearConLocal(juegosApi, juegosLocal) {
    // Índice por slug del título
    const porSlug = new Map();
    juegosLocal.forEach(j => {
        const clave = moonSlug(j.titulo ?? j.nombre);
        if (clave) porSlug.set(clave, j);
    });

    return juegosApi.map(juegoApi => {
        const clave = moonSlug(juegoApi.titulo);
        const local = porSlug.get(clave);
        if (!local) return juegoApi;

        // Merge: el local enriquece al de MockAPI
        return {
            ...juegoApi,
            // Campos enriquecidos del JSON local
            id: local.id ?? juegoApi.id,
            categoria: (local.categoria ?? juegoApi.categoria).toLowerCase(),
            imagenPortada: juegoApi.imagenPortada || local.imagenPortada,
            // Guardamos el raw mergeado para que game.js acceda a galeria, etc.
            raw: {
                ...juegoApi.raw,
                ...local,                    // galeria, descripcion, comoJugar, tutorialUrl...
                premium: juegoApi.premium    // respetamos el premium de MockAPI
            }
        };
    });
}

/* ---------- Función pública ---------- */

function obtenerJuegosMoon() {
    if (moonCacheJuegos) return Promise.resolve(moonCacheJuegos);
    if (moonCachePromesa) return moonCachePromesa;

    moonCachePromesa = (async () => {
        let dataApi;
        let dataLocal;

        // Intentamos las dos fuentes en paralelo
        const [resApi, resLocal] = await Promise.allSettled([
            moonFetchJson(MOON_API_URL),
            moonFetchJson(MOON_FALLBACK_URL)
        ]);

        // MockAPI
        if (resApi.status === 'fulfilled' && Array.isArray(resApi.value) && resApi.value.length) {
            dataApi = resApi.value;
        } else {
            console.warn('MockAPI no disponible, usando solo JSON local');
            dataApi = null;
        }

        // JSON local
        if (resLocal.status === 'fulfilled' && Array.isArray(resLocal.value)) {
            dataLocal = resLocal.value;
        } else {
            dataLocal = [];
        }

        let resultado;

        if (dataApi) {
            // Normalizamos MockAPI
            const apiNorm = dataApi.map(moonNormalizarJuego);

            // Merge con el JSON local para enriquecer
            const apiMerged = moonMergearConLocal(apiNorm, dataLocal);

            // Agregamos los juegos que están SOLO en el JSON local
            // (ej: si MockAPI no tiene Moon Solitaire pero el JSON sí)
            const slugsApi = new Set(apiMerged.map(j => moonSlug(j.titulo)));
            const soloLocal = dataLocal
                .filter(j => !slugsApi.has(moonSlug(j.titulo ?? j.nombre)))
                .map(moonNormalizarJuego);

            resultado = [...apiMerged, ...soloLocal];
        } else {
            // Sin MockAPI: solo JSON local
            resultado = dataLocal.map(moonNormalizarJuego);
        }

        moonCacheJuegos = resultado;
        return moonCacheJuegos;
    })();

    return moonCachePromesa;
}

/* ---------- Helper: buscar juego por ID o slug ---------- */

async function obtenerJuegoPorId(idBuscado) {
    const todos = await obtenerJuegosMoon();
    const buscado = String(idBuscado).toLowerCase();

    return todos.find(j =>
        String(j.id).toLowerCase() === buscado ||
        moonSlug(j.titulo) === moonSlug(buscado)
    ) || null;
}