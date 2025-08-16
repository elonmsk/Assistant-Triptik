# R1 — Dédupliquer utilitaires chat

- Contexte: Fonctions dupliquées entre routes API.
- Objectif: Centraliser prompts et utilitaires.
- Portée: `lib/chat/prompt.ts`, `lib/chat/format.ts`, imports dans routes.
- Tâches:
  - [ ] Créer fichiers utilitaires.
  - [ ] Déplacer `contextBehavior`, `formatResponse`, `generateFallbackResponse`, `detectCategory`, `formatQualificationForPrompt`.
  - [ ] Adapter imports.
- Critères d’acceptation:
  - Plus de duplication; tests passent.
- Estimation: 1 j
