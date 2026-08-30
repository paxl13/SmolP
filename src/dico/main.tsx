import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './dico.css'
import DicoApp from './DicoApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DicoApp />
  </StrictMode>,
)
