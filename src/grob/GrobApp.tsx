import { useEffect, useMemo, useRef, useState } from 'react'
import { redimensionner, versGrob } from './grob'

const LARGEUR_MAX = 131
const HAUTEUR_MAX = 64

// Couleurs façon écran LCD de la HP48
const LCD_FOND = '#a9ba7c'
const LCD_ENCRE = '#20261c'
const LCD_GRILLE = 'rgba(32, 38, 28, 0.18)'

function GrobApp() {
  const [largeur, setLargeur] = useState(16)
  const [hauteur, setHauteur] = useState(16)
  const [champLargeur, setChampLargeur] = useState('16')
  const [champHauteur, setChampHauteur] = useState('16')
  const [pixels, setPixels] = useState(() => new Uint8Array(16 * 16))
  const [cellule, setCellule] = useState(20)
  const [copie, setCopie] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cadreRef = useRef<HTMLDivElement>(null)
  const traceRef = useRef<0 | 1 | null>(null)

  const grob = useMemo(() => versGrob(largeur, hauteur, pixels), [largeur, hauteur, pixels])

  const appliquerTaille = (champ: string, max: number, appliquer: (v: number) => void) => {
    const v = Number.parseInt(champ, 10)
    if (Number.isNaN(v)) return
    appliquer(Math.max(1, Math.min(max, v)))
  }

  // Redimensionne la grille quand largeur/hauteur changent
  const changerTaille = (nouvelleLargeur: number, nouvelleHauteur: number) => {
    setPixels((prev) => redimensionner(prev, largeur, hauteur, nouvelleLargeur, nouvelleHauteur))
    setLargeur(nouvelleLargeur)
    setHauteur(nouvelleHauteur)
    setChampLargeur(String(nouvelleLargeur))
    setChampHauteur(String(nouvelleHauteur))
  }

  // Taille de cellule adaptée à l'écran
  useEffect(() => {
    const cadre = cadreRef.current
    if (!cadre) return
    const calculer = () => {
      const dispo = cadre.clientWidth - 2
      setCellule(Math.max(5, Math.min(26, Math.floor(dispo / largeur))))
    }
    calculer()
    const observateur = new ResizeObserver(calculer)
    observateur.observe(cadre)
    return () => observateur.disconnect()
  }, [largeur])

  // Rendu du canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = largeur * cellule + 1
    const h = hauteur * cellule + 1
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    ctx.fillStyle = LCD_FOND
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = LCD_ENCRE
    for (let y = 0; y < hauteur; y++) {
      for (let x = 0; x < largeur; x++) {
        if (pixels[y * largeur + x]) {
          ctx.fillRect(x * cellule + 1, y * cellule + 1, cellule - 1, cellule - 1)
        }
      }
    }

    ctx.strokeStyle = LCD_GRILLE
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= largeur; x++) {
      ctx.moveTo(x * cellule + 0.5, 0)
      ctx.lineTo(x * cellule + 0.5, h)
    }
    for (let y = 0; y <= hauteur; y++) {
      ctx.moveTo(0, y * cellule + 0.5)
      ctx.lineTo(w, y * cellule + 0.5)
    }
    ctx.stroke()
  }, [pixels, largeur, hauteur, cellule])

  const indexDepuisEvenement = (e: React.PointerEvent<HTMLCanvasElement>): number | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / cellule)
    const y = Math.floor((e.clientY - rect.top) / cellule)
    if (x < 0 || x >= largeur || y < 0 || y >= hauteur) return null
    return y * largeur + x
  }

  const peindre = (index: number, valeur: 0 | 1) => {
    setPixels((prev) => {
      if (prev[index] === valeur) return prev
      const suivant = new Uint8Array(prev)
      suivant[index] = valeur
      return suivant
    })
  }

  const surPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const index = indexDepuisEvenement(e)
    if (index === null) return
    const valeur: 0 | 1 = pixels[index] ? 0 : 1
    traceRef.current = valeur
    e.currentTarget.setPointerCapture(e.pointerId)
    peindre(index, valeur)
  }

  const surPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const valeur = traceRef.current
    if (valeur === null) return
    const index = indexDepuisEvenement(e)
    if (index !== null) peindre(index, valeur)
  }

  const finDuTrace = () => {
    traceRef.current = null
  }

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(grob)
      setCopie(true)
      setTimeout(() => setCopie(false), 1500)
    } catch {
      // Pas de presse-papier : la string reste sélectionnable dans la zone de texte
    }
  }

  return (
    <main className="grob">
      <header>
        <a href={import.meta.env.BASE_URL}>← SmolP</a>
        <h1>Éditeur GROB</h1>
        <p className="tagline">Dessine ton sprite, récupère la string pour ta HP48G.</p>
      </header>

      <section className="controles">
        <label>
          Largeur
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={LARGEUR_MAX}
            value={champLargeur}
            onChange={(e) => {
              setChampLargeur(e.target.value)
              appliquerTaille(e.target.value, LARGEUR_MAX, (v) => changerTaille(v, hauteur))
            }}
            onBlur={() => setChampLargeur(String(largeur))}
          />
        </label>
        <label>
          Hauteur
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={HAUTEUR_MAX}
            value={champHauteur}
            onChange={(e) => {
              setChampHauteur(e.target.value)
              appliquerTaille(e.target.value, HAUTEUR_MAX, (v) => changerTaille(largeur, v))
            }}
            onBlur={() => setChampHauteur(String(hauteur))}
          />
        </label>
        <button type="button" onClick={() => setPixels(new Uint8Array(largeur * hauteur))}>
          Effacer
        </button>
        <button
          type="button"
          onClick={() =>
            setPixels((prev) => {
              const suivant = new Uint8Array(prev.length)
              for (let i = 0; i < prev.length; i++) suivant[i] = prev[i] ? 0 : 1
              return suivant
            })
          }
        >
          Inverser
        </button>
      </section>

      <div className="cadre" ref={cadreRef}>
        <canvas
          ref={canvasRef}
          onPointerDown={surPointerDown}
          onPointerMove={surPointerMove}
          onPointerUp={finDuTrace}
          onPointerCancel={finDuTrace}
        />
      </div>

      <section className="sortie">
        <div className="sortie-entete">
          <h2>String GROB</h2>
          <button type="button" onClick={copier}>
            {copie ? 'Copié ✓' : 'Copier'}
          </button>
        </div>
        <textarea
          readOnly
          rows={4}
          value={grob}
          onFocus={(e) => e.target.select()}
          aria-label="String GROB générée"
        />
        <p className="note">
          Format : <code>GROB largeur hauteur données</code> — lignes complétées à l'octet, bit de
          poids faible = pixel de gauche, quartets inversés dans chaque octet.
        </p>
      </section>
    </main>
  )
}

export default GrobApp
