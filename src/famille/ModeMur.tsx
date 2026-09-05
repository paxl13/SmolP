import { useEffect, useRef, useState } from 'react'
import Dashboard from './Dashboard'
import type { Coches } from './FamilleApp'
import { IconePleinEcran, IconeQuitter } from './Icones'
import { NOMS_JOURS, NOMS_MOIS, indexLundi, type CalendrierId } from './donnees'

interface Props {
  coches: Coches
  calendriersActifs: Set<CalendrierId>
  quitter: () => void
}

// Rechargement nocturne : ramasse le déploiement de la veille et repart la journée à neuf.
const HEURE_RECHARGE = 3

function ModeMur({ coches, calendriersActifs, quitter }: Props) {
  const [maintenant, setMaintenant] = useState(() => new Date())
  const [repos, setRepos] = useState(false)
  const minuterieRepos = useRef(0)

  useEffect(() => {
    let minuterie = 0
    const armer = () => {
      const n = new Date()
      minuterie = window.setTimeout(() => {
        setMaintenant(new Date())
        armer()
      }, 60_000 - (n.getSeconds() * 1000 + n.getMilliseconds()))
    }
    armer()
    return () => window.clearTimeout(minuterie)
  }, [])

  useEffect(() => {
    const n = new Date()
    const cible = new Date(n)
    cible.setHours(HEURE_RECHARGE, 0, 0, 0)
    if (cible <= n) cible.setDate(cible.getDate() + 1)
    const minuterie = window.setTimeout(() => window.location.reload(), cible.getTime() - n.getTime())
    return () => window.clearTimeout(minuterie)
  }, [])

  useEffect(() => {
    let verrou: WakeLockSentinel | null = null
    let actif = true
    const demander = async () => {
      try {
        const demande = await navigator.wakeLock?.request('screen')
        if (actif) verrou = demande ?? null
        else void demande?.release()
      } catch {
        // Refusé (batterie faible, onglet caché…) : le mode kiosque de l'appareil prendra le relais.
      }
    }
    const surVisibilite = () => {
      if (document.visibilityState === 'visible' && actif) void demander()
    }
    void demander()
    document.addEventListener('visibilitychange', surVisibilite)
    return () => {
      actif = false
      document.removeEventListener('visibilitychange', surVisibilite)
      void verrou?.release()
    }
  }, [])

  useEffect(() => {
    const reveiller = () => {
      setRepos(false)
      window.clearTimeout(minuterieRepos.current)
      minuterieRepos.current = window.setTimeout(() => setRepos(true), 5_000)
    }
    reveiller()
    window.addEventListener('pointermove', reveiller)
    window.addEventListener('pointerdown', reveiller)
    return () => {
      window.clearTimeout(minuterieRepos.current)
      window.removeEventListener('pointermove', reveiller)
      window.removeEventListener('pointerdown', reveiller)
    }
  }, [])

  const basculerPleinEcran = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.()
  }

  const heure = `${maintenant.getHours()} h ${String(maintenant.getMinutes()).padStart(2, '0')}`
  const date = `${NOMS_JOURS[indexLundi(maintenant)]} ${maintenant.getDate()} ${NOMS_MOIS[maintenant.getMonth()]}`

  return (
    <div className={`mur${repos ? ' repos' : ''}`}>
      <header className="entete-mur">
        <span className="heure">{heure}</span>
        <span className="date">{date}</span>
        <span className="controles">
          <button type="button" onClick={basculerPleinEcran} aria-label="Plein écran" title="Plein écran">
            <IconePleinEcran />
          </button>
          <button type="button" onClick={quitter} aria-label="Quitter le mode mur" title="Quitter le mode mur">
            <IconeQuitter />
          </button>
        </span>
      </header>
      <Dashboard coches={coches} calendriersActifs={calendriersActifs} />
    </div>
  )
}

export default ModeMur
