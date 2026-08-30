import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './grob.css'
import GrobApp from './GrobApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GrobApp />
  </StrictMode>,
)
