import { useMemo, useState } from 'react'
import { COMMANDES, SUJETS, type Commande } from './commandes'

type Vue = 'alpha' | 'sujets'

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function lettreDe(nom: string): string {
  const premiere = nom[0].toUpperCase()
  return /[A-Z]/.test(premiere) ? premiere : '#'
}

function Fiche({ commande }: { commande: Commande }) {
  return (
    <article className="fiche">
      <div className="fiche-titre">
        <code className="nom">{commande.nom}</code>
        {commande.pile && <code className="pile">{commande.pile}</code>}
      </div>
      <p>{commande.description}</p>
    </article>
  )
}

function DicoApp() {
  const [vue, setVue] = useState<Vue>('sujets')
  const [recherche, setRecherche] = useState('')

  const filtrees = useMemo(() => {
    const req = normaliser(recherche.trim())
    if (!req) return COMMANDES
    return COMMANDES.filter(
      (c) => normaliser(c.nom).includes(req) || normaliser(c.description).includes(req),
    )
  }, [recherche])

  const groupes = useMemo(() => {
    if (vue === 'sujets') {
      return SUJETS.map((sujet) => ({
        titre: sujet,
        commandes: filtrees.filter((c) => c.sujet === sujet),
      })).filter((g) => g.commandes.length > 0)
    }
    const tri = [...filtrees].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    const parLettre = new Map<string, Commande[]>()
    for (const c of tri) {
      const lettre = lettreDe(c.nom)
      const groupe = parLettre.get(lettre)
      if (groupe) groupe.push(c)
      else parLettre.set(lettre, [c])
    }
    return [...parLettre.entries()].map(([titre, commandes]) => ({ titre, commandes }))
  }, [vue, filtrees])

  return (
    <main className="dico">
      <header>
        <a href={import.meta.env.BASE_URL}>← SmolP</a>
        <h1>Dico HP48G</h1>
        <p className="tagline">
          {COMMANDES.length} commandes — par sujet ou en ordre alphabétique.
        </p>
      </header>

      <div className="barre">
        <input
          type="search"
          placeholder="Chercher une commande…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Recherche"
        />
        <div className="bascule" role="tablist" aria-label="Mode d’affichage">
          <button
            type="button"
            role="tab"
            aria-selected={vue === 'sujets'}
            className={vue === 'sujets' ? 'actif' : ''}
            onClick={() => setVue('sujets')}
          >
            Sujets
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={vue === 'alpha'}
            className={vue === 'alpha' ? 'actif' : ''}
            onClick={() => setVue('alpha')}
          >
            A→Z
          </button>
        </div>
      </div>

      {groupes.length === 0 && <p className="vide">Rien trouvé pour « {recherche} ».</p>}

      {groupes.map((groupe) => (
        <section key={groupe.titre} className="groupe">
          <h2>
            {groupe.titre} <span className="compte">{groupe.commandes.length}</span>
          </h2>
          {groupe.commandes.map((c) => (
            <Fiche key={`${c.sujet}/${c.nom}`} commande={c} />
          ))}
        </section>
      ))}
    </main>
  )
}

export default DicoApp
