import type { ReactNode } from 'react'
import type { Coches } from './FamilleApp'
import { IconeCrochet } from './Icones'
import {
  ENFANTS,
  MEMBRES,
  NOMS_JOURS,
  NOMS_JOURS_COURTS,
  NOMS_MOIS,
  STATS,
  type CalendrierId,
  type Membre,
  ajouterJours,
  aujourdhui,
  cleCoche,
  debutSemaine,
  evenementsDu,
  indexLundi,
  memeJour,
  tachesDu,
} from './donnees'

interface Props {
  coches: Coches
  calendriersActifs: Set<CalendrierId>
}

function WidgetSemaine({ calendriersActifs }: { calendriersActifs: Set<CalendrierId> }) {
  const ajd = aujourdhui()
  const lundi = debutSemaine(ajd)
  const jours = Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i))
  const colonnes = jours.map((d) => (memeJour(d, ajd) ? '1.6fr' : '1fr')).join(' ')

  return (
    <section className="widget semaine" aria-label="Cette semaine" style={{ gridTemplateColumns: colonnes }}>
      {jours.map((date, i) => {
        const evs = evenementsDu(date, calendriersActifs)
        const courant = memeJour(date, ajd)
        return (
          <div key={i} className={`jour${courant ? ' courant' : ''}`}>
            <header>
              <span className="nom-jour">{courant ? "aujourd'hui" : NOMS_JOURS[i]}</span>
              <span className="numero">{date.getDate()}</span>
            </header>
            <ul>
              {evs.map((e) => (
                <li key={e.id} className={`tuile cal-${e.calendrier}`}>
                  <strong>{e.titre}</strong>
                  <span>{e.heure ?? 'toute la journée'}</span>
                </li>
              ))}
              {evs.length === 0 && <li className="vide">rien de prévu</li>}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

export function TuileTache({
  membre,
  tacheId,
  titre,
  emoji,
  corvee,
  coches,
  date,
}: {
  membre: Membre
  tacheId: string
  titre: string
  emoji: string
  corvee?: boolean
  coches: Coches
  date: Date
}) {
  const cle = cleCoche(membre.id, tacheId, date)
  const fait = coches.set.has(cle)
  return (
    <button
      type="button"
      className={`tache${corvee ? ' corvee' : ''}${fait ? ' fait' : ''}`}
      aria-pressed={fait}
      onClick={() => coches.basculer(cle)}
    >
      <span className="emoji" aria-hidden>
        {emoji}
      </span>
      <span className="titre">{titre}</span>
      <span className="crochet" aria-hidden>
        <IconeCrochet />
      </span>
    </button>
  )
}

function WidgetTaches({ coches }: { coches: Coches }) {
  const ajd = aujourdhui()
  return (
    <section className="widget taches" aria-label="Tâches du jour">
      <h2>À faire aujourd'hui</h2>
      <ul>
        {MEMBRES.map((m) => {
          const taches = tachesDu(m.id, ajd)
          return (
            <li key={m.id} className={`rangee membre-${m.id}`}>
              <div className="qui">
                <span className="avatar" aria-hidden>
                  {m.emoji}
                </span>
                <span>{m.nom}</span>
              </div>
              <div className="tuiles">
                {taches.map((t) => (
                  <TuileTache
                    key={t.id}
                    membre={m}
                    tacheId={t.id}
                    titre={t.titre}
                    emoji={t.emoji}
                    corvee={t.corvee}
                    coches={coches}
                    date={ajd}
                  />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function GrilleMois({ mois, marquer }: { mois: Date; marquer?: (date: Date) => ReactNode }) {
  const ajd = aujourdhui()
  const premier = new Date(mois.getFullYear(), mois.getMonth(), 1)
  const depart = ajouterJours(premier, -indexLundi(premier))
  const cellules = Array.from({ length: 42 }, (_, i) => ajouterJours(depart, i))
  return (
    <div className="grille-mois">
      {NOMS_JOURS_COURTS.map((j) => (
        <span key={j} className="entete">
          {j}
        </span>
      ))}
      {cellules.map((date) => {
        const horsMois = date.getMonth() !== mois.getMonth()
        const courant = memeJour(date, ajd)
        return (
          <div key={date.getTime()} className={`case${horsMois ? ' hors' : ''}${courant ? ' courant' : ''}`}>
            <span className="numero">{date.getDate()}</span>
            {marquer?.(date)}
          </div>
        )
      })}
    </div>
  )
}

function WidgetMois() {
  const ajd = aujourdhui()
  return (
    <section className="widget mois" aria-label="Ce mois-ci">
      <h2>
        {NOMS_MOIS[ajd.getMonth()]} {ajd.getFullYear()}
      </h2>
      <GrilleMois mois={ajd} />
    </section>
  )
}

function WidgetStats() {
  return (
    <section className="widget stats" aria-label="Tâches de la semaine">
      <h2>Cette semaine</h2>
      <ul>
        {ENFANTS.map((e) => {
          const s = STATS[e.id]
          const pct = Math.round((s.faites / s.total) * 100)
          return (
            <li key={e.id} className={`membre-${e.id}`}>
              <div className="ligne">
                <span className="avatar" aria-hidden>
                  {e.emoji}
                </span>
                <span className="nom">{e.nom}</span>
                <span className="score">
                  {s.faites} sur {s.total}
                </span>
              </div>
              <div className="barre" role="img" aria-label={`${pct} % des tâches faites`}>
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="ligne bas">
                <span className="jours" aria-label="Journées complètes">
                  {s.semaine.map((ok, i) => (
                    <i key={i} className={ok ? 'ok' : undefined} title={NOMS_JOURS[i]} />
                  ))}
                </span>
                <span className="serie">
                  {s.serie} {s.serie > 1 ? 'jours de suite' : 'jour de suite'}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Dashboard({ coches, calendriersActifs }: Props) {
  return (
    <div className="dashboard">
      <WidgetSemaine calendriersActifs={calendriersActifs} />
      <WidgetTaches coches={coches} />
      <WidgetMois />
      <WidgetStats />
    </div>
  )
}

export default Dashboard
