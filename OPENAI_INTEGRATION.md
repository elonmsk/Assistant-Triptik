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

Comportement :
- Si la thématique de la question est liée à la **formation professionnelle ou scolaire**, tu chercheras exclusivement des informations sur le site : https://www.oriane.info
- Si la thématique concerne l'**apprentissage du français**, tu chercheras exclusivement des informations sur le site : https://www.reseau-alpha.org/trouver-une-formation
- Pour toute autre thématique (hébergement, santé, alimentation, etc.), tu chercheras exclusivement des informations dans ce document PDF : https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

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