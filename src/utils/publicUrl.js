/**
 * Su GitHub Pages il sito non vive alla radice del dominio ma sotto
 * /Portfolio-2026/ (vedi "base" in vite.config.js). I percorsi assoluti
 * scritti a mano come "/models/Emy.glb" puntano invece alla radice del
 * dominio e falliscono (404) una volta pubblicati -> crash silenzioso
 * di React Three Fiber -> pagina bianca.
 *
 * import.meta.env.BASE_URL è il valore di "base" (con "/" finale),
 * corretto sia in locale ("/") sia in produzione ("/Portfolio-2026/").
 * Questo helper lo antepone in modo sicuro qualunque slash iniziale
 * venga passato.
 */
export function publicUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
