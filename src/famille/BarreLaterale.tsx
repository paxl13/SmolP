import type { JSX } from 'react'
import type { Vue } from './FamilleApp'
import { IconeCalendrier, IconeEngrenage, IconeMaison, IconeTelephone } from './Icones'

interface Props {
  vue: Vue
  changerVue: (v: Vue) => void
}

const ENTREES: Array<{ vue: Vue; libelle: string; Icone: () => JSX.Element }> = [
  { vue: 'accueil', libelle: 'Accueil', Icone: IconeMaison },
  { vue: 'calendrier', libelle: 'Calendrier', Icone: IconeCalendrier },
  { vue: 'config', libelle: 'Réglages', Icone: IconeEngrenage },
]

function BarreLaterale({ vue, changerVue }: Props) {
  return (
    <nav className="barre-laterale" aria-label="Vues">
      <a className="retour" href={import.meta.env.BASE_URL} title="Retour à SmolP">
        ←
      </a>
      <ul>
        {ENTREES.map(({ vue: v, libelle, Icone }) => (
          <li key={v}>
            <button
              type="button"
              className={v === vue ? 'actif' : undefined}
              aria-current={v === vue ? 'page' : undefined}
              aria-label={libelle}
              title={libelle}
              onClick={() => changerVue(v)}
            >
              <Icone />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`portail${vue === 'mobile' ? ' actif' : ''}`}
        aria-label="Portail mobile (maquette)"
        title="Portail mobile (maquette)"
        onClick={() => changerVue('mobile')}
      >
        <IconeTelephone />
      </button>
    </nav>
  )
}

export default BarreLaterale
