import { CALENDRIERS, ENFANTS, MEMBRES } from './donnees'

function Configuration() {
  return (
    <div className="configuration">
      <h1>Réglages</h1>
      <p className="note">Maquette : rien ici n'est branché. Ces réglages montrent ce que la vraie version devra gérer.</p>

      <section>
        <h2>Calendriers</h2>
        <ul className="liste">
          {CALENDRIERS.map((c) => (
            <li key={c.id}>
              <i className={`pastille cal-${c.id}`} aria-hidden />
              <div>
                <strong>{c.nom}</strong>
                <span>{c.source}</span>
              </div>
              <span className="etat">Connecté</span>
            </li>
          ))}
          <li className="ajout">
            <div>
              <strong>Ajouter un calendrier</strong>
              <span>Google, Outlook ou lien iCal</span>
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h2>Membres</h2>
        <ul className="liste">
          {MEMBRES.map((m) => (
            <li key={m.id} className={`membre-${m.id}`}>
              <span className="avatar" aria-hidden>
                {m.emoji}
              </span>
              <div>
                <strong>{m.nom}</strong>
                <span>{m.enfant ? 'Enfant, corvée du lave-vaisselle en rotation' : 'Parent'}</span>
              </div>
              <span className="etat">{m.enfant ? 'Portail activé' : 'Admin'}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Corvées</h2>
        <p>
          Le lave-vaisselle tourne chaque jour entre {ENFANTS.map((e) => e.nom).join(', ')} : vider, ramasser la table,
          remplir. Les autres tâches sont propres à chacun et se cochent depuis l'écran ou le portail.
        </p>
      </section>

      <section>
        <h2>Écran</h2>
        <ul className="liste">
          <li>
            <div>
              <strong>Veille</strong>
              <span>Écran éteint de 22 h à 6 h</span>
            </div>
            <span className="etat">Activé</span>
          </li>
          <li>
            <div>
              <strong>Thème</strong>
              <span>Suit l'heure du jour</span>
            </div>
            <span className="etat">Auto</span>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default Configuration
