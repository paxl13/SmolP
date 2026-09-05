import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './famille.css'
import FamilleApp from './FamilleApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FamilleApp />
  </StrictMode>,
)
