# Intégration OpenAI - Remplacement de Render

## 🚀 Migration Complète vers OpenAI

Votre backend a été entièrement migré de Render vers OpenAI. Voici les changements effectués :

### **1. Configuration Requise**

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration OpenAI
OPENAI_API_KEY=votre_cle_api_openai_ici

# Configuration Supabase (déjà configurée dans le code)
# SUPABASE_URL=https://amikskoyjbqdvvohgssv.supabase.co
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI
```

### **2. Contexte Comportemental Intégré**

Le système utilise maintenant le contexte comportemental suivant :

```typescript
const contextBehavior = `
Tu es un assistant spécialisé dans l'orientation des personnes réfugiées ou en situation de précarité.

Tu dois analyser la question de l'utilisateur et déterminer la catégorie principale, puis chercher exclusivement sur les sites correspondants :

**CATÉGORIES ET SITES À UTILISER :**

1. **LOGEMENT** - Utilise uniquement :
   - https://mobilijeune.actionlogement.fr/connexion?loginRedirect=%2F
   - https://www.actionlogement.fr/
   - https://www.demande-logement-social.gouv.fr/index
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

2. **SANTÉ** - Utilise uniquement :
   - https://www.assurance-maladie.ameli.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

3. **EMPLOI** - Utilise uniquement :
   - https://www.francetravail.fr/accueil/
   - https://travail-emploi.gouv.fr/les-missions-locales
   - https://travail-emploi.gouv.fr/
   - https://polaris14.org/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

4. **ÉDUCATION** - Utilise uniquement :
   - https://www.uni-r.org/
   - https://www.parcoursup.gouv.fr/
   - https://www.paris.fr/pages/cours-municipaux-d-adultes-205
   - https://www.france-education-international.fr/expertises/enic-naric
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

5. **TRANSPORT** - Utilise uniquement :
   - https://www.solidaritetransport.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

6. **HANDICAP** - Utilise uniquement :
   - https://mdphenligne.cnsa.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

7. **DÉMARCHES** - Utilise uniquement :
   - https://demarchesadministratives.fr/
   - https://<nom-du-département>.gouv.fr
   - https://lannuaire.service-public.fr/
   - https://www.service-public.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

8. **DROITS** - Utilise uniquement :
   - https://www.lacimade.org/etre-aide-par-la-cimade/
   - https://www.forumrefugies.org/s-informer/publications/articles-d-actualites/en-france/1595-acces-aux-droits-deux-rapports-alertent-sur-les-defaillances-du-dispositif-dematerialise-pour-les-demandes-de-titres-de-sejour
   - https://ofpra.gouv.fr/
   - https://www.cnda.fr/
   - https://administration-etrangers-en-france.interieur.gouv.fr/particuliers/#/
   - https://www.france-terre-asile.org/
   - https://accueil-integration-refugies.fr/
   - https://www.info-droits-etrangers.org/sejourner-en-france/les-statuts-particuliers/les-ressortissants-dafrique-afrique-subsaharienne-et-maghreb/
   - https://accueil-integration-refugies.fr/wp-content/uploads/2024/07/Manuel-dinsertion-professionnelle-des-personnes-refugiees-L-entree-dans-le-parcours-17-37.pdf
   - https://asile-en-france.com/
   - https://accueil-integration-refugies.fr/les-refugies-dans-les-territoires-ruraux-guide-2024/
   - https://www.legifrance.gouv.fr/
   - https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070158/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

9. **APPRENTISSAGE FRANÇAIS** - Utilise uniquement :
   - https://www.reseau-alpha.org/
   - https://www.reseau-eiffel.fr/presentation-du-reseau-eiffel
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

10. **AIDES FINANCIÈRES** - Utilise uniquement :
    - https://www.caf.fr/
    - https://www.msa.fr/
    - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

**RÈGLES IMPORTANTES :**
- Analyse d'abord la question pour déterminer la catégorie principale
- Utilise UNIQUEMENT les sites listés pour la catégorie identifiée
- Ne jamais utiliser d'autres sources
- Si la question concerne plusieurs catégories, choisis la plus pertinente
- Fournis des informations précises et actualisées depuis ces sites officiels
- Consulte TOUJOURS le document Watizat en complément des autres sources

Tu ne dois jamais utiliser d'autres sources que celles mentionnées, selon la catégorie.
`
```

### **3. API Routes Mises à Jour**

#### **API Standard** (`/api/chat/route.ts`)
- ✅ Remplacement de `callRenderLLM()` par `callOpenAI()`
- ✅ Utilisation du modèle `o4-mini`
- ✅ Intégration du contexte comportemental
- ✅ Conservation du formatage des réponses

#### **API Streaming** (`/api/chat/stream/route.ts`)
- ✅ Remplacement de `callRenderLLMStream()` par `callOpenAIStream()`
- ✅ Simulation du streaming par chunks
- ✅ Conservation du mécanisme d'affichage

### **4. Fonctionnalités Conservées**

#### **Mécanisme d'Affichage des Messages**
- ✅ Formatage Markdown avec émojis
- ✅ Structure hiérarchique (#, ##, ###)
- ✅ Gestion des listes et liens
- ✅ Alertes et citations

#### **Gestion des Conversations**
- ✅ Sauvegarde dans Supabase
- ✅ Historique des messages
- ✅ Contexte utilisateur
- ✅ Thèmes de conversation

#### **Gestion des Erreurs**
- ✅ Timeout de 90 secondes
- ✅ Réponses de fallback
- ✅ Logs de débogage

### **5. Avantages de la Migration**

#### **Performance**
- ⚡ Réponses plus rapides avec OpenAI
- ⚡ Meilleure qualité de recherche web
- ⚡ Modèle plus récent (o4-mini)

#### **Fiabilité**
- 🔒 Pas de dépendance externe Render
- 🔒 API OpenAI stable et documentée
- 🔒 Meilleure gestion des erreurs

#### **Coût**
- 💰 Contrôle direct des coûts OpenAI
- 💰 Pas de coûts d'hébergement Render
- 💰 Facturation à l'usage

### **6. Test de l'Intégration**

#### **1. Test Local**
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Tester l'API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Je veux faire une formation en restauration",
    "userNumero": "123456",
    "userType": "accompagne"
  }'
```

