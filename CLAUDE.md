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

## Structure — une page par idée

Le site est multi-pages : l'accueil (`index.html` + `src/App.tsx`) liste des liens vers les idées. Pour ajouter une idée `<idee>` :

1. Créer `<idee>/index.html` (copier celui d'une idée existante, adapter titre et chemin du script).
2. Créer `src/<idee>/main.tsx` + composants ; importer `../index.css` (tokens partagés) puis le CSS propre à la page.
3. Ajouter l'entrée dans `build.rollupOptions.input` de `vite.config.ts`.
4. Ajouter le lien dans la liste `idees` de `src/App.tsx`.

Idées existantes : `grob/` (éditeur de sprites GROB), `dico/` (dictionnaire des commandes HP48G, données dans `src/dico/commandes.ts`), `famille/` (organisateur familial, maquette : dashboard `#accueil`, mode kiosque `#mur` pour l'écran mural de la salle à dîner, portail mobile `#mobile`).

Dico : chaque commande peut porter un champ `page` (page dans le PDF de l'AUG). Le PDF n'est pas encore dans le repo — le réseau du conteneur bloque tout sauf GitHub/npm, le propriétaire doit le committer lui-même dans `public/aug.pdf`. Quand il y sera : extraire la page de chaque commande (référence alphabétique du manuel) et remplir les champs `page` pour activer les liens profonds `aug.pdf#page=N`.

## Conventions

- Interface en français.
- Mobile-first : le site est consulté sur téléphone. Tester les layouts en pensant petit écran, `100dvh`, safe areas.
- Garder le projet « smol » : pas de nouvelle dépendance lourde sans raison claire.
- `base: '/SmolP/'` dans `vite.config.ts` est requis pour GitHub Pages — ne pas le retirer.
- Avant de pusher : `npm run build` et `npm run lint` doivent passer.
- **Toujours déployer** : terminer chaque session en pushant sur `main` pour que le propriétaire puisse tester le résultat sur https://paxl13.github.io/SmolP/ depuis son téléphone. Du travail non pushé est du travail invisible.
