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

// Décode une string « GROB largeur hauteur hex » (l'inverse de versGrob).
export function depuisGrob(
  texte: string,
): { largeur: number; hauteur: number; pixels: Uint8Array<ArrayBuffer> } | null {
  const m = texte.trim().match(/^GROB\s+(\d+)\s+(\d+)\s+([0-9A-Fa-f]+)$/i)
  if (!m) return null
  const largeur = Number(m[1])
  const hauteur = Number(m[2])
  const hex = m[3]
  if (largeur < 1 || hauteur < 1) return null
  const octetsParLigne = Math.ceil(largeur / 8)
  if (hex.length < octetsParLigne * 2 * hauteur) return null
  const pixels = new Uint8Array(largeur * hauteur)
  for (let y = 0; y < hauteur; y++) {
    for (let o = 0; o < octetsParLigne; o++) {
      const i = (y * octetsParLigne + o) * 2
      const octet = Number.parseInt(hex[i], 16) | (Number.parseInt(hex[i + 1], 16) << 4)
      for (let bit = 0; bit < 8; bit++) {
        const x = o * 8 + bit
        if (x < largeur && (octet >> bit) & 1) pixels[y * largeur + x] = 1
      }
    }
  }
  return { largeur, hauteur, pixels }
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

// ── Outils de dessin (mutent le tableau passé) ─────────────────────────

export function tracerLigne(
  pixels: Uint8Array,
  largeur: number,
  hauteur: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  valeur: 0 | 1,
): void {
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = x0
  let y = y0
  for (;;) {
    if (x >= 0 && x < largeur && y >= 0 && y < hauteur) pixels[y * largeur + x] = valeur
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
}

export function tracerRectangle(
  pixels: Uint8Array,
  largeur: number,
  hauteur: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  valeur: 0 | 1,
): void {
  tracerLigne(pixels, largeur, hauteur, x0, y0, x1, y0, valeur)
  tracerLigne(pixels, largeur, hauteur, x0, y1, x1, y1, valeur)
  tracerLigne(pixels, largeur, hauteur, x0, y0, x0, y1, valeur)
  tracerLigne(pixels, largeur, hauteur, x1, y0, x1, y1, valeur)
}

// Ellipse inscrite dans le rectangle défini par les deux coins.
export function tracerEllipse(
  pixels: Uint8Array,
  largeur: number,
  hauteur: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  valeur: 0 | 1,
): void {
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const rx = Math.abs(x1 - x0) / 2
  const ry = Math.abs(y1 - y0) / 2
  const pas = Math.max(16, Math.ceil((rx + ry) * 8))
  for (let i = 0; i <= pas; i++) {
    const t = (i / pas) * 2 * Math.PI
    const x = Math.round(cx + rx * Math.cos(t))
    const y = Math.round(cy + ry * Math.sin(t))
    if (x >= 0 && x < largeur && y >= 0 && y < hauteur) pixels[y * largeur + x] = valeur
  }
}

export function remplirZone(
  pixels: Uint8Array,
  largeur: number,
  hauteur: number,
  x: number,
  y: number,
  valeur: 0 | 1,
): void {
  const cible = pixels[y * largeur + x]
  if (cible === valeur) return
  const file: number[] = [y * largeur + x]
  while (file.length > 0) {
    const index = file.pop()!
    if (pixels[index] !== cible) continue
    pixels[index] = valeur
    const px = index % largeur
    if (px > 0) file.push(index - 1)
    if (px < largeur - 1) file.push(index + 1)
    if (index >= largeur) file.push(index - largeur)
    if (index < largeur * (hauteur - 1)) file.push(index + largeur)
  }
}
