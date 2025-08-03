# 🎯 Système de Qualification Dynamique - Assistant Triptik

## 📋 Vue d'ensemble

Le système de qualification dynamique permet d'intégrer automatiquement les réponses de qualification des utilisateurs dans le prompt envoyé au LLM, permettant des réponses personnalisées et adaptées au profil de chaque utilisateur.

## 🔧 Fonctionnalités implémentées

### 1. **Sauvegarde automatique des réponses**
- Les réponses de qualification sont automatiquement sauvegardées dans le `localStorage`
- Format : `qualification_{catégorie}` pour les accompagnés
- Format : `qualification_{catégorie}_accompagnant` pour les accompagnants
- Expiration automatique après 7 jours

### 2. **Récupération intelligente des données**
- Fonctions utilitaires dans `lib/utils.ts` :
  - `getQualificationData()` : Récupère les données d'une catégorie spécifique
  - `getAllQualificationData()` : Récupère toutes les qualifications d'un utilisateur
  - `formatQualificationForPrompt()` : Formate les données pour le prompt

### 3. **Intégration dans les APIs**
- Modification des interfaces `ChatRequest` pour inclure `qualificationData`
- Intégration dans `app/api/chat/route.ts` et `app/api/chat/stream/route.ts`
- Ajout automatique du profil utilisateur dans le prompt système

### 4. **Prompt dynamique enrichi**
Le prompt système inclut maintenant :

```
📋 PROFIL DE L'UTILISATEUR (Personne accompagnée - Santé):
• Démarches antérieures: oui
• Documents possédés: carte_sejour
• Genre: male
• Âge: 25
• Niveau de français: b1
• Langue courante: french
• Ville de domiciliation: Paris
• Département de domiciliation: 75
• Situation de handicap: non
• Enfants: 0
• Couverture sociale: yes

💡 INSTRUCTIONS SPÉCIALES:
- Adapte tes réponses en fonction du profil de l'utilisateur ci-dessus
- Prends en compte leur niveau de français, leur situation administrative, et leurs besoins spécifiques
- Propose des solutions adaptées à leur contexte personnel
- Utilise un langage approprié à leur niveau de compréhension
```

## 🚀 Utilisation

### Pour les développeurs

1. **Récupérer les données de qualification** :
```typescript
import { getQualificationData } from '@/lib/utils'

const qualData = getQualificationData('Santé', 'accompagne')
```

2. **Formater pour le prompt** :
```typescript
import { formatQualificationForPrompt } from '@/lib/utils'

const prompt = formatQualificationForPrompt(qualData, 'Santé')
```

3. **Intégrer dans une requête API** :
```typescript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Ma question",
    userNumero: "user123",
    userType: "accompagne",
    theme: "Santé",
    qualificationData: qualData
  })
})
```

### Pour les utilisateurs

1. **Accéder à une catégorie** (Santé, Emploi, etc.)
2. **Répondre aux questions de qualification**
3. **Les réponses sont automatiquement sauvegardées**
4. **Les messages suivants utilisent le profil personnalisé**

## 📊 Structure des données

### Interface QualificationData
```typescript
interface QualificationData {
  category: string
  answers: string[]
  timestamp: number
  userType?: 'accompagne' | 'accompagnant'
}
```

### Stockage localStorage
```javascript
// Pour les accompagnés
localStorage.setItem('qualification_Santé', JSON.stringify({
  category: 'Santé',
  answers: ['yes', 'carte_sejour', 'male', '25', 'b1', ...],
  timestamp: 1703123456789
}))

// Pour les accompagnants
localStorage.setItem('qualification_Santé_accompagnant', JSON.stringify({
  category: 'Santé',
  answers: ['yes', 'carte_sejour', 'male', '25', 'b1', ...],
  timestamp: 1703123456789,
  userType: 'accompagnant'
}))
```

## 🎯 Avantages du système

### 1. **Personnalisation automatique**
- Le LLM adapte ses réponses selon le profil de l'utilisateur
- Langage adapté au niveau de français
- Solutions spécifiques à la situation administrative

### 2. **Contexte enrichi**
- Prise en compte des documents possédés
- Adaptation selon la durée de résidence
- Considération des besoins spécifiques (handicap, enfants, etc.)

### 3. **Expérience utilisateur améliorée**
- Pas besoin de répéter les informations
- Réponses plus pertinentes et précises
- Accompagnement personnalisé

### 4. **Flexibilité**
- Système optionnel (fonctionne sans qualification)
- Expiration automatique des données
- Support des deux types d'utilisateurs

## 🧪 Tests et débogage

### Page de test
Accédez à `/test-progress` pour :
- Voir toutes les qualifications sauvegardées
- Tester le formatage des prompts
- Effacer les données de test
- Vérifier le bon fonctionnement du système

### Logs de débogage
Les APIs loggent les données de qualification :
```
🚀 Appel OpenAI direct pour: Ma question
📋 PROFIL DE L'UTILISATEUR (Personne accompagnée - Santé):
• Démarches antérieures: yes
...
```

## 🔄 Flux complet

1. **Utilisateur accède à une catégorie**
2. **Répond aux questions de qualification**
3. **Données sauvegardées dans localStorage**
4. **Utilisateur envoie un message**
5. **ChatContext récupère les données de qualification**
6. **API intègre le profil dans le prompt système**
7. **LLM génère une réponse personnalisée**

## 🛠️ Maintenance

### Nettoyage automatique
- Les données expirent après 7 jours
- Fonction de nettoyage manuel disponible

### Évolutivité
- Facile d'ajouter de nouvelles questions
- Support des nouvelles catégories
- Extension possible vers d'autres types de données

## 📈 Métriques

Le système permet de :
- Mesurer l'utilisation des qualifications
- Analyser les profils des utilisateurs
- Améliorer les questions de qualification
- Optimiser les réponses du LLM

---

**Note** : Ce système améliore significativement la pertinence des réponses en fournissant un contexte riche et personnalisé au LLM, tout en respectant la vie privée des utilisateurs (données locales uniquement). 