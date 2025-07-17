# 🚀 Guide d'Intégration - Système de Chat LLM

## ✅ Ce qui a été implémenté

### 📊 **1. Structure de base de données**
- **Script SQL créé** : `sql/create_chat_tables.sql`
- **Tables à créer dans Supabase** :
  - `conversations` : stockage des conversations par utilisateur
  - `messages` : messages individuels avec rôles (user/assistant)
- **Sécurité** : Row Level Security (RLS) activé

### 🔌 **2. Routes API créées**
- **`/api/chat`** : Communication avec LLM + sauvegarde messages
- **`/api/conversations`** : CRUD conversations (GET, POST, DELETE)
- **`/api/conversations/[id]/messages`** : Gestion messages par conversation

### ⚛️ **3. Contexte React**
- **`contexts/ChatContext.tsx`** : Gestion d'état globale
- **Hook `useChat()`** : Interface simple pour les composants
- **Provider intégré** dans `app/layout.tsx`

### 🎨 **4. Composants UI**
- **`MessageList`** : Affichage des messages avec scroll auto
- **`TypingIndicator`** : Animation quand l'assistant écrit
- **`ChatHistoryPanel`** : Panneau latéral avec historique
- **`ChatInterface`** : Interface complète de chat
- **`ChatInput` mis à jour** : Intégration avec le contexte

---

## 🔧 Configuration requise

### **1. Créer les tables Supabase**
Exécutez le script SQL suivant dans votre interface Supabase :

```sql
-- Voir le fichier sql/create_chat_tables.sql
```

### **2. Variables d'environnement**
Créez un fichier `.env.local` :

```env
RENDER_LLM_URL=https://votre-api-render.com/api/chat
RENDER_API_KEY=votre_cle_api_render
```

### **3. Adaptez l'API LLM**
Dans `app/api/chat/route.ts`, modifiez la fonction `callRenderLLM()` selon votre API :

```typescript
// TODO: Adapter selon l'interface de votre API Render
const response = await fetch(RENDER_LLM_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RENDER_API_KEY}`,
  },
  body: JSON.stringify({
    // Format à adapter selon votre API
    messages: [...],
    // ... autres paramètres
  })
})
```

---

## 🔄 Intégration dans vos pages existantes

### **Option 1 : Interface complète**
```tsx
import { ChatInterface } from '@/components/chat'

export default function MaPage() {
  return (
    <ChatInterface 
      userNumero="123456"
      userType="accompagne"
      theme="Santé"
    />
  )
}
```

### **Option 2 : Intégration partielle**
```tsx
import { useChat } from '@/components/chat'
import ChatInput from '@/components/ui-custom/chat-input'

export default function AccompagnePage() {
  const { setUserInfo } = useChat()
  
  useEffect(() => {
    setUserInfo("123456", "accompagne")
  }, [])

  return (
    <div>
      {/* Votre contenu existant */}
      <ChatInput theme="Emploi" />
    </div>
  )
}
```

---

## 🧪 Tests d'intégration

### **1. Interface de test intégrée**
**✅ Page de test créée** : Accédez à `http://localhost:3000/test-chat`

Cette page vous permet de tester :
- Interface complète de chat
- Envoi de messages
- Historique des conversations
- Connexion avec LLM

### **2. Test dans vos pages existantes**
**✅ Intégration automatique activée** :
- Page Accompagné : Chat initialisé automatiquement selon l'état de connexion
- Page Accompagnant : Chat initialisé automatiquement 
- Mode invité : Chat disponible même sans compte
- Thèmes : Chat utilise automatiquement la catégorie sélectionnée

### **3. Tester les routes API**
```bash
# Créer une conversation
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"userNumero":"123456","userType":"accompagne","theme":"Test"}'

# Envoyer un message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour","userNumero":"123456","userType":"accompagne"}'
```

---

## 🎯 Intégration avec les pages existantes

### **✅ Intégration terminée automatiquement**

**Page Accompagné** (`components/pages/accompagne-page.tsx`)
- ✅ Chat initialisé automatiquement avec le numéro utilisateur
- ✅ Support des utilisateurs connectés ET invités
- ✅ Thème automatiquement défini selon la catégorie sélectionnée
- ✅ Mode invité : chat disponible même sans compte

**Page Accompagnant** (`components/pages/accompagnant-page.tsx`)
- ✅ Chat initialisé automatiquement avec `userType="accompagnant"`
- ✅ Thème automatiquement défini selon la catégorie sélectionnée

### **🔧 Gestion intelligente des utilisateurs**
- **Connectés** : Utilise `localStorage.getItem("uid")` ou `localStorage.getItem("numero")`
- **Invités** : Génère un ID temporaire `guest_${timestamp}` 
- **Accompagnants** : ID générique ou récupéré depuis localStorage

### **✨ Fonctionnalités ajoutées**
- **Auto-détection** de l'état de connexion
- **Persistance** des conversations pour les utilisateurs connectés
- **Mode invité** temporaire pour tester sans compte
- **Intégration transparente** avec vos processus existants

---

## 🚀 Prochaines étapes

1. **✅ Exécuter le SQL** dans Supabase
2. **✅ Configurer variables d'environnement**
3. **✅ Adapter callRenderLLM()** à votre API
4. **✅ Tester avec une page simple**
5. **✅ Intégrer dans vos pages existantes**

---

## 🛠️ Fonctionnalités avancées (optionnelles)

- **Streaming de réponses** : Modifier l'API pour du streaming
- **Attachments** : Ajout de fichiers/images
- **Recherche** : Recherche dans l'historique
- **Export** : Export des conversations
- **Notifications** : Notifications temps réel

---

## 🐛 Dépannage

### Erreur "useChat must be used within ChatProvider"
- Vérifiez que `ChatProvider` entoure vos composants
- Le provider est dans `app/layout.tsx`

### API LLM ne répond pas
- Vérifiez l'URL et la clé API
- Testez directement votre API Render
- Regardez les logs dans `/api/chat`

### Messages ne s'affichent pas
- Vérifiez que les tables Supabase sont créées
- Vérifiez les permissions RLS
- Utilisez les outils de debug de Supabase

---

**💬 Votre système de chat est prêt ! Il ne reste plus qu'à configurer votre API LLM et créer les tables Supabase.** 