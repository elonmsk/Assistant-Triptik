import BrightDataMCPClient from './bright-data-mcp-client'
import { HealthCategory } from './health-query-classifier'
import { AMELI_URL_MAPPING } from '../bright-data/ameli-urls'

export interface ScrapingResult {
  url: string
  content: string
  title?: string
  success: boolean
  error?: string
  scrapedAt: Date
}

export interface ScrapingStrategyConfig {
  maxPagesPerQuery: number
  priorityFirst: boolean
  parallelRequests: number
}

export interface ScrapingPlan {
  urls: string[]
  category: HealthCategory
  priority: number
  description: string
}

export class AmeliScrapingStrategy {
  private brightDataClient: BrightDataMCPClient
  private config: ScrapingStrategyConfig

  constructor(brightDataClient: BrightDataMCPClient, config?: Partial<ScrapingStrategyConfig>) {
    this.brightDataClient = brightDataClient
    this.config = {
      maxPagesPerQuery: 3,
      priorityFirst: true,
      parallelRequests: 2,
      ...config
    }
  }

  async createScrapingPlan(
    category: HealthCategory,
    userContext?: any
  ): Promise<ScrapingPlan> {
    const urlMappings = AMELI_URL_MAPPING[category] || []
    
    // Trier par priorité si activé
    let sortedUrls = [...urlMappings]
    if (this.config.priorityFirst) {
      sortedUrls.sort((a, b) => a.priority - b.priority)
    }

    // Limiter le nombre de pages
    const selectedUrls = sortedUrls
      .slice(0, this.config.maxPagesPerQuery)
      .map(mapping => mapping.url)

    // Adapter selon le contexte utilisateur
    const adaptedUrls = this.adaptUrlsToUserContext(selectedUrls, userContext)

    return {
      urls: adaptedUrls,
      category,
      priority: Math.min(...sortedUrls.map(u => u.priority)),
      description: `Scraping ${adaptedUrls.length} pages for category ${category}`
    }
  }

  private adaptUrlsToUserContext(urls: string[], userContext?: any): string[] {
    if (!userContext) return urls

    // Ajouter des URLs spécifiques selon le contexte
    const adaptedUrls = [...urls]

    // Si utilisateur étranger, ajouter des pages spécifiques
    if (userContext.country && userContext.country !== 'France') {
      adaptedUrls.unshift(
        'https://www.ameli.fr/assure/droits-demarches/europe-international'
      )
    }

    // Si demandeur d'asile
    if (userContext.status === 'asylum_seeker') {
      adaptedUrls.unshift(
        'https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-france/demandeur-d-asile'
      )
    }

    // Si étudiant
    if (userContext.status === 'student') {
      adaptedUrls.push(
        'https://www.ameli.fr/assure/droits-demarches/europe-international/etudiant-etranger'
      )
    }

    return adaptedUrls
  }

  async executeScrapingPlan(plan: ScrapingPlan): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = []

    // Scraper en parallèle selon la configuration
    const chunks = this.chunkArray(plan.urls, this.config.parallelRequests)
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(url => 
        this.brightDataClient.scrapeAmeliPage(url)
      )
      
      const chunkResults = await Promise.allSettled(chunkPromises)
      
      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error('Erreur scraping:', result.reason)
          // Ajouter un résultat d'erreur
          results.push({
            url: 'unknown',
            content: '',
            success: false,
            error: result.reason?.message || 'Erreur inconnue',
            scrapedAt: new Date()
          })
        }
      }
    }

    return results
  }

  async scrapeForHealthQuery(
    category: HealthCategory,
    userContext?: any
  ): Promise<ScrapingResult[]> {
    const plan = await this.createScrapingPlan(category, userContext)
    return this.executeScrapingPlan(plan)
  }

  async scrapeUrls(urls: string[]): Promise<ScrapingResult[]> {
    const plan: ScrapingPlan = {
      urls: urls,
      category: HealthCategory.GENERAL, // Catégorie par défaut car dynamique
      priority: 1,
      description: `Scraping ${urls.length} dynamically found pages`
    }
    return this.executeScrapingPlan(plan)
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  // Méthode pour obtenir des statistiques
  getStrategyStats() {
    return {
      maxPagesPerQuery: this.config.maxPagesPerQuery,
      priorityFirst: this.config.priorityFirst,
      parallelRequests: this.config.parallelRequests
    }
  }
}

export default AmeliScrapingStrategy 