import { useState } from 'react'
import { GrilleMois } from './Dashboard'
import { IconeChevron } from './Icones'
import { CALENDRIERS, NOMS_MOIS, type CalendrierId, aujourdhui, evenementsDu } from './donnees'

interface Props {
  calendriersActifs: Set<CalendrierId>
  basculerCalendrier: (id: CalendrierId) => void
}

function CalendrierPlein({ calendriersActifs, basculerCalendrier }: Props) {
  const [decalage, setDecalage] = useState(0)
  const ajd = aujourdhui()
  const mois = new Date(ajd.getFullYear(), ajd.getMonth() + decalage, 1)

  return (
    <div className="calendrier-plein">
      <header>
        <div className="navigation">
          <button type="button" aria-label="Mois précédent" onClick={() => setDecalage((d) => d - 1)}>
            <IconeChevron sens="gauche" />
          </button>
          <h1>
            {NOMS_MOIS[mois.getMonth()]} <span>{mois.getFullYear()}</span>
          </h1>
          <button type="button" aria-label="Mois suivant" onClick={() => setDecalage((d) => d + 1)}>
            <IconeChevron sens="droite" />
          </button>
          {decalage !== 0 && (
            <button type="button" className="aujourdhui" onClick={() => setDecalage(0)}>
              Aujourd'hui
            </button>
          )}
        </div>
        <ul className="legende" aria-label="Calendriers affichés">
          {CALENDRIERS.map((c) => {
            const actif = calendriersActifs.has(c.id)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`cal-${c.id}${actif ? '' : ' inactif'}`}
                  aria-pressed={actif}
                  onClick={() => basculerCalendrier(c.id)}
                >
                  <i aria-hidden />
                  {c.nom}
                </button>
              </li>
            )
          })}
        </ul>
      </header>
      <GrilleMois
        mois={mois}
        marquer={(date) => {
          const evs = evenementsDu(date, calendriersActifs)
          if (evs.length === 0) return null
          return (
            <ul className="puces">
              {evs.map((e) => (
                <li key={e.id} className={`cal-${e.calendrier}`}>
                  {e.heure && <time>{e.heure}</time>}
                  <span>{e.titre}</span>
                </li>
              ))}
            </ul>
          )
        }}
      />
    </div>
  )
}

export default CalendrierPlein
