# Q3 — Resserer Tailwind content

- Contexte: Glob trop large à la racine.
- Objectif: Améliorer perf et précision purge.
- Portée: `tailwind.config.ts`.
- Tâches:
  - [ ] Retirer `*.{js,ts,jsx,tsx,mdx}` racine.
  - [ ] Conserver seulement `app/**`, `components/**`, `pages/**`.
- Critères d’acceptation:
  - Aucun style manquant; build plus rapide.
- Estimation: 0.1 j
