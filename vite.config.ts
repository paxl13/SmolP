import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const racine = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Servi sous https://paxl13.github.io/SmolP/
  base: '/SmolP/',
  appType: 'mpa',
  build: {
    rollupOptions: {
      // Une entrée par idée : ajouter ici chaque nouveau <idee>/index.html
      input: {
        index: resolve(racine, 'index.html'),
        grob: resolve(racine, 'grob/index.html'),
        dico: resolve(racine, 'dico/index.html'),
      },
    },
  },
})
