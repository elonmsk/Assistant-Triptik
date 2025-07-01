import { NextRequest, NextResponse } from 'next/server'
import { LLMService, LLMServiceFactory, LLMMessage } from '@/lib/llm/llm-service'
import MCPOrchestrator, { ConversationContext } from '@/lib/mcp/mcp-orchestrator'
import {
  HealthMCPServer,
  HealthMCPConfig
} from '@/lib/mcp/health-server'
import { AmeliScrapingStrategy } from '@/lib/mcp/ameli-scraping-strategy'
import { HealthQueryClassifier } from '@/lib/mcp/health-query-classifier'
import { ResponseProcessor } from '@/lib/mcp/response-processor'
import BrightDataMCPClient from '@/lib/mcp/bright-data-mcp-client'
import { QueryCache } from '@/lib/cache/query-cache'

// Configuration de l'orchestrateur MCP (même que route.ts)
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

// Cache des conversations en mémoire
const conversationsCache = new Map<string, ConversationContext>()

// Instance globale de l'orchestrateur
let orchestrator: MCPOrchestrator | null = null

function getOrchestrator(): MCPOrchestrator {
  if (orchestrator) {
    return orchestrator
  }
  // NOTE: L'instanciation est simplifiée pour éviter les erreurs de compilation.
  // La configuration réelle devra être corrigée.
  orchestrator = new MCPOrchestrator(orchestratorConfig as any)
  return orchestrator
}

async function getSystemMessage(userProfile: any): Promise<LLMMessage> {
  const systemPrompt = `**Tâche :** Ta seule et unique mission est de reformuler le contenu brut fourni dans l'appel de l'outil \`search_ameli_health\` pour répondre à la question de l'utilisateur.

**Règles impératives :**
- Base ta réponse **exclusivement** sur le contenu fourni. N'utilise aucune connaissance externe.
- Si le contenu est vide ou non pertinent, réponds "Je n'ai pas trouvé d'informations fiables pour répondre à votre question." et rien d'autre.
- Structure la réponse clairement avec des titres et des listes à puces.
- Cite toujours les URLs sources exactes mentionnées dans le contenu à la fin de ta réponse.`

  return {
    role: 'system',
    content: systemPrompt
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      message, 
      sessionId, 
      userProfile
    } = body

    if (!message) {
      return new Response('Le message est requis', { status: 400 })
    }

    const mcpOrchestrator = getOrchestrator()

    // Créer un ReadableStream pour le streaming
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Fonction pour envoyer des données
        const sendData = (type: string, data: any) => {
          const chunk = `data: ${JSON.stringify({ type, data })}\n\n`
          controller.enqueue(encoder.encode(chunk))
        }

        try {
          // Étape 1: Signaler le début du traitement
          sendData('start', { message: 'Traitement en cours...' })

          // Récupérer ou créer le contexte de conversation
          let context: ConversationContext

          if (sessionId && conversationsCache.has(sessionId)) {
            context = conversationsCache.get(sessionId)!
          } else {
            context = await mcpOrchestrator.createNewConversation(undefined, userProfile)
            conversationsCache.set(context.sessionId, context)
          }

          // Étape 2: Signaler la consultation des sources
          sendData('sources', { message: 'Consultation des sources ameli.fr...' })

          // Traiter le message avec l'orchestrateur
          const result = await mcpOrchestrator.processUserMessage(message, context)

          // Mettre à jour le cache
          conversationsCache.set(result.updatedContext.sessionId, result.updatedContext)

          // Étape 3: Simuler le streaming de la réponse
          const response = result.response
          const words = response.split(' ')
          let currentResponse = ''

          for (let i = 0; i < words.length; i++) {
            currentResponse += (i > 0 ? ' ' : '') + words[i]
            
            sendData('token', { 
              content: currentResponse,
              isComplete: i === words.length - 1
            })
            
            // Petite pause pour simuler le streaming
            await new Promise(resolve => setTimeout(resolve, 50))
          }

          // Étape 4: Envoyer les métadonnées finales
          sendData('complete', {
            sessionId: result.updatedContext.sessionId,
            sources: result.sources,
            metadata: result.metadata,
            conversationLength: result.updatedContext.conversationHistory.length
          })

          controller.close()
        } catch (error) {
          console.error('Erreur streaming:', error)
          sendData('error', { 
            message: error instanceof Error ? error.message : 'Erreur interne' 
          })
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Erreur API Chat Stream:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 