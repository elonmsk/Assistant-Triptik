# U2 — Centraliser l’affichage de ProcessingIndicator

- Contexte: Doublons d’indicateurs (zone messages + footer).
- Objectif: Un seul chemin de rendu via `TypingIndicator`.
- Portée: `components/chat/ChatInterface.tsx`, `components/chat/MessageList.tsx`.
- Tâches:
  - [ ] Retirer l’affichage secondaire.
  - [ ] S’assurer que `TypingIndicator` couvre tous les cas.
- Critères d’acceptation:
  - Un seul indicateur visible.
- Estimation: 0.1 j
