// Script de validation de la configuration
// Usage: node scripts/validate-config.js

const validOpenAIModels = [
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4-turbo-preview',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-1106-preview',
  'gpt-4-0125-preview',
  // Série O (modèles de raisonnement)
  'o1',
  'o1-mini',
  'o1-preview',
  'o3',
  'o3-mini',
  'o4-mini-2025-04-16',
  // Série GPT-4.1
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano'
]

function validateConfig() {
  console.log('🔍 Validation de la configuration...\n')
  
  const config = {
    LLM_PROVIDER: process.env.LLM_PROVIDER || 'openai',
    LLM_API_KEY: process.env.LLM_API_KEY,
    LLM_MODEL: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    BRIGHT_DATA_API_KEY: process.env.BRIGHT_DATA_API_KEY
  }

  let isValid = true

  // Validation du provider
  console.log('📡 Provider LLM:', config.LLM_PROVIDER)
  if (!['openai', 'anthropic'].includes(config.LLM_PROVIDER)) {
    console.error('❌ Provider invalide. Utilisez "openai" ou "anthropic"')
    isValid = false
  } else {
    console.log('✅ Provider valide')
  }

  // Validation de la clé API
  console.log('\n🔑 Clé API LLM:', config.LLM_API_KEY ? '***configurée***' : '❌ MANQUANTE')
  if (!config.LLM_API_KEY) {
    console.error('❌ Clé API LLM manquante. Configurez LLM_API_KEY dans .env.local')
    isValid = false
  }

  // Validation du modèle OpenAI
  if (config.LLM_PROVIDER === 'openai') {
    console.log('\n🤖 Modèle OpenAI:', config.LLM_MODEL)
    if (!validOpenAIModels.includes(config.LLM_MODEL)) {
      console.error('❌ Modèle OpenAI invalide!')
      console.log('📋 Modèles valides:')
      validOpenAIModels.forEach(model => console.log(`   - ${model}`))
      console.log('\n💡 Suggestion: Utilisez "gpt-3.5-turbo" pour commencer')
      isValid = false
    } else {
      console.log('✅ Modèle valide')
    }
  }

  // Validation Bright Data
  console.log('\n🌐 Clé Bright Data:', config.BRIGHT_DATA_API_KEY ? '***configurée***' : '⚠️  manquante (mode dégradé)')

  // Résumé
  console.log('\n' + '='.repeat(50))
  if (isValid) {
    console.log('✅ Configuration valide! Vous pouvez démarrer l\'application.')
  } else {
    console.log('❌ Configuration invalide. Corrigez les erreurs ci-dessus.')
    console.log('\n📋 Pour corriger:')
    console.log('1. Créez un fichier .env.local à la racine')
    console.log('2. Copiez les variables depuis env-example.txt')
    console.log('3. Remplacez par vos vraies clés API')
    process.exit(1)
  }

  console.log('\n🚀 Pour tester: npm run dev')
}

validateConfig() 