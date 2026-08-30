import { useEffect, useMemo, useRef, useState } from 'react'
import {
  depuisGrob,
  redimensionner,
  remplirZone,
  tracerEllipse,
  tracerLigne,
  tracerRectangle,
  versGrob,
} from './grob'

const LARGEUR_MAX = 131
const HAUTEUR_MAX = 64
const CLE_COURANT = 'grob:courant'
const CLE_SPRITES = 'grob:sprites'

// Couleurs façon écran LCD de la HP48
const LCD_FOND = '#a9ba7c'
const LCD_ENCRE = '#20261c'
const LCD_GRILLE = 'rgba(32, 38, 28, 0.18)'

type Outil = 'crayon' | 'ligne' | 'rect' | 'cercle' | 'remplir'

const OUTILS: { id: Outil; libelle: string; titre: string }[] = [
  { id: 'crayon', libelle: '✏️', titre: 'Crayon' },
  { id: 'ligne', libelle: '╱', titre: 'Ligne' },
  { id: 'rect', libelle: '▭', titre: 'Rectangle' },
  { id: 'cercle', libelle: '◯', titre: 'Cercle' },
  { id: 'remplir', libelle: '🪣', titre: 'Remplir' },
]

type Sprite = { nom: string; grob: string }

function lireSprites(): Sprite[] {
  try {
    const brut = localStorage.getItem(CLE_SPRITES)
    if (!brut) return []
    const liste = JSON.parse(brut)
    if (!Array.isArray(liste)) return []
    return liste.filter(
      (s): s is Sprite => typeof s?.nom === 'string' && typeof s?.grob === 'string',
    )
  } catch {
    return []
  }
}

function etatInitial(): { largeur: number; hauteur: number; pixels: Uint8Array<ArrayBuffer> } {
  try {
    const brut = localStorage.getItem(CLE_COURANT)
    if (brut) {
      const decode = depuisGrob(brut)
      if (decode && decode.largeur <= LARGEUR_MAX && decode.hauteur <= HAUTEUR_MAX) return decode
    }
  } catch {
    // localStorage indisponible : on part sur la grille par défaut
  }
  return { largeur: 8, hauteur: 8, pixels: new Uint8Array(64) }
}