#### **2. Test du Streaming**
```bash
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Je veux apprendre le français",
    "userNumero": "123456",
    "userType": "accompagne"
  }'
```

### **7. Variables d'Environnement**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Clé API OpenAI | `sk-...` |
| `EXTERNAL_API_URL` | ❌ Plus utilisé (Render) | - |
| `RENDER_API_KEY` | ❌ Plus utilisé (Render) | - |

### **8. Déploiement**

#### **Vercel**
1. Ajoutez `OPENAI_API_KEY` dans les variables d'environnement Vercel
2. Déployez normalement avec `git push`

#### **Autres Plateformes**
1. Configurez `OPENAI_API_KEY` dans les variables d'environnement
2. Assurez-vous que le package `openai` est installé

### **9. Monitoring**

#### **Logs à Surveiller**
```typescript
console.log('🚀 Requête envoyée à OpenAI:', { userMessage, systemContext });
console.error("Erreur lors de l'appel à OpenAI:", error);
```

#### **Métriques**
- Temps de réponse OpenAI
- Taux d'erreur
- Utilisation des tokens

### **10. Prochaines Étapes**

1. **Testez** l'intégration avec votre clé API OpenAI
2. **Ajustez** le contexte comportemental si nécessaire
3. **Optimisez** les prompts selon vos besoins
4. **Surveillez** les coûts et performances

---

## ✅ Migration Terminée

Votre backend utilise maintenant OpenAI au lieu de Render, avec le même mécanisme d'affichage des messages dans le chat. Toutes les fonctionnalités existantes ont été conservées. 