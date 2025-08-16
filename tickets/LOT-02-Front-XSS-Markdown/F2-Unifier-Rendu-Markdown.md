# F2 — Unifier le rendu Markdown

- Contexte: Deux chemins de rendu (MessageList et SimpleChatDisplay) différents.
- Objectif: Un seul composant/config de rendu Markdown.
- Portée: `components/chat/MessageList.tsx`, `components/ui-custom/simple-chat-display.tsx`.
- Tâches:
  - [ ] Extraire un composant `MarkdownRenderer` partagé.
  - [ ] Utiliser ce composant aux deux endroits.
- Critères d’acceptation:
  - Rendu identique et sécurisé dans les deux vues.
- Estimation: 0.25 j
