const idees = [
  {
    path: 'grob/',
    titre: 'Éditeur de sprites GROB',
    description: 'Pixel art pour la HP48G, export en string GROB.',
  },
  {
    path: 'dico/',
    titre: 'Dico HP48G',
    description: 'Les commandes de la 48G, par sujet et en alpha, avec recherche.',
  },
  {
    path: 'famille/',
    titre: 'Organisateur famille',
    description: 'Maquette du tableau de bord pour l’écran de la salle à dîner, et du portail mobile.',
  },
]

function App() {
  return (
    <main className="accueil">
      <h1>SmolP</h1>
      <p className="tagline">Mes idées, une page à la fois.</p>
      <nav className="idees">
        {idees.map((idee) => (
          <a key={idee.path} className="carte" href={import.meta.env.BASE_URL + idee.path}>
            <strong>{idee.titre}</strong>
            <span>{idee.description}</span>
          </a>
        ))}
      </nav>
    </main>
  )
}

export default App
