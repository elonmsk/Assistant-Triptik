import { LLMService, LLMServiceFactory, LLMMessage, LLMTool, ToolCall } from '../llm/llm-service'
import HealthMCPServer from './health-server'
import { HealthCategory } from './health-query-classifier'

export interface MCPOrchestratorConfig {
  llm: {
    provider: 'openai' | 'anthropic'
    apiKey: string
    model: string
    temperature?: number
  }
  mcp: {
    brightData: {
      apiToken: string
      webUnlockerZone: string
      browserAuth: string
    }
    cacheEnabled: boolean
    maxCacheAge: number
    ameliBaseUrl: string
  }
}

export interface ConversationContext {
  userId?: string
  userProfile?: {
    country?: string
    age?: number
    status?: string
    language?: string
  }
  conversationHistory: LLMMessage[]
  sessionId: string
}

export class MCPOrchestrator {
  private llmService: LLMService
  private healthMCPServer: HealthMCPServer
  private systemPrompt: string

  constructor(config: MCPOrchestratorConfig) {
    // Initialiser le service LLM
    this.llmService = LLMServiceFactory.create({
      provider: config.llm.provider,
      apiKey: config.llm.apiKey,
      model: config.llm.model,
      temperature: config.llm.temperature || 0.7,
      maxTokens: 3000
    })

    // Initialiser le serveur MCP Health
    this.healthMCPServer = new HealthMCPServer(config.mcp)

    // Prompt système spécialisé santé française
    this.systemPrompt = this.createSystemPrompt()
  }

  private createSystemPrompt(): string {
    return `Tu es un assistant IA spécialisé dans les questions de santé en France, en particulier pour aider avec les démarches administratives liées à l'assurance maladie française (ameli.fr).

**Ton rôle :**
- Aider les utilisateurs avec leurs questions sur la carte vitale, remboursements, affiliation, etc.
- Fournir des informations précises basées sur les données officielles d'ameli.fr
- Être particulièrement attentif aux situations spécifiques (étrangers, demandeurs d'asile)
- Proposer des solutions pratiques et des étapes concrètes

**Outils à ta disposition :**
1. **search_ameli_health** : Rechercher des informations sur ameli.fr selon une question santé
2. **get_health_suggestions** : Obtenir des suggestions de questions selon le profil utilisateur
3. **scrape_specific_ameli_page** : Scraper une page spécifique d'ameli.fr
4. **classify_health_query** : Analyser et catégoriser une question de santé

**Instructions importantes :**
- Utilise TOUJOURS les outils pour obtenir des informations récentes d'ameli.fr
- Cite tes sources (URLs ameli.fr) dans tes réponses
- Adapte tes réponses selon le profil de l'utilisateur (pays d'origine, âge, statut)
- Si tu n'es pas sûr, utilise les outils pour vérifier
- Sois empathique, surtout avec les personnes en situation vulnérable
- Réponds en français de manière claire et structurée

**Format de réponse préféré :**
1. Réponse directe à la question
2. Étapes pratiques à suivre
3. Sources et liens utiles
4. Informations complémentaires si pertinentes

Commence toujours par comprendre la situation de l'utilisateur avant de proposer une solution.`
  }

