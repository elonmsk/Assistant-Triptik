# Indicateur de Progression - Assistant Triptik

## Vue d'ensemble

L'indicateur de progression permet aux utilisateurs de voir en temps réel où en est le traitement de leur requête dans l'assistant Triptik. Il affiche les différentes étapes du processus de génération de réponse.

## Étapes du processus

### 1. **Analyse** (15%)
- **Icône**: 🧠 (Brain)
- **Action**: Analyse de la question de l'utilisateur
- **Message**: "Analyse de votre question..."

### 2. **Recherche** (30%)
- **Icône**: 🔍 (Search)
- **Action**: Recherche d'informations pertinentes
- **Message**: "Recherche d'informations pertinentes..."

### 3. **Extraction** (50%)
- **Icône**: 🌐 (Globe)
- **Action**: Extraction des données depuis les sources
- **Message**: "Extraction des données..."

### 4. **Traitement** (70%)
- **Icône**: 📄 (FileText)
- **Action**: Traitement et organisation des informations
- **Message**: "Traitement des informations..."

### 5. **Génération** (85%)
- **Icône**: 🧠 (Brain)
- **Action**: Génération de la réponse finale
- **Message**: "Génération de la réponse..."

### 6. **Terminé** (100%)
- **Icône**: ✅ (CheckCircle)
- **Action**: Réponse complète
- **Message**: "Réponse terminée"

## Composants impliqués

### 1. **ProcessingIndicator.tsx**
- Composant d'affichage de l'indicateur de progression
- Affiche la barre de progression, les étapes et les messages
- Utilise les composants UI de shadcn/ui

### 2. **ChatContext.tsx**
- Gestion de l'état de progression
- Actions pour mettre à jour les étapes
- Intégration avec le streaming des messages

### 3. **ChatInterface.tsx**
- Intégration de l'indicateur dans l'interface
- Affichage conditionnel selon l'état

### 4. **API Stream (route.ts)**
- Envoi des étapes de progression via Server-Sent Events
- Simulation des délais pour une expérience utilisateur fluide

## Utilisation

### Dans le contexte de chat

```typescript
const { updateProcessingStep, resetProcessingState } = useChat()

// Mettre à jour une étape
updateProcessingStep('searching', 'Recherche en cours...', 30)

// Réinitialiser l'état
resetProcessingState()
```

### Dans l'API

```typescript
// Envoyer une étape de progression
controller.enqueue(encoder.encode(`data: ${JSON.stringify({
  type: 'processing_step',
  step: 'searching',
  message: 'Recherche d\'informations...',
  progress: 30
})}\n\n`))
```

## Personnalisation

### Ajouter une nouvelle étape

1. Ajouter le type dans `ProcessingStep`
2. Ajouter la configuration dans `stepConfig`
3. Mettre à jour la fonction `getStepOrder`
4. Ajouter l'étape dans l'API

### Modifier les messages

Les messages peuvent être personnalisés dans l'API en modifiant les objets envoyés via SSE.

### Modifier les couleurs

Les couleurs sont définies dans `stepConfig` avec les classes Tailwind CSS.

## Avantages

- **Transparence**: L'utilisateur sait exactement où en est son traitement
- **Engagement**: L'interface reste interactive pendant le traitement
- **Confiance**: L'utilisateur comprend que le système travaille
- **Feedback**: Messages informatifs sur chaque étape

## Délais simulés

Les délais entre les étapes sont simulés pour une expérience utilisateur fluide :
- Analyse: 500ms
- Recherche: 800ms
- Extraction: 600ms
- Traitement: 400ms
- Génération: 300ms

Ces délais peuvent être ajustés selon les besoins. 