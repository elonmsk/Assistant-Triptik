import { NextRequest, NextResponse } from 'next/server'
import MCPOrchestrator, { ConversationContext } from '@/lib/mcp/mcp-orchestrator'

// Configuration de l'orchestrateur MCP
const orchestratorConfig = {
  llm: {
    provider: (process.env.LLM_PROVIDER as 'openai' | 'anthropic') || 'openai',
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    temperature: 0.7
  },
  mcp: {
    brightData: {
      apiToken: process.env.BRIGHT_DATA_API_TOKEN || '481767225aa68d17aeadaca63bb1ebd4c20fb25f7a9e1ad459d0676910cc62e7',
      webUnlockerZone: process.env.BRIGHT_DATA_WEB_UNLOCKER_ZONE || 'web_unlocker1',
      browserAuth: process.env.BRIGHT_DATA_BROWSER_AUTH || 'brd-customer-hl_b189d2cb-zone-scraping_browser1:l83vao83g80i'
    },
    cacheEnabled: true,
    maxCacheAge: 3600000,
    ameliBaseUrl: 'https://www.ameli.fr'
  }
}

// Cache des conversations en mémoire (en production, utiliser Redis)
const conversationsCache = new Map<string, ConversationContext>()

// Instance globale de l'orchestrateur
let orchestrator: MCPOrchestrator | null = null

function getOrchestrator(): MCPOrchestrator {
  if (!orchestrator) {
    orchestrator = new MCPOrchestrator(orchestratorConfig)
  }
  return orchestrator
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      message, 
      sessionId, 
      userProfile, 
      action = 'chat'
    } = body

    if (!message && action === 'chat') {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      )
    }

    const mcpOrchestrator = getOrchestrator()

    switch (action) {
      case 'chat':
        return await handleChatMessage(mcpOrchestrator, message, sessionId, userProfile)
      
      case 'new_conversation':
        return await handleNewConversation(mcpOrchestrator, userProfile)
      
      case 'get_suggestions':
        return await handleGetSuggestions(mcpOrchestrator, userProfile)
      
      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erreur API Chat:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

async function handleChatMessage(
  orchestrator: MCPOrchestrator,
  message: string,
  sessionId?: string,
  userProfile?: any
) {
  try {
    // Récupérer ou créer le contexte de conversation
    let context: ConversationContext

    if (sessionId && conversationsCache.has(sessionId)) {
      context = conversationsCache.get(sessionId)!
    } else {
      context = await orchestrator.createNewConversation(undefined, userProfile)
      conversationsCache.set(context.sessionId, context)
    }

    // Traiter le message avec l'orchestrateur
    const result = await orchestrator.processUserMessage(message, context)

    // Mettre à jour le cache
    conversationsCache.set(result.updatedContext.sessionId, result.updatedContext)

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        sessionId: result.updatedContext.sessionId,
        sources: result.sources,
        metadata: result.metadata,
        conversationLength: result.updatedContext.conversationHistory.length
      }
    })

  } catch (error) {
    console.error('Erreur handleChatMessage:', error)
    throw error
  }
}

async function handleNewConversation(
  orchestrator: MCPOrchestrator,
  userProfile?: any
) {
  try {
    const context = await orchestrator.createNewConversation(undefined, userProfile)
    conversationsCache.set(context.sessionId, context)

    // Message d'accueil personnalisé
    let welcomeMessage = "Bonjour ! Je suis votre assistant spécialisé en questions de santé en France. Je peux vous aider avec vos démarches concernant l'assurance maladie, la carte vitale, les remboursements, et bien plus."

    if (userProfile?.country && userProfile.country !== 'France') {
      welcomeMessage += ` Je vois que vous venez de ${userProfile.country}, je serai particulièrement attentif à votre situation spécifique.`
    }

    welcomeMessage += " Posez-moi votre question !"

    return NextResponse.json({
      success: true,
      data: {
        sessionId: context.sessionId,
        welcomeMessage,
        userProfile: context.userProfile
      }
    })

  } catch (error) {
    console.error('Erreur handleNewConversation:', error)
    throw error
  }
}

