# S3 — Désactiver logs sensibles en production

- Contexte: `console.log` verbeux incluant PII/prompts.
- Objectif: Aucunes données sensibles loggées en prod.
- Portée: API chat, ChatContext.
- Tâches:
  - [ ] Wrapper de log conditionné sur `NODE_ENV`.
  - [ ] Retirer/masquer données sensibles.
- Critères d’acceptation:
  - Aucun log PII en prod.
- Estimation: 0.25 j
