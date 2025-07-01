// Script de test pour valider l'API LLM
// Usage: node scripts/test-llm.js

const { LLMServiceFactory } = require('../lib/llm/llm-service')

async function testLLM() {
  try {
    console.log('🧪 Test de l\'API LLM...')
    
    // Configuration de test
    const config = {
      provider: process.env.LLM_PROVIDER || 'openai',
      apiKey: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 100
    }

    console.log('📋 Configuration:', {
      provider: config.provider,
      model: config.model,
      hasApiKey: !!config.apiKey
    })

    if (!config.apiKey) {
      console.error('❌ Clé API manquante. Configurez LLM_API_KEY dans .env.local')
      process.exit(1)
    }

    const llmService = LLMServiceFactory.create(config)

    const messages = [
      {
        role: 'system',
        content: 'Tu es un assistant santé français. Réponds brièvement.'
      },
      {
        role: 'user',
        content: 'Bonjour, peux-tu me dire en une phrase ce que tu fais ?'
      }
    ]

    console.log('🚀 Envoi de la requête...')
    const response = await llmService.generateResponse(messages)

    console.log('✅ Succès!')
    console.log('📝 Réponse:', response.content)
    console.log('📊 Usage:', response.usage)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

testLLM() 