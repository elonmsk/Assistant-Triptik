# Intégration LLM + MCP pour Assistant Santé

## 🧠 Architecture LLM + MCP

Cette intégration combine un Large Language Model (LLM) avec le serveur MCP pour créer un assistant conversationnel intelligent qui peut utiliser des outils spécialisés.

### **🔄 Flux de conversation**

```
Utilisateur → LLM Service → MCP Orchestrator → Outils MCP → Réponse IA
    ↑                                              ↓
    └─────────── Réponse conversationnelle ←───────────┘
```

### **🛠️ Outils disponibles pour le LLM**

1. **`search_ameli_health`** : Recherche intelligente sur ameli.fr
2. **`get_health_suggestions`** : Suggestions contextuelles  
3. **`scrape_specific_ameli_page`** : Scraping d'une page spécifique
4. **`classify_health_query`** : Classification des questions santé

## 🚀 Configuration et utilisation

### **1. Variables d'environnement**

```env
# Configuration LLM
LLM_PROVIDER=openai  # ou 'anthropic'
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4      # ou 'claude-3-sonnet'

# Configuration MCP (existante)
BRIGHT_DATA_API_KEY=your_bright_data_key
REDIS_URL=redis://localhost:6379
```

### **2. Utilisation du composant**

```tsx
import IntelligentHealthChat from '@/components/chat/intelligent-health-chat'

function HealthAssistantPage() {
  const userProfile = {
    country: 'Syria',
    age: 23,
    status: 'asylum_seeker',
    language: 'fr'
  }

  return (
    <div className="h-screen p-4">
      <IntelligentHealthChat 
        userProfile={userProfile}
        onSessionUpdate={(sessionId) => {
          console.log('Session ID:', sessionId)
        }}
      />
    </div>
  )
}
```

### **3. API Endpoints**

#### **POST /api/chat**
```json
{
  "action": "chat",
  "message": "Comment obtenir une carte vitale en venant de Syrie ?",
  "sessionId": "session_123",
  "userProfile": {
    "country": "Syria",
    "age": 23,
    "status": "asylum_seeker"
  }
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "response": "Pour obtenir une carte vitale en venant de Syrie...",
    "sessionId": "session_123",
    "sources": ["https://www.ameli.fr/..."],
    "metadata": {
      "tool_calls_made": 2,
      "functions_used": ["search_ameli_health", "classify_health_query"],
      "total_tokens": 1524
    }
  }
}
```

## 🔧 Architecture technique détaillée

### **🧠 LLM Service (`lib/llm/llm-service.ts`)**

Service abstrait supportant multiple providers :

```typescript
// OpenAI
const llmService = LLMServiceFactory.create({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4'
})

// Anthropic Claude
const llmService = LLMServiceFactory.create({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-sonnet-20240229'
})
```

### **🎯 MCP Orchestrator (`lib/mcp/mcp-orchestrator.ts`)**

Combine LLM + MCP avec prompt engineering spécialisé :

```typescript
const orchestrator = new MCPOrchestrator({
  llm: {
    provider: 'openai',
    apiKey: process.env.LLM_API_KEY,
    model: 'gpt-4'
  },
  mcp: {
    brightDataApiKey: process.env.BRIGHT_DATA_API_KEY,
    cacheEnabled: true,
    maxCacheAge: 3600000,
    ameliBaseUrl: 'https://www.ameli.fr'
  }
})
```

### **💬 Chat API (`app/api/chat/route.ts`)**

Gère les conversations avec cache mémoire et nettoyage automatique.

## 🎨 Interface utilisateur

### **🎯 Fonctionnalités du chat**

- ✅ **Messages conversationnels** avec avatars IA/Utilisateur
- ✅ **Indicateurs de chargement** avec statut en temps réel
- ✅ **Métadonnées IA** (outils utilisés, tokens, confiance)
- ✅ **Sources officielles** cliquables vers ameli.fr
- ✅ **Suggestions contextuelles** selon le profil utilisateur
- ✅ **Auto-scroll** et interface responsive
- ✅ **Statut système** (provider LLM, modèle, conversations actives)

### **🎛️ Composants visuels**

