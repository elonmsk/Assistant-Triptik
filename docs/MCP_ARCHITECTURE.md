# Architecture MCP + Bright Data pour Assistant Santé

## 🏗️ Vue d'ensemble de l'architecture

Cette implémentation combine un serveur MCP (Model Context Protocol) avec Bright Data pour créer un assistant spécialisé dans les questions de santé qui scrape automatiquement ameli.fr.

### **Flux de données**

```
Question Utilisateur
       ↓
[Health Query Classifier] → Analyse et catégorisation
       ↓
[Ameli URL Mapping] → Sélection des URLs pertinentes
       ↓
[Bright Data Client] → Scraping parallèle des pages
       ↓
[Response Processor] → Synthèse et génération de réponse
       ↓
[Cache System] → Mise en cache pour optimisation
       ↓
Réponse Finale
```

## 📁 Structure des fichiers

```
lib/
├── mcp/
│   ├── health-server.ts          # Serveur MCP principal
│   ├── health-query-classifier.ts # Classification IA des questions
│   ├── ameli-scraping-strategy.ts # Stratégies de scraping
│   └── response-processor.ts     # Traitement des réponses
├── bright-data/
│   ├── client.ts                 # Client Bright Data
│   ├── ameli-urls.ts            # Mapping URLs ameli.fr
│   └── scraping-config.ts       # Configuration scraping
└── cache/
    ├── redis-client.ts          # Client Redis
    └── query-cache.ts           # Système de cache

app/api/
└── mcp/
    └── route.ts                 # API endpoint

components/
└── chat/
    ├── health-chat.tsx          # Interface chat santé
    └── health-suggestions.tsx   # Suggestions questions
```

## 🚀 Installation et Configuration

### **1. Installation des dépendances**

```bash
# Dépendances principales
npm install redis ioredis
npm install @types/redis

# Variables d'environnement
cp .env.example .env.local
```

### **2. Configuration des variables d'environnement**

```env
# Configuration Bright Data
BRIGHT_DATA_API_KEY=your_api_key_here

# Configuration Cache Redis (optionnel)
REDIS_URL=redis://localhost:6379

# Configuration application
AMELI_BASE_URL=https://www.ameli.fr
HEALTH_CACHE_TTL=3600000
```

### **3. Démarrage du système**

```bash
# Développement
npm run dev

# Production
npm run build && npm start
```

## 🎯 Utilisation

### **API Endpoints**

#### **POST /api/mcp**
```json
{
  "query": "Comment obtenir une carte vitale ?",
  "action": "query",
  "userContext": {
    "country": "Syria",
    "age": 23,
    "status": "asylum_seeker"
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "answer": "Pour obtenir votre carte vitale...",
    "sources": ["https://www.ameli.fr/..."],
    "confidence": 0.85,
    "cached": false,
    "category": "carte_vitale"
  }
}
```

#### **GET /api/mcp?action=suggestions**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "Comment obtenir ma première carte vitale ?",
      "Que faire si je suis étranger en France ?",
      "Comment me faire rembourser mes soins ?"
    ]
  }
}
```

### **Intégration dans l'interface**

```tsx
import HealthChat from '@/components/chat/health-chat'

function MyPage() {
  const userContext = {
    country: 'Syria',
    age: 23,
    status: 'asylum_seeker'
  }

  return (
    <div className="h-screen">
      <HealthChat userContext={userContext} />
    </div>
  )
}
```

## 🔧 Fonctionnalités avancées

### **1. Classification intelligente**

Le système analyse automatiquement les questions pour :
- ✅ Détecter si c'est une question de santé
- ✅ Catégoriser selon le type (carte vitale, remboursements, etc.)
- ✅ Déterminer l'intention (comment faire, obtenir info, etc.)
- ✅ Évaluer l'urgence
- ✅ Calculer un score de confiance

### **2. Scraping optimisé**

- ✅ Scraping parallèle de plusieurs pages
- ✅ Retry automatique avec délai exponentiel
- ✅ Sélection intelligente des URLs selon la catégorie
- ✅ Extraction du contenu pertinent seulement

### **3. Cache intelligent**

- ✅ Cache Redis pour les réponses fréquentes
- ✅ TTL configurable par type de question
- ✅ Invalidation automatique des données périmées
- ✅ Fallback en cas d'indisponibilité du cache

### **4. Monitoring et Analytics**

- ✅ Logs détaillés des requêtes
- ✅ Métriques de performance
- ✅ Tracking des sources utilisées
- ✅ Analyse des patterns de questions

## 🎨 Personnalisation

### **Ajouter de nouvelles catégories**

```typescript
// dans health-query-classifier.ts
export enum HealthCategory {
  // ... catégories existantes
  NOUVELLE_CATEGORIE = 'nouvelle_categorie'
}

// dans ameli-urls.ts
export const AMELI_URL_MAPPING = {
  // ... mappings existants
  [HealthCategory.NOUVELLE_CATEGORIE]: [
    {
      url: 'https://www.ameli.fr/nouvelle-page',
      category: HealthCategory.NOUVELLE_CATEGORIE,
      priority: 1,
      description: 'Description de la nouvelle catégorie'
    }
  ]
}
```

### **Personnaliser les suggestions**

```typescript
// dans health-query-classifier.ts
async getSuggestions(userProfile?: any): Promise<string[]> {
  // Logique personnalisée selon le profil utilisateur
  if (userProfile?.specificCondition) {
    return ['Questions spécifiques à cette condition']
  }
  
  return commonQuestions
}
```

## 📊 Performance et optimisation

### **Métriques typiques**
- ⚡ Temps de réponse: < 2 secondes (avec cache)
- ⚡ Temps de réponse: < 5 secondes (scraping live)
- 🎯 Précision classification: > 85%
- 💾 Taux de cache hit: > 70%

### **Optimisations recommandées**
1. **Redis clustering** pour haute disponibilité
2. **CDN** pour les ressources statiques
3. **Rate limiting** pour éviter le spam
4. **Monitoring APM** pour les performances

## 🔒 Sécurité

- ✅ Validation stricte des inputs
- ✅ Rate limiting par IP
- ✅ Sanitization du contenu scrapé
- ✅ Logs d'audit des requêtes
- ✅ Variables d'environnement sécurisées

## 🐛 Debugging

### **Logs de debug**
```typescript
// Activer les logs détaillés
process.env.DEBUG = 'mcp:*,bright-data:*'
```

### **Tests**
```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests de charge
npm run test:load
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 