# S2 — Activer RLS et policies sur tables

- Contexte: Accès potentiellement large aux données.
- Objectif: RLS activé et policies restreignant par `numero`/`userType`.
- Portée: Tables Supabase concernées, migrations SQL.
- Tâches:
  - [ ] Activer RLS sur tables.
  - [ ] Écrire policies (read/write par utilisateur).
  - [ ] Tester via client et service_role.
- Critères d’acceptation:
  - Accès refusé sans droits; autorisé avec règles.
- Estimation: 0.5 j
