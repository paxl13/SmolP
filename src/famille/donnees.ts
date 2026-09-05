export type MembreId = 'maman' | 'papa' | 'elliott' | 'theodore' | 'eleanore'

export interface Membre {
  id: MembreId
  nom: string
  emoji: string
  enfant: boolean
}

export const MEMBRES: Membre[] = [
  { id: 'maman', nom: 'Maman', emoji: '👩', enfant: false },
  { id: 'papa', nom: 'Papa', emoji: '👨', enfant: false },
  { id: 'elliott', nom: 'Elliott', emoji: '🦊', enfant: true },
  { id: 'theodore', nom: 'Theodore', emoji: '🐻', enfant: true },
  { id: 'eleanore', nom: 'Eleanore', emoji: '🐰', enfant: true },
]

export const ENFANTS = MEMBRES.filter((m) => m.enfant)

export function membre(id: MembreId): Membre {
  return MEMBRES.find((m) => m.id === id)!
}

export type CalendrierId = 'papa' | 'maman' | 'famille'

export interface Calendrier {
  id: CalendrierId
  nom: string
  source: string
}

export const CALENDRIERS: Calendrier[] = [
  { id: 'famille', nom: 'Famille', source: 'Google Agenda partagé' },
  { id: 'maman', nom: 'Maman', source: 'Google Agenda' },
  { id: 'papa', nom: 'Papa', source: 'Outlook (travail)' },
]

export interface Evenement {
  id: string
  titre: string
  jour: number
  heure?: string
  calendrier: CalendrierId
  lieu?: string
}

const brut: Array<[number, string, string | undefined, CalendrierId, string?]> = [
  [-38, 'Rendez-vous banque', '10:00', 'papa'],
  [-31, 'Anniversaire Mamie', undefined, 'famille'],
  [-25, 'Réunion parents-profs', '18:30', 'famille', 'École du Boisé'],
  [-19, 'Souper chez les Tremblay', '17:30', 'famille'],
  [-14, 'Yoga', '19:00', 'maman'],
  [-12, 'Sprint review', '14:00', 'papa'],
  [-9, 'Vétérinaire pour Mouss', '16:15', 'famille'],
  [-6, 'Cinéma en famille', '13:00', 'famille'],
  [-5, 'Yoga', '19:00', 'maman'],
  [-3, 'Journée pédagogique', undefined, 'famille'],
  [-2, 'Garage, changement de pneus', '08:00', 'papa'],
  [-1, 'Natation Eleanore', '17:00', 'famille', 'Piscine du Plateau'],
  [0, 'Dentiste Theodore', '15:30', 'famille', 'Clinique Sourire'],
  [0, 'Yoga', '19:00', 'maman'],
  [1, 'Soccer Elliott', '18:00', 'famille', 'Parc Lafontaine'],
  [1, 'Présentation client', '10:00', 'papa'],
  [2, 'Souper de fête Eleanore', '17:30', 'famille'],
  [3, 'Sortie scolaire au musée', '09:00', 'famille'],
  [3, 'Coiffeur', '12:30', 'maman'],
  [4, 'Grands-parents en visite', undefined, 'famille'],
  [5, 'Épicerie', '10:00', 'famille'],
  [5, 'Natation Eleanore', '17:00', 'famille'],
  [6, 'Brunch chez Mamie', '11:00', 'famille'],
  [8, 'Congé, télétravail impossible', undefined, 'papa'],
  [9, 'Yoga', '19:00', 'maman'],
  [10, 'Photos de classe', undefined, 'famille'],
  [12, 'Soccer Elliott', '18:00', 'famille'],
  [13, 'Rendez-vous médecin', '09:15', 'maman'],
  [16, 'Yoga', '19:00', 'maman'],
  [18, 'Théâtre avec Theodore', '19:30', 'famille'],
  [21, 'Fin de session', undefined, 'papa'],
  [23, 'Yoga', '19:00', 'maman'],
  [26, 'Déménagement de Simon (aider)', '09:00', 'famille'],
  [30, 'Yoga', '19:00', 'maman'],
  [33, 'Camping au Mont-Tremblant', undefined, 'famille'],
  [34, 'Camping au Mont-Tremblant', undefined, 'famille'],
  [35, 'Camping au Mont-Tremblant', undefined, 'famille'],
  [41, 'Dentiste Elliott', '15:30', 'famille'],
]

