# I2 — Split prompt en 2 étapes (catégorisation -> génération)

- Contexte: Prompt système long répété; coûts élevés.
- Objectif: Réduire tokens en séparant classification et génération.
- Portée: `lib/chat/prompt.ts`, routes chat.
- Tâches:
  - [ ] Étape 1: classification (modèle rapide) -> catégorie.
  - [ ] Étape 2: charger règles de la catégorie uniquement.
- Critères d’acceptation:
  - Réponses correctes; tokens réduits.
- Estimation: 0.5–1 j
