# S1 — Retirer les clés Supabase en dur + rotation

- Contexte: Exposition de `service_role` et `anon` en clair dans le repo et routes API.
- Objectif: Basculer 100% sur variables d’environnement; régénérer les clés et invalider les anciennes.
- Portée: `lib/supabaseClient.ts`, `app/api/chat/**/route.ts`, `app/api/get-user/route.ts`, `.env.local`.
- Tâches:
  - [ ] Créer `.env.local` avec `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - [ ] Modifier `lib/supabaseClient.ts` pour n’utiliser que `NEXT_PUBLIC_*`.
  - [ ] Modifier les routes API pour utiliser `process.env.SUPABASE_SERVICE_ROLE_KEY`.
  - [ ] Regénérer les clés côté Supabase et révoquer les anciennes.
  - [ ] `grep -R` pour s’assurer qu’aucune clé en dur ne reste.
- Critères d’acceptation:
  - Build OK; endpoints OK avec env; aucune clé hardcodée dans le repo.
- Estimation: 0.5 j
