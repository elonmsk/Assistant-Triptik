# P2 — Rate limiting endpoints chat

- Contexte: Risque d’abus/coûts.
- Objectif: Limiter le débit par IP/utilisateur.
- Portée: `app/api/chat/**`.
- Tâches:
  - [ ] Implémentation (Upstash/in-memory) avec buckets.
  - [ ] Réponse 429 sur dépassement.
- Critères d’acceptation:
  - Débit respecté; logs d’abus.
- Estimation: 0.5 j
