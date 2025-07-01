import BrightDataMCPClient, { BrightDataMCPConfig } from './bright-data-mcp-client'
import { HealthQueryClassifier, HealthCategory } from './health-query-classifier'
import { AmeliScrapingStrategy, ScrapingResult } from './ameli-scraping-strategy'
import { ResponseProcessor } from './response-processor'
import { QueryCache } from '../cache/query-cache'
import AmeliUrlMapper from '../bright-data/ameli-urls'

export interface HealthMCPConfig {
  brightData: BrightDataMCPConfig
  cacheEnabled: boolean
  maxCacheAge: number
  ameliBaseUrl: string
}

export class HealthMCPServer {
  private brightDataClient: BrightDataMCPClient
  private queryClassifier: HealthQueryClassifier
  private scrapingStrategy: AmeliScrapingStrategy
  private responseProcessor: ResponseProcessor
  private cache: QueryCache
  private config: HealthMCPConfig
  private initialized: boolean = false

  constructor(config: HealthMCPConfig) {
    this.config = config
    
    // Initialiser les composants
    this.brightDataClient = new BrightDataMCPClient(config.brightData)
    this.queryClassifier = new HealthQueryClassifier()
    this.scrapingStrategy = new AmeliScrapingStrategy(this.brightDataClient)
    this.responseProcessor = new ResponseProcessor()
    this.cache = new QueryCache({
      maxSize: 1000,
      defaultTTL: config.maxCacheAge,
      enableStats: true
    })
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.brightDataClient.initialize()
      this.initialized = true
    }
  }

  async processHealthQuery(query: string, userContext?: any): Promise<any> {
    try {
      // S'assurer que le client est initialisé
      await this.initialize()
      // 1. Vérifier le cache
      const cachedResult = await this.cache.getHealthQuery(query, userContext)
      if (cachedResult && this.config.cacheEnabled) {
        return {
          ...cachedResult,
          cached: true,
          timestamp: new Date()
        }
      }

      // 2. Classifier la requête
      const classification = await this.queryClassifier.classify(query)
      
      if (!classification.isHealthRelated) {
        return {
          success: false,
          error: 'Cette question ne semble pas liée à la santé',
          suggestion: 'Essayez de poser une question sur la carte vitale, les remboursements, ou l\'assurance maladie.'
        }
      }

      // 3. Générer le plan de scraping
      let urlsToScrape: string[] = []
      const searchResult = await this.brightDataClient.searchAmeliContent(query)
      if (searchResult.success && searchResult.results.length > 0) {
        urlsToScrape = searchResult.results
      } else {
        // Fallback: en cas d'échec de la recherche, on ne scrape rien
        // pour que l'erreur soit traitée plus tard.
        urlsToScrape = []
        if (searchResult.error) {
          console.error("ERREUR DE RECHERCHE DYNAMIQUE:", searchResult.error)
        }
      }

      // 3. Exécuter le scraping
      let scrapingResults: ScrapingResult[] = []

      if (urlsToScrape.length > 0) {
        // Si la recherche dynamique a trouvé des URLs, on les scrape directement.
        scrapingResults = await this.scrapingStrategy.scrapeUrls(urlsToScrape)
      } else {
        // Sinon, on utilise la stratégie basée sur les catégories (fallback)
        console.log(`[HealthMCPServer] La recherche dynamique n'a retourné aucune URL. Basculement vers la stratégie de scraping par catégorie : ${classification.category}`)
        scrapingResults = await this.scrapingStrategy.scrapeForHealthQuery(
          classification.category,
          userContext
        )
      }

      // ----- AJOUT POUR AFFICHER LE CONTENU SCRAPÉ -----
      for (const result of scrapingResults) {
        const content = typeof result.content === 'string' ? result.content : JSON.stringify(result.content)
        console.log(`CONTENU SCRAPÉ POUR ${result.url} :\n${content}\n---FIN---`)
      }
      // -------------------------------------------------

      // 4. Traiter les résultats
      const processedResponse = await this.responseProcessor.processScrapingResults(
        scrapingResults,
        classification,
        query
      )

      // 5. Mettre en cache si activé
      if (this.config.cacheEnabled && processedResponse.confidence > 0.7) {
        await this.cache.cacheHealthQuery(
          query,
          userContext,
          processedResponse,
          classification.category
        )
      }

      return {
        success: true,
        response: processedResponse.synthesizedAnswer,
        sources: processedResponse.sources,
        confidence: processedResponse.confidence,
        category: classification.category,
        metadata: processedResponse.metadata,
        cached: false,
        timestamp: new Date()
      }

    } catch (error) {
      console.error('Erreur dans processHealthQuery:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date()
      }
    }
  }

  async getHealthSuggestions(userProfile?: any): Promise<string[]> {
    const suggestions = [
      "Comment obtenir ma première carte vitale ?",
      "Comment me faire rembourser mes soins ?",
      "Comment choisir un médecin traitant ?",
      "Où trouver ma CPAM ?",
      "Comment renouveler ma carte vitale ?"
    ]

    // Personnaliser selon le profil
    if (userProfile?.country && userProfile.country !== 'France') {
      suggestions.unshift(
        "Quels sont mes droits en tant qu'étranger ?",
        "Comment m'affilier à l'assurance maladie française ?"
      )
    }

    if (userProfile?.status === 'asylum_seeker') {
      suggestions.unshift(
        "Quels sont mes droits en tant que demandeur d'asile ?",
        "Comment obtenir des soins d'urgence ?"
      )
    }

    if (userProfile?.age && userProfile.age > 65) {
      suggestions.push(
        "Comment fonctionne l'ALD (Affection Longue Durée) ?",
        "Quels sont les avantages pour les seniors ?"
      )
    }

    return suggestions.slice(0, 8)
  }

  async getSystemHealth(): Promise<any> {
    const cacheStats = this.cache.getStats()
    
    return {
      status: 'operational',
      components: {
        brightDataClient: 'connected',
        queryClassifier: 'operational',
        scrapingStrategy: 'operational',
        responseProcessor: 'operational',
        cache: {
          status: 'operational',
          stats: cacheStats
        }
      },
      config: {
        cacheEnabled: this.config.cacheEnabled,
        maxCacheAge: this.config.maxCacheAge,
        ameliBaseUrl: this.config.ameliBaseUrl
      },
      timestamp: new Date()
    }
  }

  // Méthodes utilitaires
  async clearCache(): Promise<void> {
    await this.cache.clear()
  }

  getCacheStats() {
    return this.cache.getStats()
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize()
      // Test simple de connexion avec une page ameli.fr
      const testResult = await this.brightDataClient.scrapeAmeliPage(
        'https://www.ameli.fr'
      )
      return testResult.success
    } catch (error) {
      console.error('Test de connexion échoué:', error)
      return false
    }
  }

  // Nettoyage à la destruction
  async destroy(): Promise<void> {
    this.cache.destroy()
    await this.brightDataClient.close()
  }
}

export default HealthMCPServer 