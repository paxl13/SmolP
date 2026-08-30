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

## Activer le déploiement GitHub Pages (une seule fois)

Le token de l'intégration Claude ne peut pas créer de fichiers de workflow, donc deux petites étapes manuelles :

1. Copier `docs/deploy.yml` vers `.github/workflows/deploy.yml` (par exemple via l'interface GitHub : **Add file → Create new file**, chemin `.github/workflows/deploy.yml`, coller le contenu).
2. Dans **Settings → Pages**, mettre **Source** sur **GitHub Actions**.

Ensuite chaque push sur `main` publie automatiquement sur https://paxl13.github.io/SmolP/.

## Workflow depuis le téléphone

1. Ouvrir une session Claude Code sur ce repo (app mobile ou claude.ai/code).
2. Décrire l'idée à prototyper — Claude modifie `src/`, build, commit et push.
3. Merger sur `main` : GitHub Actions rebuild et publie sur GitHub Pages.
4. Ouvrir https://paxl13.github.io/SmolP/ pour voir le résultat.