async function handleGetSuggestions(
  orchestrator: MCPOrchestrator,
  userProfile?: any
) {
  try {
    // Suggestions par défaut
    const defaultSuggestions = [
      "Comment obtenir ma première carte vitale ?",
      "Que faire si je suis étranger en France ?",
      "Comment me faire rembourser mes soins ?",
      "Comment choisir un médecin traitant ?",
      "Quels sont mes droits en tant que demandeur d'asile ?",
      "Comment contacter ma CPAM ?"
    ]

    // Suggestions personnalisées selon le profil
    let personalizedSuggestions = [...defaultSuggestions]
    
    if (userProfile?.country && userProfile.country !== 'France') {
      personalizedSuggestions = [
        `En tant que ressortissant de ${userProfile.country}, quels sont mes droits ?`,
        "Comment obtenir ma couverture maladie en France ?",
        "Puis-je bénéficier de l'AME ou de la CSS ?",
        ...defaultSuggestions.slice(1)
      ]
    }

    if (userProfile?.age && userProfile.age < 26) {
      personalizedSuggestions.unshift("Je suis étudiant, quelles aides puis-je avoir ?")
    }

    // Utiliser seulement des suggestions statiques pour éviter les appels LLM automatiques
    let contextualResponse = "Voici quelques questions fréquentes que je peux vous aider à résoudre."
    
    // Personnalisation du message selon le profil sans appel LLM
    if (userProfile?.country && userProfile.country !== 'France') {
      contextualResponse = `En tant que ressortissant de ${userProfile.country}, je peux vous aider avec vos démarches spécifiques en France.`
    }
    
    if (userProfile?.age && userProfile.age < 26) {
      contextualResponse += " Je suis également spécialisé dans les questions relatives aux jeunes et étudiants."
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestions: personalizedSuggestions.slice(0, 6),
        contextualResponse,
        fallbackMode: !orchestratorConfig.llm.apiKey
      }
    })

  } catch (error) {
    console.error('Erreur handleGetSuggestions:', error)
    
    // Fallback complet en cas d'erreur
    return NextResponse.json({
      success: true,
      data: {
        suggestions: [
          "Comment obtenir ma première carte vitale ?",
          "Que faire si je suis étranger en France ?",
          "Comment me faire rembourser mes soins ?",
          "Comment choisir un médecin traitant ?",
          "Comment contacter ma CPAM ?"
        ],
        contextualResponse: "Je suis là pour vous aider avec vos questions de santé en France.",
        fallbackMode: true
      }
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const sessionId = searchParams.get('sessionId')

    const mcpOrchestrator = getOrchestrator()

    switch (action) {
      case 'health':
        return NextResponse.json({
          success: true,
          data: {
            status: 'online',
            llm_provider: orchestratorConfig.llm.provider,
            llm_model: orchestratorConfig.llm.model,
            llm_configured: !!orchestratorConfig.llm.apiKey,
            bright_data_configured: !!orchestratorConfig.mcp.brightDataApiKey,
            active_conversations: conversationsCache.size,
            mcp_status: 'connected',
            warning: !orchestratorConfig.llm.apiKey ? 'LLM non configuré - mode dégradé activé' : undefined
          }
        })

      case 'conversation':
        if (!sessionId || !conversationsCache.has(sessionId)) {
          return NextResponse.json(
            { error: 'Session non trouvée' },
            { status: 404 }
          )
        }

        const context = conversationsCache.get(sessionId)!
        return NextResponse.json({
          success: true,
          data: {
            sessionId: context.sessionId,
            messageCount: context.conversationHistory.length,
            userProfile: context.userProfile
          }
        })

      case 'suggestions':
        return await handleGetSuggestions(mcpOrchestrator)

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erreur API Chat GET:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur interne'
    }, { status: 500 })
  }
}

// Nettoyage périodique du cache (optionnel)
setInterval(() => {
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000 // 24 heures

  for (const [sessionId, context] of conversationsCache.entries()) {
    const sessionAge = now - parseInt(sessionId.split('_')[1])
    if (sessionAge > maxAge) {
      conversationsCache.delete(sessionId)
    }
  }
}, 60 * 60 * 1000) // Nettoyer toutes les heures 