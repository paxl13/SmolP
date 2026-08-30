# SmolP

Petit bac à sable web pour prototyper des idées — pensé pour être piloté depuis un téléphone via [Claude Code](https://claude.ai/code).

**Démo en ligne** : https://paxl13.github.io/SmolP/ (déployée automatiquement à chaque push sur `main`)

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- Lint avec [oxlint](https://oxc.rs/)
- Déploiement GitHub Pages via GitHub Actions

## Commandes

```bash
npm install      # installer les dépendances
npm run dev      # serveur de dev avec HMR
npm run build    # typecheck + build de production (dist/)
npm run lint     # lint
npm run preview  # prévisualiser le build de production
```

## Workflow depuis le téléphone

1. Ouvrir une session Claude Code sur ce repo (app mobile ou claude.ai/code).
2. Décrire l'idée à prototyper — Claude modifie `src/`, build, commit et push.
3. Merger sur `main` : GitHub Actions rebuild et publie sur GitHub Pages.
4. Ouvrir https://paxl13.github.io/SmolP/ pour voir le résultat.
