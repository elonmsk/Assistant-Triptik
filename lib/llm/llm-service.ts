export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local'
  apiKey?: string
  model: string
  temperature?: number
  maxTokens?: number
  baseUrl?: string
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface LLMResponse {
  content: string
  tool_calls?: ToolCall[]
  finish_reason: 'stop' | 'tool_calls' | 'length'
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface LLMTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required: string[]
    }
  }
}

export abstract class LLMService {
  protected config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  abstract generateResponse(
    messages: LLMMessage[],
    tools?: LLMTool[]
  ): Promise<LLMResponse>

  abstract streamResponse(
    messages: LLMMessage[],
    onChunk: (chunk: string) => void,
    tools?: LLMTool[]
  ): Promise<LLMResponse>
}

export class OpenAIService extends LLMService {
  async generateResponse(
    messages: LLMMessage[],
    tools?: LLMTool[]
  ): Promise<LLMResponse> {
    try {
      // Validation des paramètres
      if (!this.config.apiKey) {
        throw new Error('Clé API OpenAI manquante')
      }

      if (!messages || messages.length === 0) {
        throw new Error('Messages requis pour OpenAI')
      }

      console.log('Configuration OpenAI:', {
        model: this.config.model,
        hasApiKey: !!this.config.apiKey,
        messagesCount: messages.length,
        toolsCount: tools?.length || 0
      })

      // Nettoyer les messages pour OpenAI (supprimer les undefined)
      const cleanMessages = messages.map(msg => {
        const cleanMsg: any = {
          role: msg.role,
          content: msg.content
        }
        
        if (msg.name) cleanMsg.name = msg.name
        if (msg.tool_calls) cleanMsg.tool_calls = msg.tool_calls
        if (msg.tool_call_id) cleanMsg.tool_call_id = msg.tool_call_id
        
        return cleanMsg
      })

      const requestBody: any = {
        model: this.config.model,
        messages: cleanMessages
      }

      // Gestion de la température selon le modèle
      // Les modèles O (o1, o3, o4) ne supportent pas temperature
      if (!this.config.model.match(/^o[1-9]/)) {
        requestBody.temperature = this.config.temperature || 0.7
      }

      // Gestion des tokens selon le modèle
      const maxTokens = this.config.maxTokens || 1500
      // Les modèles récents utilisent max_completion_tokens
      if (this.config.model.includes('gpt-4') || 
          this.config.model.match(/^o[1-9]/) ||
          this.config.model.includes('gpt-4.1')) {
        requestBody.max_completion_tokens = maxTokens
      } else {
        requestBody.max_tokens = maxTokens
      }

      // Ajouter les outils seulement s'ils sont présents et valides
      if (tools && tools.length > 0) {
        requestBody.tools = tools
        requestBody.tool_choice = 'auto'
      }

      console.log('Corps de la requête OpenAI:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erreur détaillée OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      const choice = data.choices[0]

      return {
        content: choice.message.content || '',
        tool_calls: choice.message.tool_calls,
        finish_reason: choice.finish_reason,
        usage: data.usage
      }

    } catch (error) {
      console.error('Erreur OpenAI:', error)
      throw error
    }
  }

  async streamResponse(
    messages: LLMMessage[],
    onChunk: (chunk: string) => void,
    tools?: LLMTool[]
  ): Promise<LLMResponse> {
    // Implémentation du streaming pour OpenAI
    // Pour le moment, on utilise la version non-streaming
    return this.generateResponse(messages, tools)
  }
}

export class AnthropicService extends LLMService {
  async generateResponse(
    messages: LLMMessage[],
    tools?: LLMTool[]
  ): Promise<LLMResponse> {
    try {
      // Conversion des messages pour Claude
      const systemMessage = messages.find(m => m.role === 'system')?.content || ''
      const conversationMessages = messages.filter(m => m.role !== 'system')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens || 1500,
          temperature: this.config.temperature || 0.7,
          system: systemMessage,
          messages: conversationMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })),
          tools: tools?.map(tool => ({
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        content: data.content[0]?.text || '',
        tool_calls: data.content.filter((c: any) => c.type === 'tool_use').map((c: any) => ({
          id: c.id,
          type: 'function',
          function: {
            name: c.name,
            arguments: JSON.stringify(c.input)
          }
        })),
        finish_reason: data.stop_reason === 'tool_use' ? 'tool_calls' : 'stop',
        usage: {
          prompt_tokens: data.usage?.input_tokens || 0,
          completion_tokens: data.usage?.output_tokens || 0,
          total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      }

    } catch (error) {
      console.error('Erreur Anthropic:', error)
      throw error
    }
  }

  async streamResponse(
    messages: LLMMessage[],
    onChunk: (chunk: string) => void,
    tools?: LLMTool[]
  ): Promise<LLMResponse> {
    return this.generateResponse(messages, tools)
  }
}

export class LLMServiceFactory {
  static create(config: LLMConfig): LLMService {
    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config)
      case 'anthropic':
        return new AnthropicService(config)
      default:
        throw new Error(`Provider ${config.provider} non supporté`)
    }
  }
}

export default LLMService 