function GrobApp() {
  const [depart] = useState(etatInitial)
  const [largeur, setLargeur] = useState(depart.largeur)
  const [hauteur, setHauteur] = useState(depart.hauteur)
  const [champLargeur, setChampLargeur] = useState(String(depart.largeur))
  const [champHauteur, setChampHauteur] = useState(String(depart.hauteur))
  const [pixels, setPixels] = useState<Uint8Array<ArrayBuffer>>(depart.pixels)
  const [outil, setOutil] = useState<Outil>('crayon')
  const [cellule, setCellule] = useState(20)
  const [copie, setCopie] = useState(false)
  const [brouillon, setBrouillon] = useState<string | null>(null)
  const [erreurImport, setErreurImport] = useState('')
  const [sprites, setSprites] = useState<Sprite[]>(lireSprites)
  const [nomSprite, setNomSprite] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cadreRef = useRef<HTMLDivElement>(null)
  const traceRef = useRef<{ valeur: 0 | 1; depart: { x: number; y: number }; base: Uint8Array } | null>(null)

  const grob = useMemo(() => versGrob(largeur, hauteur, pixels), [largeur, hauteur, pixels])

  // Sauvegarde automatique du dessin courant
  useEffect(() => {
    try {
      localStorage.setItem(CLE_COURANT, grob)
    } catch {
      // stockage plein ou indisponible : tant pis pour l'auto-sauvegarde
    }
  }, [grob])

  const appliquerTaille = (champ: string, max: number, appliquer: (v: number) => void) => {
    const v = Number.parseInt(champ, 10)
    if (Number.isNaN(v)) return
    appliquer(Math.max(1, Math.min(max, v)))
  }

  const changerTaille = (nouvelleLargeur: number, nouvelleHauteur: number) => {
    setPixels((prev) => redimensionner(prev, largeur, hauteur, nouvelleLargeur, nouvelleHauteur))
    setLargeur(nouvelleLargeur)
    setHauteur(nouvelleHauteur)
    setChampLargeur(String(nouvelleLargeur))
    setChampHauteur(String(nouvelleHauteur))
  }

  const chargerGrob = (texte: string): boolean => {
    const decode = depuisGrob(texte)
    if (!decode) {
      setErreurImport('String invalide — attendu : GROB largeur hauteur hexadécimal.')
      return false
    }
    if (decode.largeur > LARGEUR_MAX || decode.hauteur > HAUTEUR_MAX) {
      setErreurImport(`Trop grand pour l'éditeur (max ${LARGEUR_MAX}×${HAUTEUR_MAX}).`)
      return false
    }
    setLargeur(decode.largeur)
    setHauteur(decode.hauteur)
    setChampLargeur(String(decode.largeur))
    setChampHauteur(String(decode.hauteur))
    setPixels(decode.pixels)
    setBrouillon(null)
    setErreurImport('')
    return true
  }

  // Taille de cellule adaptée à l'écran
  useEffect(() => {
    const cadre = cadreRef.current
    if (!cadre) return
    const calculer = () => {
      const dispo = cadre.clientWidth - 18
      setCellule(Math.max(5, Math.min(40, Math.floor(dispo / largeur))))
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

  const celluleDepuisEvenement = (
    e: React.PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / cellule)
    const y = Math.floor((e.clientY - rect.top) / cellule)
    if (x < 0 || x >= largeur || y < 0 || y >= hauteur) return null
    return { x, y }
  }

  const dessinerForme = (base: Uint8Array, arrivee: { x: number; y: number }): void => {
    const trace = traceRef.current
    if (!trace) return
    const suivant = new Uint8Array(base)
    const { depart: d, valeur } = trace
    if (outil === 'ligne') tracerLigne(suivant, largeur, hauteur, d.x, d.y, arrivee.x, arrivee.y, valeur)
    else if (outil === 'rect') tracerRectangle(suivant, largeur, hauteur, d.x, d.y, arrivee.x, arrivee.y, valeur)
    else if (outil === 'cercle') tracerEllipse(suivant, largeur, hauteur, d.x, d.y, arrivee.x, arrivee.y, valeur)
    setPixels(suivant as Uint8Array<ArrayBuffer>)
  }

  const surPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const c = celluleDepuisEvenement(e)
    if (c === null) return
    const index = c.y * largeur + c.x
    const valeur: 0 | 1 = pixels[index] ? 0 : 1
    e.currentTarget.setPointerCapture(e.pointerId)

    if (outil === 'remplir') {
      const suivant = new Uint8Array(pixels)
      remplirZone(suivant, largeur, hauteur, c.x, c.y, valeur)
      setPixels(suivant as Uint8Array<ArrayBuffer>)
      return
    }

    traceRef.current = { valeur, depart: c, base: pixels }
    if (outil === 'crayon') {
      const suivant = new Uint8Array(pixels)
      suivant[index] = valeur
      setPixels(suivant as Uint8Array<ArrayBuffer>)
    } else {
      dessinerForme(pixels, c)
    }
  }

  const surPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const trace = traceRef.current
    if (!trace) return
    const c = celluleDepuisEvenement(e)
    if (c === null) return
    if (outil === 'crayon') {
      const index = c.y * largeur + c.x
      setPixels((prev) => {
        if (prev[index] === trace.valeur) return prev
        const suivant = new Uint8Array(prev)
        suivant[index] = trace.valeur
        return suivant
      })
    } else {
      dessinerForme(trace.base, c)
    }
  }

  const finDuTrace = () => {
    traceRef.current = null
  }

  const transformer = (fct: (x: number, y: number) => number) => {
    setPixels((prev) => {
      const suivant = new Uint8Array(prev.length)
      for (let y = 0; y < hauteur; y++) {
        for (let x = 0; x < largeur; x++) suivant[y * largeur + x] = prev[fct(x, y)]
      }
      return suivant
    })
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

  const ecrireSprites = (liste: Sprite[]) => {
    setSprites(liste)
    try {
      localStorage.setItem(CLE_SPRITES, JSON.stringify(liste))
    } catch {
      // stockage indisponible
    }
  }

  const sauvegarderSprite = () => {
    const nom = nomSprite.trim() || `sprite ${sprites.length + 1}`
    ecrireSprites([...sprites.filter((s) => s.nom !== nom), { nom, grob }])
    setNomSprite('')
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
        <button type="button" title="Miroir horizontal" onClick={() => transformer((x, y) => y * largeur + (largeur - 1 - x))}>
          ↔
        </button>
        <button type="button" title="Miroir vertical" onClick={() => transformer((x, y) => (hauteur - 1 - y) * largeur + x)}>
          ↕
        </button>
      </section>

      <section className="outils" role="toolbar" aria-label="Outils de dessin">
        {OUTILS.map((o) => (
          <button
            key={o.id}
            type="button"
            title={o.titre}
            aria-label={o.titre}
            className={outil === o.id ? 'actif' : ''}
            onClick={() => setOutil(o.id)}
          >
            {o.libelle}
            <span className="outil-nom">{o.titre}</span>
          </button>
        ))}
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
          <div className="sortie-boutons">
            {brouillon !== null && (
              <button type="button" onClick={() => chargerGrob(brouillon)}>
                Importer
              </button>
            )}
            <button type="button" onClick={copier}>
              {copie ? 'Copié ✓' : 'Copier'}
            </button>
          </div>
        </div>
        <textarea
          rows={4}
          value={brouillon ?? grob}
          onChange={(e) => {
            setBrouillon(e.target.value)
            setErreurImport('')
          }}
          onFocus={(e) => e.target.select()}
          aria-label="String GROB (modifiable pour importer)"
        />
        {erreurImport && <p className="erreur">{erreurImport}</p>}
        <p className="note">
          Colle une string <code>GROB</code> ici puis touche « Importer » pour l'éditer. Format :
          lignes complétées à l'octet, bit de poids faible = pixel de gauche, quartets inversés.
        </p>
      </section>

      <section className="sprites">
        <h2>Sprites sauvegardés</h2>
        <div className="sprites-ajout">
          <input
            type="text"
            placeholder="nom du sprite"
            value={nomSprite}
            onChange={(e) => setNomSprite(e.target.value)}
            autoCapitalize="off"
          />
          <button type="button" onClick={sauvegarderSprite}>
            Sauvegarder
          </button>
        </div>
        {sprites.length === 0 && (
          <p className="note">Aucun sprite sauvegardé (stockés dans ce navigateur).</p>
        )}
        <ul className="sprites-liste">
          {sprites.map((s) => (
            <li key={s.nom}>
              <button type="button" className="sprite-charger" onClick={() => chargerGrob(s.grob)}>
                {s.nom}
              </button>
              <button
                type="button"
                className="sprite-supprimer"
                aria-label={`Supprimer ${s.nom}`}
                onClick={() => ecrireSprites(sprites.filter((x) => x.nom !== s.nom))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default GrobApp
