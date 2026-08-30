# SmolP

Bac à sable web pour prototyper des idées rapidement. Le propriétaire travaille surtout depuis son téléphone via Claude Code — les sessions doivent aboutir à du code buildé, commité et pushé sans aller-retour inutile.

## Stack

- Vite + React 19 + TypeScript (strict)
- oxlint pour le lint
- Déploiement auto sur GitHub Pages (https://paxl13.github.io/SmolP/) à chaque push sur `main` via `.github/workflows/deploy.yml` (le modèle vit dans `docs/deploy.yml` tant que le propriétaire ne l'a pas installé — le token Claude ne peut pas pusher de workflows)

## Commandes

- `npm install` — installer les dépendances (à faire en début de session si `node_modules/` absent)
- `npm run build` — typecheck (`tsc -b`) + build de production ; à exécuter avant tout commit
- `npm run lint` — oxlint
- `npm run dev` — serveur de dev (HMR)

## Conventions

- Interface en français.
- Mobile-first : le site est consulté sur téléphone. Tester les layouts en pensant petit écran, `100dvh`, safe areas.
- Garder le projet « smol » : pas de nouvelle dépendance lourde sans raison claire.
- `base: '/SmolP/'` dans `vite.config.ts` est requis pour GitHub Pages — ne pas le retirer.
- Avant de pusher : `npm run build` et `npm run lint` doivent passer.
