import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import BrightDataFallbackClient from './bright-data-fallback-client'

export interface BrightDataMCPConfig {
  apiToken: string
  webUnlockerZone: string
  browserAuth: string
}

export interface MCPRequest {
  jsonrpc: string
  id: string | number
  method: string
  params?: any
}

export interface MCPResponse {
  jsonrpc: string
  id: string | number
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

export class BrightDataMCPClient extends EventEmitter {
  private mcpProcess: ChildProcess | null = null
  private config: BrightDataMCPConfig
  private requestId = 0
  private pendingRequests = new Map<string | number, {
    resolve: (value: any) => void
    reject: (error: any) => void
  }>()
  private fallbackClient: BrightDataFallbackClient
  private useFallback = false

  constructor(config: BrightDataMCPConfig) {
    super()
    this.config = config
    this.fallbackClient = new BrightDataFallbackClient(config)
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Démarrer le serveur MCP Bright Data avec gestion Windows
        const isWindows = process.platform === 'win32'
        const command = isWindows ? 'npx.cmd' : 'npx'
        
        this.mcpProcess = spawn(command, ['@brightdata/mcp'], {
          env: {
            ...process.env,
            API_TOKEN: this.config.apiToken,
            WEB_UNLOCKER_ZONE: this.config.webUnlockerZone,
            BROWSER_AUTH: this.config.browserAuth
          },
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: isWindows
        })

        if (!this.mcpProcess.stdout || !this.mcpProcess.stdin) {
          throw new Error('Impossible de créer les pipes pour le processus MCP')
        }

        // Gérer les messages du serveur MCP
        this.mcpProcess.stdout.on('data', (data) => {
          const lines = data.toString().split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            try {
              const message: MCPResponse = JSON.parse(line)
              this.handleMCPResponse(message)
            } catch (error) {
              console.error('Erreur parsing message MCP:', error, 'Line:', line)
            }
          }
        })

        this.mcpProcess.stderr?.on('data', (data) => {
          console.error('MCP stderr:', data.toString())
        })

        this.mcpProcess.on('error', (error) => {
          console.error('Erreur processus MCP:', error)
          console.log('🔄 Basculement vers le mode fallback')
          this.useFallback = true
          resolve() // Continuer avec le fallback
        })

        this.mcpProcess.on('exit', (code) => {
          console.log('Processus MCP fermé avec le code:', code)
          this.mcpProcess = null
        })

        // Initialiser la connexion MCP
        this.sendMCPRequest('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'assistant-triptik',
            version: '1.0.0'
          }
        }).then(() => {
          resolve()
        }).catch(reject)

      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMCPResponse(message: MCPResponse): void {
    const pending = this.pendingRequests.get(message.id)
    
    if (pending) {
      this.pendingRequests.delete(message.id)
      
      if (message.error) {
        pending.reject(new Error(message.error.message))
      } else {
        pending.resolve(message.result)
      }
    }
  }

  private async sendMCPRequest(method: string, params?: any): Promise<any> {
    if (!this.mcpProcess || !this.mcpProcess.stdin) {
      throw new Error('Processus MCP non initialisé')
    }

    const id = ++this.requestId
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    }

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      
      const requestLine = JSON.stringify(request) + '\n'
      this.mcpProcess!.stdin!.write(requestLine)
      
      // Timeout après 60 secondes (scraping peut être long)
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Timeout requête MCP'))
        }
      }, 60000)
    })
  }

  // Méthodes pour utiliser les outils Bright Data via MCP

  async scrapeAsMarkdown(url: string): Promise<string> {
    try {
      const result = await this.sendMCPRequest('tools/call', {
        name: 'scrape_as_markdown',
        arguments: { url }
      })
      
      return result.content || result.result || ''
    } catch (error) {
      console.error('Erreur scraping markdown:', error)
      throw error
    }
  }

  async scrapeAsHTML(url: string): Promise<string> {
    try {
      const result = await this.sendMCPRequest('tools/call', {
        name: 'scrape_as_html',
        arguments: { url }
      })
      
      return result.content || result.result || ''
    } catch (error) {
      console.error('Erreur scraping HTML:', error)
      throw error
    }
  }

  async searchEngine(query: string, engine: 'google' | 'bing' | 'yandex' = 'google'): Promise<any> {
    try {
      const result = await this.sendMCPRequest('tools/call', {
        name: 'search_engine',
        arguments: { query, engine }
      })
      
      return result
    } catch (error) {
      console.error('Erreur recherche moteur:', error)
      throw error
    }
  }

  async getAvailableTools(): Promise<any[]> {
    try {
      const result = await this.sendMCPRequest('tools/list', {})
      return result.tools || []
    } catch (error) {
      console.error('Erreur liste outils:', error)
      return []
    }
  }

  async close(): Promise<void> {
    if (this.mcpProcess) {
      this.mcpProcess.kill()
      this.mcpProcess = null
    }
    this.pendingRequests.clear()
  }

  // Méthodes spécialisées pour ameli.fr

  async scrapeAmeliPage(url: string): Promise<{
    url: string,
    content: string,
    success: boolean,
    error?: string,
    scrapedAt?: Date
  }> {
    // Utiliser le fallback si le MCP n'est pas disponible
    if (this.useFallback) {
      const fallbackResult = await this.fallbackClient.scrapeAmeliPage(url)
      return {
        url,
        content: fallbackResult.content,
        success: fallbackResult.success,
        error: fallbackResult.error,
        scrapedAt: new Date()
      }
    }

    try {
      const content = await this.scrapeAsMarkdown(url)
      return {
        url,
        content,
        success: true,
        scrapedAt: new Date()
      }
    } catch (error) {
      console.log('🔄 Erreur MCP, basculement vers fallback pour cette requête')
      return {
        url,
        content: '',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        scrapedAt: new Date()
      }
    }
  }

  async searchAmeliContent(query: string): Promise<{
    results: string[]
    success: boolean
    error?: string
  }> {
    // Utiliser le fallback si le MCP n'est pas disponible
    if (this.useFallback) {
      return this.fallbackClient.searchAmeliContent(query)
    }

    try {
      // Rechercher sur ameli.fr via Google
      const searchQuery = query
      const searchResults = await this.searchEngine(searchQuery, 'google')
      
      // Extraire les URLs ameli.fr des résultats avec une regex robuste
      const ameliUrls: string[] = []
      const urlRegex = /https:\/\/(?:www\.ameli\.fr|www\.service-public\.fr)\/[\w\/.-]+/g
      
      if (searchResults && Array.isArray(searchResults.content) && searchResults.content.length > 0 && searchResults.content[0].text) {
        const rawText = searchResults.content[0].text
        let match
        while ((match = urlRegex.exec(rawText)) !== null) {
          // Éviter les doublons
          if (!ameliUrls.includes(match[0])) {
            ameliUrls.push(match[0])
          }
        }
      }
      
      return {
        results: ameliUrls.slice(0, 5), // Limiter à 5 résultats
        success: true
      }
    } catch (error) {
      console.log('🔄 Erreur recherche MCP, basculement vers fallback')
      return this.fallbackClient.searchAmeliContent(query)
    }
  }
}

export default BrightDataMCPClient 