export const EVENEMENTS: Evenement[] = brut.map(([jour, titre, heure, calendrier, lieu], i) => ({
  id: `ev-${i}`,
  titre,
  jour,
  heure,
  calendrier,
  lieu,
}))

export const NOMS_JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
export const NOMS_JOURS_COURTS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']
export const NOMS_MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

export function aujourdhui(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function ajouterJours(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function memeJour(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function indexLundi(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function debutSemaine(date: Date): Date {
  return ajouterJours(date, -indexLundi(date))
}

export function cleJour(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function ecartJours(date: Date): number {
  return Math.round((date.getTime() - aujourdhui().getTime()) / 86_400_000)
}

export function evenementsDu(date: Date, actifs?: Set<CalendrierId>): Evenement[] {
  const jour = ecartJours(date)
  return EVENEMENTS.filter((e) => e.jour === jour && (!actifs || actifs.has(e.calendrier))).sort((a, b) =>
    (a.heure ?? '').localeCompare(b.heure ?? ''),
  )
}

export interface Tache {
  id: string
  titre: string
  emoji: string
  corvee?: boolean
}

const CORVEES: Tache[] = [
  { id: 'vider', titre: 'Vider le lave-vaisselle', emoji: '🍽️', corvee: true },
  { id: 'ramasser', titre: 'Ramasser la table', emoji: '🧹', corvee: true },
  { id: 'remplir', titre: 'Remplir le lave-vaisselle', emoji: '🫧', corvee: true },
]

function jourDeLAnnee(date: Date): number {
  const debut = new Date(date.getFullYear(), 0, 1)
  return Math.round((date.getTime() - debut.getTime()) / 86_400_000)
}

export function corveeDuJour(membreId: MembreId, date: Date): Tache | undefined {
  const rang = ENFANTS.findIndex((e) => e.id === membreId)
  if (rang < 0) return undefined
  return CORVEES[(rang + jourDeLAnnee(date)) % CORVEES.length]
}

const OPTIONNELLES: Record<MembreId, Tache[]> = {
  maman: [{ id: 'lunchs', titre: 'Préparer les lunchs', emoji: '🥪' }],
  papa: [{ id: 'poubelles', titre: 'Sortir les poubelles', emoji: '🗑️' }],
  elliott: [
    { id: 'lit', titre: 'Faire son lit', emoji: '🛏️' },
    { id: 'devoirs', titre: 'Devoirs', emoji: '📚' },
    { id: 'chambre', titre: 'Ranger sa chambre', emoji: '🧸' },
  ],
  theodore: [
    { id: 'lit', titre: 'Faire son lit', emoji: '🛏️' },
    { id: 'devoirs', titre: 'Devoirs', emoji: '📚' },
    { id: 'chat', titre: 'Nourrir Mouss', emoji: '🐈' },
  ],
  eleanore: [
    { id: 'lit', titre: 'Faire son lit', emoji: '🛏️' },
    { id: 'plantes', titre: 'Arroser les plantes', emoji: '🪴' },
  ],
}

export function tachesDu(membreId: MembreId, date: Date): Tache[] {
  const corvee = corveeDuJour(membreId, date)
  return corvee ? [corvee, ...OPTIONNELLES[membreId]] : OPTIONNELLES[membreId]
}

export function cleCoche(membreId: MembreId, tacheId: string, date: Date): string {
  return `${membreId}:${tacheId}:${cleJour(date)}`
}

export interface Stats {
  faites: number
  total: number
  serie: number
  semaine: boolean[]
}

export const STATS: Record<MembreId, Stats> = {
  maman: { faites: 5, total: 7, serie: 2, semaine: [true, true, false, true, true, true, false] },
  papa: { faites: 6, total: 7, serie: 6, semaine: [true, true, true, true, true, true, false] },
  elliott: { faites: 19, total: 28, serie: 3, semaine: [true, false, true, true, true, false, false] },
  theodore: { faites: 24, total: 28, serie: 9, semaine: [true, true, true, true, true, true, false] },
  eleanore: { faites: 15, total: 21, serie: 1, semaine: [false, true, true, false, true, false, false] },
}
