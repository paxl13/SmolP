// Encodage GROB (HP48G).
//
// Format ASCII : `GROB <largeur> <hauteur> <hex>`. Les pixels sont rangés
// ligne par ligne ; chaque ligne est complétée à un multiple de 8 pixels
// (un octet). Dans un octet, le bit 0 est le pixel le plus à gauche, et
// les deux chiffres hex sont écrits quartet de poids faible en premier
// (ordre mémoire de la Saturn, adressée par quartets).

const HEX = '0123456789ABCDEF'

export function versGrob(largeur: number, hauteur: number, pixels: Uint8Array): string {
  const octetsParLigne = Math.ceil(largeur / 8)
  let hex = ''
  for (let y = 0; y < hauteur; y++) {
    for (let o = 0; o < octetsParLigne; o++) {
      let octet = 0
      for (let bit = 0; bit < 8; bit++) {
        const x = o * 8 + bit
        if (x < largeur && pixels[y * largeur + x]) octet |= 1 << bit
      }
      hex += HEX[octet & 0xf] + HEX[octet >> 4]
    }
  }
  return `GROB ${largeur} ${hauteur} ${hex}`
}

// Redimensionne la grille en conservant les pixels qui restent visibles.
export function redimensionner(
  pixels: Uint8Array,
  ancienneLargeur: number,
  ancienneHauteur: number,
  largeur: number,
  hauteur: number,
): Uint8Array<ArrayBuffer> {
  const suivant = new Uint8Array(largeur * hauteur)
  const w = Math.min(ancienneLargeur, largeur)
  const h = Math.min(ancienneHauteur, hauteur)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      suivant[y * largeur + x] = pixels[y * ancienneLargeur + x]
    }
  }
  return suivant
}
