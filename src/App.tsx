import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="app">
      <h1>SmolP</h1>
      <p className="tagline">Mon bac à sable pour tester des idées.</p>

      <button type="button" className="counter" onClick={() => setCount((c) => c + 1)}>
        Ça marche · {count}
      </button>

      <p className="hint">
        Modifie <code>src/App.tsx</code> pour commencer une nouvelle idée.
      </p>
    </main>
  )
}

export default App
