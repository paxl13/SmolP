import { TuileTache } from './Dashboard'
import type { Coches } from './FamilleApp'
import {
  MEMBRES,
  NOMS_JOURS,
  NOMS_MOIS,
  type MembreId,
  aujourdhui,
  cleCoche,
  evenementsDu,
  indexLundi,
  membre,
  tachesDu,
} from './donnees'

interface Props {
  membreId: MembreId
  changerMembre: (id: MembreId) => void
  coches: Coches
}

function PortailMobile({ membreId, changerMembre, coches }: Props) {
  const ajd = aujourdhui()
  const moi = membre(membreId)
  const taches = tachesDu(membreId, ajd)
  const faites = taches.filter((t) => coches.set.has(cleCoche(membreId, t.id, ajd))).length
  const evs = evenementsDu(ajd)

  return (
    <div className="cadre-telephone">
      <div className={`portail membre-${membreId}`}>
        <div className="qui-suis-je" role="radiogroup" aria-label="Se connecter en tant que">
          {MEMBRES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={m.id === membreId}
              className={m.id === membreId ? 'actif' : undefined}
              onClick={() => changerMembre(m.id)}
            >
              <span aria-hidden>{m.emoji}</span>
              {m.nom}
            </button>
          ))}
        </div>

        <header>
          <p className="date">
            {NOMS_JOURS[indexLundi(ajd)]} {ajd.getDate()} {NOMS_MOIS[ajd.getMonth()]}
          </p>
          <h1>Salut {moi.nom}</h1>
          <p className="resume">
            {faites === taches.length
              ? 'Tout est fait pour aujourd’hui.'
              : `${taches.length - faites} ${taches.length - faites > 1 ? 'tâches restantes' : 'tâche restante'}`}
          </p>
        </header>

        <section>
          <h2>Mes tâches</h2>
          <div className="tuiles">
            {taches.map((t) => (
              <TuileTache
                key={t.id}
                membre={moi}
                tacheId={t.id}
                titre={t.titre}
                emoji={t.emoji}
                corvee={t.corvee}
                coches={coches}
                date={ajd}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>Aujourd'hui en famille</h2>
          <ul className="agenda-jour">
            {evs.map((e) => (
              <li key={e.id} className={`cal-${e.calendrier}`}>
                <time>{e.heure ?? 'journée'}</time>
                <div>
                  <strong>{e.titre}</strong>
                  {e.lieu && <span>{e.lieu}</span>}
                </div>
              </li>
            ))}
            {evs.length === 0 && <li className="vide">Rien de prévu aujourd'hui.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default PortailMobile
