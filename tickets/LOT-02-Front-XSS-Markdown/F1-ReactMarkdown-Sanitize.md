# F1 — Remplacer dangerouslySetInnerHTML par react-markdown + sanitize

- Contexte: Rendu HTML basé sur regex + `dangerouslySetInnerHTML`.
- Objectif: Éliminer XSS et standardiser le rendu.
- Portée: `components/chat/MessageList.tsx`.
- Tâches:
  - [ ] Installer `react-markdown` et `rehype-sanitize`.
  - [ ] Implémenter rendu Markdown sécurisé.
  - [ ] Supprimer l’`onclick` injecté.
- Critères d’acceptation:
  - Plus de `dangerouslySetInnerHTML`; rendu identique.
- Estimation: 0.5 j
