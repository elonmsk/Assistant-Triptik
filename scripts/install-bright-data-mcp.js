// Script d'installation du package MCP Bright Data
// Usage: node scripts/install-bright-data-mcp.js

const { execSync } = require('child_process')

async function installBrightDataMCP() {
  console.log('🚀 Installation du package MCP Bright Data...')
  
  try {
    // Installer le package global
    console.log('📦 Installation de @brightdata/mcp...')
    execSync('npm install -g @brightdata/mcp', { stdio: 'inherit' })
    
    console.log('✅ Package MCP Bright Data installé avec succès!')
    
    // Tester l'installation
    console.log('🧪 Test de l\'installation...')
    try {
      execSync('npx @brightdata/mcp --version', { stdio: 'inherit' })
      console.log('✅ Test réussi!')
    } catch (testError) {
      console.warn('⚠️ Test échoué, mais le package semble installé')
    }
    
    console.log(`
📋 Configuration requise dans votre .env.local :

BRIGHT_DATA_API_TOKEN=481767225aa68d17aeadaca63bb1ebd4c20fb25f7a9e1ad459d0676910cc62e7
BRIGHT_DATA_WEB_UNLOCKER_ZONE=web_unlocker1  
BRIGHT_DATA_BROWSER_AUTH=brd-customer-hl_b189d2cb-zone-scraping_browser1:l83vao83g80i

🎯 Le serveur MCP Bright Data est maintenant prêt à être utilisé!
`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'installation:', error.message)
    
    console.log(`
💡 Installation manuelle :
1. npm install -g @brightdata/mcp
2. Ou utilisez npx directement : npx @brightdata/mcp

📖 Documentation : https://docs.brightdata.com/mcp
`)
    
    process.exit(1)
  }
}

// Vérifier si Node.js est disponible
if (typeof process === 'undefined') {
  console.error('❌ Node.js requis pour ce script')
  process.exit(1)
}

installBrightDataMCP().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
}) 