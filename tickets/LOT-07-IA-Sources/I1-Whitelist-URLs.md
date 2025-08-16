# I1 — Appliquer whitelist d’URLs

- Contexte: `web_search_preview` actif alors que les sources sont limitées.
- Objectif: Retirer l’outil web OU filtrer les URLs sortantes.
- Portée: `app/api/chat/**/route.ts`, utils formatage.
- Tâches:
  - [ ] Désactiver l’outil web ou post-filtrer les liens.
  - [ ] Rejeter/retirer les liens hors whitelist.
- Critères d’acceptation:
  - Aucune URL hors domaines autorisés.
- Estimation: 0.25 j
