// Script de test pour l'API chat
// Usage: node scripts/test-api.js

async function testChatAPI() {
  console.log('🧪 Test de l\'API Chat...')

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Je viens de Syrie, comment obtenir une carte vitale ?",
        action: "chat",
        userProfile: {
          country: "Syrie",
          age: 23
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log('✅ Réponse reçue:')
    console.log('📄 Succès:', data.success)
    
    if (data.success) {
      console.log('💬 Réponse:', data.data.response.substring(0, 200) + '...')
      console.log('🔗 Sources:', data.data.sources?.length || 0)
      console.log('📊 Métadonnées:', data.data.metadata)
    } else {
      console.log('❌ Erreur:', data.error)
    }

  } catch (error) {
    console.error('❌ Erreur de test:', error.message)
    
    // Test de fallback - suggestions
    console.log('\n🔄 Test des suggestions...')
    try {
      const suggestionsResponse = await fetch('http://localhost:3000/api/chat?action=suggestions')
      const suggestionsData = await suggestionsResponse.json()
      
      console.log('💡 Suggestions disponibles:', suggestionsData.data?.suggestions?.length || 0)
      
    } catch (fallbackError) {
      console.error('❌ Erreur suggestions:', fallbackError.message)
    }
  }
}

// Vérifier si le serveur est démarré
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/chat?action=health')
    const data = await response.json()
    console.log('🔍 État du serveur:', data.data?.status || 'inconnu')
    return true
  } catch (error) {
    console.error('❌ Serveur non accessible. Démarrez-le avec: npm run dev')
    return false
  }
}

async function main() {
  const serverRunning = await checkServer()
  if (serverRunning) {
    await testChatAPI()
  }
}

main().catch(console.error) 