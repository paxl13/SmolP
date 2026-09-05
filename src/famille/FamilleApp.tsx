import { useCallback, useEffect, useState } from 'react'
import BarreLaterale from './BarreLaterale'
import CalendrierPlein from './CalendrierPlein'
import Configuration from './Configuration'
import Dashboard from './Dashboard'
import PortailMobile from './PortailMobile'
import { CALENDRIERS, type CalendrierId, type MembreId } from './donnees'

export type Vue = 'accueil' | 'calendrier' | 'config' | 'mobile'

const VUES: Vue[] = ['accueil', 'calendrier', 'config', 'mobile']

function vueDepuisHash(): Vue {
  const h = window.location.hash.replace('#', '') as Vue
  return VUES.includes(h) ? h : 'accueil'
}

export interface Coches {
  set: Set<string>
  basculer: (cle: string) => void
}

function FamilleApp() {
  const [vue, setVue] = useState<Vue>(vueDepuisHash)
  const [membreConnecte, setMembreConnecte] = useState<MembreId>('elliott')
  const [coches, setCoches] = useState<Set<string>>(() => new Set())
  const [calendriersActifs, setCalendriersActifs] = useState<Set<CalendrierId>>(
    () => new Set(CALENDRIERS.map((c) => c.id)),
  )

  useEffect(() => {
    const surHash = () => setVue(vueDepuisHash())
    window.addEventListener('hashchange', surHash)
    return () => window.removeEventListener('hashchange', surHash)
  }, [])

  const changerVue = useCallback((v: Vue) => {
    window.location.hash = v
    setVue(v)
  }, [])

  const basculerCoche = useCallback((cle: string) => {
    setCoches((prev) => {
      const suivant = new Set(prev)
      if (suivant.has(cle)) suivant.delete(cle)
      else suivant.add(cle)
      return suivant
    })
  }, [])

  const basculerCalendrier = useCallback((id: CalendrierId) => {
    setCalendriersActifs((prev) => {
      const suivant = new Set(prev)
      if (suivant.has(id)) suivant.delete(id)
      else suivant.add(id)
      return suivant
    })
  }, [])

  const cochesApi: Coches = { set: coches, basculer: basculerCoche }

  return (
    <div className={`famille vue-${vue}`}>
      <BarreLaterale vue={vue} changerVue={changerVue} />
      <main className="scene">
        {vue === 'accueil' && <Dashboard coches={cochesApi} calendriersActifs={calendriersActifs} />}
        {vue === 'calendrier' && (
          <CalendrierPlein calendriersActifs={calendriersActifs} basculerCalendrier={basculerCalendrier} />
        )}
        {vue === 'config' && <Configuration />}
        {vue === 'mobile' && (
          <PortailMobile membreId={membreConnecte} changerMembre={setMembreConnecte} coches={cochesApi} />
        )}
      </main>
    </div>
  )
}

export default FamilleApp
