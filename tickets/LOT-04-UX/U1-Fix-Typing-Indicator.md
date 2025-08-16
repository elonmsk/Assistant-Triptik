# U1 — Corriger la condition de l’indicateur de frappe

- Contexte: Mauvaise priorité logique; affichage quand `idle`.
- Objectif: Affiche uniquement pendant envoi et `idle`.
- Portée: `components/chat/ChatInterface.tsx`.
- Tâches:
  - [ ] Remplacer condition par `isSendingMessage && processingState.currentStep === 'idle'`.
- Critères d’acceptation:
  - Indicateur cohérent à l’envoi.
- Estimation: 0.1 j
