# Hoop Destiny 🏀

Un jeu de carrière narrative de basketball, inspiré de *Destiny Eleven* : crée ton joueur, fais des choix
qui façonnent tes attributs et ta réputation, puis vis une carrière complète du lycée (USA) ou de
l'académie de club (Europe) jusqu'aux ligues professionnelles (NBA / EuroLigue).

## Concept

- **Création de personnage** : nom, poste (PG/SG/SF/PF/C), numéro de maillot.
- **Prologue narratif** : une série de choix détermine ton parcours (USA ou Europe) et tes premiers
  attributs (tir, passe, défense, athlétisme, QI basket, charisme).
- **Saisons simulées** : chaque saison comporte un calendrier de matchs. Les matchs classiques sont
  simulés automatiquement selon le niveau de ton équipe et tes attributs.
- **Moments décisifs** : lors de certains matchs clés (fin de saison, rencontres importantes), tu dois
  choisir une action en temps réel (tir à trois points, passe décisive, arrêt défensif...) qui influence
  directement le résultat du match.
- **Événements narratifs** : entre les matchs, des événements (médias, blessures, tensions de vestiaire,
  recruteurs...) t'obligent à faire des choix qui impactent tes statistiques et ton moral.
- **Progression de carrière** : Lycée → Université (NCAA) → Draft → NBA, ou Académie → Académie →
  Contrat pro → EuroLigue. À la fin de chaque saison pro, tu peux continuer ou prendre ta retraite et
  découvrir ta note de légende finale.
- **Sauvegarde locale** : la progression est automatiquement sauvegardée dans le navigateur
  (`localStorage`), aucun compte ni serveur nécessaire.

## Lancer le projet en local

```bash
npm install
npm run dev
```

Puis ouvrir l'URL indiquée (par défaut http://localhost:5173).

## Build de production

```bash
npm run build
```

Le site statique généré dans `dist/` peut être déployé sur n'importe quel hébergeur statique
(Vercel, Netlify, GitHub Pages...).

## Stack technique

- React 19 + TypeScript
- Vite
- Aucune dépendance backend : état géré via `useReducer` + Context, persistance `localStorage`
