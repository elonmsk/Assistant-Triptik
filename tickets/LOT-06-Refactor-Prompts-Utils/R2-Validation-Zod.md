# R2 — Validation d’input avec Zod

- Contexte: Interfaces TS sans validation runtime.
- Objectif: Schémas zod pour requêtes API.
- Portée: `app/api/chat/**/route.ts`.
- Tâches:
  - [ ] Ajouter Zod et schémas `ChatRequest`, `TestRequest`.
  - [ ] Retourner 400 avec message clair si invalides.
- Critères d’acceptation:
  - Cas invalides rejetés proprement.
- Estimation: 0.25 j