  private getAvailableTools(): LLMTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'search_ameli_health',
          description: 'Rechercher des informations de santé sur ameli.fr en fonction d\'une question spécifique',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'La question de santé de l\'utilisateur'
              },
              userContext: {
                type: 'object',
                description: 'Contexte de l\'utilisateur (pays, âge, statut)',
                properties: {
                  country: { type: 'string' },
                  age: { type: 'number' },
                  status: { type: 'string' }
                }
              }
            },
            required: ['query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_health_suggestions',
          description: 'Obtenir des suggestions de questions de santé selon le profil utilisateur',
          parameters: {
            type: 'object',
            properties: {
              userProfile: {
                type: 'object',
                description: 'Profil de l\'utilisateur',
                properties: {
                  country: { type: 'string' },
                  age: { type: 'number' },
                  status: { type: 'string' }
                }
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'scrape_specific_ameli_page',
          description: 'Scraper une page spécifique d\'ameli.fr pour obtenir des informations détaillées',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL complète de la page ameli.fr à scraper'
              }
            },
            required: ['url']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'classify_health_query',
          description: 'Analyser et catégoriser une question de santé pour mieux comprendre l\'intention',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'La question à analyser'
              }
            },
            required: ['query']
          }
        }
      }
    ]
  }

  async processUserMessage(
    userMessage: string,
    context: ConversationContext
  ): Promise<{
    response: string
    updatedContext: ConversationContext
    sources?: string[]
    metadata?: any
  }> {
    try {
      // Ajouter le message utilisateur au contexte
      const updatedHistory: LLMMessage[] = [
        ...context.conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ]

      // Préparer les messages pour le LLM
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: this.systemPrompt
        },
        ...updatedHistory
      ]

      // Obtenir la réponse du LLM avec les outils
      const llmResponse = await this.llmService.generateResponse(
        messages,
        this.getAvailableTools()
      )

      let finalResponse = llmResponse.content
      let sources: string[] = []
      let metadata: any = {}

      // Traiter les appels d'outils si nécessaire
      if (llmResponse.tool_calls && llmResponse.tool_calls.length > 0) {
        const toolResults = await this.executeToolCalls(
          llmResponse.tool_calls,
          context.userProfile
        )

        // Ajouter les résultats des outils aux messages
        const toolMessages: LLMMessage[] = [
          {
            role: 'assistant',
            content: llmResponse.content,
            tool_calls: llmResponse.tool_calls
          },
          ...toolResults.map(result => ({
            role: 'tool' as const,
            content: result.content,
            tool_call_id: result.tool_call_id,
            name: result.function_name
          }))
        ]

        // Obtenir la réponse finale du LLM avec les résultats des outils
        const finalLLMResponse = await this.llmService.generateResponse([
          ...messages,
          ...toolMessages
        ])

        finalResponse = finalLLMResponse.content
        sources = toolResults.flatMap(r => r.sources || [])
        metadata = {
          tool_calls_made: llmResponse.tool_calls.length,
          functions_used: toolResults.map(r => r.function_name),
          total_tokens: (llmResponse.usage?.total_tokens || 0) + (finalLLMResponse.usage?.total_tokens || 0)
        }
      }

      // Mettre à jour le contexte de conversation
      const updatedContext: ConversationContext = {
        ...context,
        conversationHistory: [
          ...updatedHistory,
          {
            role: 'assistant',
            content: finalResponse
          }
        ]
      }

      return {
        response: finalResponse,
        updatedContext,
        sources,
        metadata
      }

    } catch (error) {
      console.error('Erreur MCPOrchestrator:', error)
      throw error
    }
  }

  private async executeToolCalls(
    toolCalls: ToolCall[],
    userProfile?: any
  ): Promise<Array<{
    tool_call_id: string
    function_name: string
    content: string
    sources?: string[]
  }>> {
    const results = []

    for (const toolCall of toolCalls) {
      try {
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)

        let result: any = {}

        switch (functionName) {
          case 'search_ameli_health':
            result = await this.healthMCPServer.processHealthQuery(
              args.query,
              args.userContext || userProfile
            )
            break

          case 'get_health_suggestions':
            const suggestions = await this.healthMCPServer.getHealthSuggestions(
              args.userProfile || userProfile
            )
            result = { suggestions }
            break

          case 'scrape_specific_ameli_page':
            // Pour le scraping d'une page spécifique, on utilise directement le client Bright Data
            result = await this.scrapeSpecificPage(args.url)
            break

          case 'classify_health_query':
            // Utiliser le classificateur directement
            const classifier = new (await import('./health-query-classifier')).HealthQueryClassifier()
            result = await classifier.classify(args.query)
            break

          default:
            result = { error: `Fonction ${functionName} non reconnue` }
        }

        results.push({
          tool_call_id: toolCall.id,
          function_name: functionName,
          content: JSON.stringify(result),
          sources: result.sources || []
        })

      } catch (error) {
        results.push({
          tool_call_id: toolCall.id,
          function_name: toolCall.function.name,
          content: JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' })
        })
      }
    }

    return results
  }

  private async scrapeSpecificPage(url: string): Promise<any> {
    // Utiliser le client Bright Data pour scraper une page spécifique
    const BrightDataClient = (await import('../bright-data/client')).BrightDataClient
    const client = new BrightDataClient(process.env.BRIGHT_DATA_API_KEY || '')
    
    const result = await client.scrapeAmeliPage(url)
    return {
      content: result.content,
      success: result.success,
      sources: [url],
      scrapedAt: result.scrapedAt
    }
  }

  async createNewConversation(userId?: string, userProfile?: any): Promise<ConversationContext> {
    return {
      userId,
      userProfile,
      conversationHistory: [],
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }
}

export default MCPOrchestrator 