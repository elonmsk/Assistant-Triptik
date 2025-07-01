export interface ScrapingResult {
  url: string
  content: string
  title?: string
  success: boolean
  error?: string
  scrapedAt: Date
}

export interface BrightDataConfig {
  apiKey: string
  baseUrl?: string
  retryAttempts?: number
  timeout?: number
}

export class BrightDataClient {
  private apiKey: string
  private baseUrl: string
  private retryAttempts: number
  private timeout: number

  constructor(apiKey: string, config?: Partial<BrightDataConfig>) {
    this.apiKey = apiKey
    this.baseUrl = config?.baseUrl || 'https://api.brightdata.com'
    this.retryAttempts = config?.retryAttempts || 3
    this.timeout = config?.timeout || 30000
  }

  async scrapeAmeliPage(url: string): Promise<ScrapingResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.makeScrapingRequest(url)
        
        if (response.success) {
          return {
            url,
            content: response.content,
            title: response.title,
            success: true,
            scrapedAt: new Date()
          }
        } else {
          throw new Error(response.error || 'Échec du scraping')
        }

      } catch (error) {
        lastError = error as Error
        
        if (attempt < this.retryAttempts) {
          // Délai exponentiel entre les tentatives
          await this.delay(Math.pow(2, attempt) * 1000)
          continue
        }
      }
    }

    return {
      url,
      content: '',
      success: false,
      error: lastError?.message || 'Échec après toutes les tentatives',
      scrapedAt: new Date()
    }
  }

  private async makeScrapingRequest(url: string): Promise<any> {
    const scrapeEndpoint = `${this.baseUrl}/scrape`
    
    const response = await fetch(scrapeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        format: 'markdown',
        options: {
          extract_content: true,
          extract_links: true,
          extract_title: true,
          timeout: this.timeout
        }
      }),
      signal: AbortSignal.timeout(this.timeout)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Méthode pour scraper plusieurs pages en parallèle
  async scrapeMultiplePages(urls: string[]): Promise<ScrapingResult[]> {
    const promises = urls.map(url => this.scrapeAmeliPage(url))
    return Promise.all(promises)
  }

  // Méthode pour recherche sur ameli.fr
  async searchAmeli(query: string): Promise<ScrapingResult[]> {
    const searchUrl = `https://www.ameli.fr/recherche?query=${encodeURIComponent(query)}`
    const result = await this.scrapeAmeliPage(searchUrl)
    
    if (result.success) {
      // Extraire les liens des résultats de recherche
      const links = this.extractSearchResultLinks(result.content)
      
      // Scraper les premières pages de résultats
      return this.scrapeMultiplePages(links.slice(0, 3))
    }
    
    return [result]
  }

  private extractSearchResultLinks(content: string): string[] {
    // Regex pour extraire les liens des résultats de recherche ameli.fr
    const linkRegex = /href="(https:\/\/www\.ameli\.fr[^"]+)"/g
    const links: string[] = []
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      if (!links.includes(match[1])) {
        links.push(match[1])
      }
    }

    return links
  }
}

export default BrightDataClient 