# A2 — Client SSE robuste (parser, retry)

- Contexte: Parsing simpliste et pas de reconnexion.
- Objectif: Parsing SSE ligne par ligne, backoff sur erreurs.
- Portée: `contexts/ChatContext.tsx`.
- Tâches:
  - [ ] Parser SSE multi-lignes correctement.
  - [ ] Reconnexion exponentielle sur 5xx/abort.
- Critères d’acceptation:
  - Pas d’erreurs parsing; reprise après erreur transitoire.
- Estimation: 0.5 j
