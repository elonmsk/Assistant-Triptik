# A1 — Headers SSE corrects + streaming par chunks

- Contexte: `text/plain` utilisé et réponse envoyée d’un bloc.
- Objectif: Vrai SSE `text/event-stream` + keepalive + chunks.
- Portée: `app/api/chat/stream/route.ts`.
- Tâches:
  - [ ] Headers SSE corrects.
  - [ ] Heartbeat périodique.
  - [ ] Envoi des `data: { type:"chunk" }` successifs.
- Critères d’acceptation:
  - Flux continu; client reçoit plusieurs `chunk`.
- Estimation: 1 j