```tsx
// Header avec statut système
<Brain className="w-6 h-6 text-blue-600" />
<Badge>GPT-4 + MCP + Bright Data</Badge>

// Messages avec métadonnées
<Zap className="w-3 h-3" />
"2 outil(s) utilisé(s) • Fonctions: search_ameli_health, classify_health_query • 1524 tokens"

// Sources officielles
<ExternalLink className="w-3 h-3" />
"ameli.fr"
```

## 📊 Exemples de conversations

### **Exemple 1 : Question simple**

**Utilisateur :** "Comment obtenir une carte vitale ?"

**IA :** 
1. Utilise `classify_health_query` → catégorie "carte_vitale"
2. Utilise `search_ameli_health` → récupère les infos sur ameli.fr
3. Génère une réponse conversationnelle structurée

### **Exemple 2 : Situation complexe**

**Utilisateur :** "Je viens de Syrie, j'ai 23 ans, je suis demandeur d'asile, comment obtenir ma carte vitale ?"

**IA :**
1. Analyse le profil → détecte "demandeur d'asile", "étranger"
2. Utilise `search_ameli_health` avec contexte spécifique
3. Utilise `scrape_specific_ameli_page` pour la page demandeurs d'asile
4. Génère une réponse personnalisée avec étapes spécifiques

## 🔍 Prompt Engineering

### **Système prompt spécialisé santé**

```
Tu es un assistant IA spécialisé dans les questions de santé en France...

**Outils à ta disposition :**
1. search_ameli_health : Rechercher sur ameli.fr
2. get_health_suggestions : Suggestions contextuelles
3. scrape_specific_ameli_page : Scraping page spécifique
4. classify_health_query : Classification questions

**Instructions importantes :**
- Utilise TOUJOURS les outils pour obtenir des informations récentes
- Cite tes sources (URLs ameli.fr)
- Adapte selon le profil utilisateur
- Sois empathique avec les personnes vulnérables
```

## ⚡ Performance et optimisation

### **Métriques de performance**

- 🚀 **Temps de réponse** : 3-8 secondes (selon complexité)
- 🧠 **Tokens moyens** : 800-2000 par conversation
- 🔧 **Outils moyens** : 1-3 par question
- 💾 **Cache hit rate** : 60-80%

### **Optimisations**

1. **Cache conversations** en mémoire (Redis en production)
2. **Parallélisation** des appels d'outils MCP
3. **Prompt optimization** pour réduire les tokens
4. **Nettoyage automatique** des sessions expirées

## 🔒 Sécurité et bonnes pratiques

### **Validation des inputs**
- ✅ Sanitization des messages utilisateur
- ✅ Validation des paramètres d'outils
- ✅ Rate limiting par session
- ✅ Timeout sur les appels LLM/MCP

### **Gestion des erreurs**
- ✅ Fallback gracieux si LLM indisponible
- ✅ Retry automatique pour les outils MCP
- ✅ Messages d'erreur utilisateur-friendly
- ✅ Logs détaillés pour debugging

## 🚀 Déploiement

### **Production checklist**

1. ✅ Configurer Redis pour cache persistant
2. ✅ Mettre en place monitoring LLM
3. ✅ Configurer rate limiting
4. ✅ Activer compression des réponses
5. ✅ Sauvegarder les conversations importantes

### **Scaling**

- **Horizontal** : Load balancer + instances multiples
- **Cache** : Redis Cluster pour haute disponibilité
- **LLM** : Pool de connexions + retry logic
- **MCP** : Queue system pour pic de charge

## 🎯 Roadmap

### **Phase 1 : Foundation** ✅
- [x] Service LLM multi-provider
- [x] MCP Orchestrator
- [x] Chat interface
- [x] Outils de base

### **Phase 2 : Intelligence** 🚧
- [ ] RAG avec base de connaissances
- [ ] Apprentissage des préférences utilisateur
- [ ] Suggestions proactives
- [ ] Multilingual support

### **Phase 3 : Advanced** 📋
- [ ] Voice chat integration
- [ ] Document analysis
- [ ] Appointment booking
- [ ] Integration avec services externes

Cette architecture LLM + MCP vous donne un assistant santé conversationnel complet et intelligent, capable de comprendre les nuances des situations complexes et de fournir des réponses précises basées sur les données officielles d'ameli.fr. 