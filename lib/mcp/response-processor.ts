import { ScrapingResult } from '../bright-data/client'
import { HealthQueryClassification } from './health-query-classifier'

export interface ProcessedResponse {
  synthesizedAnswer: string
  sources: string[]
  confidence: number
  relevantSections: string[]
  metadata: {
    totalPages: number
    successfulScrapes: number
    processingTime: number
    category: string
  }
}

export interface ProcessingConfig {
  maxContentLength: number
  minConfidenceThreshold: number
  includeMetadata: boolean
  extractKeyPhases: boolean
}

export class ResponseProcessor {
  private config: ProcessingConfig

  constructor(config?: Partial<ProcessingConfig>) {
    this.config = {
      maxContentLength: 5000,
      minConfidenceThreshold: 0.6,
      includeMetadata: true,
      extractKeyPhases: true,
      ...config
    }
  }

  async processScrapingResults(
    results: ScrapingResult[],
    classification: HealthQueryClassification,
    userQuery: string
  ): Promise<ProcessedResponse> {
    const startTime = Date.now()

    // Filtrer les résultats réussis
    const successfulResults = results.filter(r => r.success && r.content)
    
    if (successfulResults.length === 0) {
      return this.createErrorResponse(results, classification, startTime)
    }

    // Nettoyer et extraire le contenu pertinent
    const cleanedContents = successfulResults.map(result => ({
      url: result.url,
      content: this.cleanContent(result.content),
      title: result.title || ''
    }))

    // Extraire les sections pertinentes
    const relevantSections = this.extractRelevantSections(
      cleanedContents, 
      classification, 
      userQuery
    )

    // Synthétiser la réponse
    const synthesizedAnswer = this.synthesizeAnswer(
      relevantSections,
      classification,
      userQuery
    )

    // Calculer la confiance
    const confidence = this.calculateConfidence(
      relevantSections,
      classification,
      successfulResults.length
    )

    const processingTime = Date.now() - startTime

    return {
      synthesizedAnswer,
      sources: results.map(r => r.url),
      confidence,
      relevantSections: relevantSections.map(s => s.substring(0, 200) + '...'),
      metadata: {
        totalPages: results.length,
        successfulScrapes: successfulResults.length,
        processingTime,
        category: classification.category
      }
    }
  }

  private cleanContent(content: string | any): string {
    if (!content) {
      return ''
    }

    // Si c'est un objet, essayer d'extraire le contenu
    if (typeof content === 'object') {
      content = content.content || content.data || content.text || JSON.stringify(content)
    }

    // S'assurer que c'est une string
    if (typeof content !== 'string') {
      content = String(content)
    }

    if (content.trim() === '') {
      return ''
    }

    // Supprimer les éléments HTML et nettoyer le texte
    let cleaned = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Limiter la longueur si nécessaire
    if (cleaned.length > this.config.maxContentLength) {
      cleaned = cleaned.substring(0, this.config.maxContentLength) + '...'
    }

    return cleaned
  }

  private extractRelevantSections(
    contents: Array<{url: string, content: string, title: string}>,
    classification: HealthQueryClassification,
    userQuery: string
  ): string[] {
    const relevantSections: string[] = []
    const queryKeywords = this.extractKeywords(userQuery)
    const categoryKeywords = this.getCategoryKeywords(classification.category)

    for (const item of contents) {
      const sentences = item.content.split(/[.!?]+/).filter(s => s.trim().length > 20)
      
      for (const sentence of sentences) {
        const score = this.calculateRelevanceScore(
          sentence, 
          [...queryKeywords, ...categoryKeywords, ...classification.keywords]
        )
        
        if (score > 0.3) { // Seuil de pertinence
          relevantSections.push(sentence.trim())
        }
      }
    }

    // Trier par pertinence et limiter le nombre
    return relevantSections
      .sort((a, b) => this.calculateRelevanceScore(b, queryKeywords) - 
                     this.calculateRelevanceScore(a, queryKeywords))
      .slice(0, 10)
  }

  private extractKeywords(text: string): string[] {
    // Mots-clés simples par extraction
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'pour', 'avec', 'sans']
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10)
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryKeywordMap: Record<string, string[]> = {
      'carte_vitale': ['carte vitale', 'commander', 'première carte', 'renouvellement'],
      'remboursements': ['remboursement', 'rembourser', 'soins', 'frais médicaux'],
      'affiliation': ['affiliation', 'immatriculation', 'numéro sécurité sociale'],
      'etranger': ['étranger', 'international', 'pays d\'origine'],
      'demandeur_asile': ['demandeur d\'asile', 'asile', 'réfugié', 'protection'],
      'soins_urgents': ['urgences', 'soins urgents', 'hôpital'],
      'medecin_traitant': ['médecin traitant', 'déclaration médecin', 'choisir médecin'],
      'general': ['ameli', 'assurance maladie', 'cpam', 'sécurité sociale']
    }

    return categoryKeywordMap[category] || categoryKeywordMap.general
  }

  private calculateRelevanceScore(text: string, keywords: string[]): number {
    const textLower = text.toLowerCase()
    let score = 0

    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        // Score basé sur la longueur du mot-clé et la fréquence
        const keywordLength = keyword.length
        const frequency = (textLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length
        score += (keywordLength / 10) * frequency
      }
    }

    return Math.min(score, 1) // Normaliser entre 0 et 1
  }

  private synthesizeAnswer(
    sections: string[],
    classification: HealthQueryClassification,
    userQuery: string
  ): string {
    if (sections.length === 0) {
      return "Je n'ai pas trouvé d'informations suffisamment pertinentes pour répondre à votre question."
    }

    // Créer une synthèse basique
    const introduction = this.generateIntroduction(classification, userQuery)
    const mainContent = sections.slice(0, 5).join(' ')
    const conclusion = this.generateConclusion(classification)

    return `${introduction}\n\n${mainContent}\n\n${conclusion}`
  }

  private generateIntroduction(classification: HealthQueryClassification, userQuery: string): string {
    const categoryIntros: Record<string, string> = {
      'carte_vitale': 'Concernant votre demande de carte vitale :',
      'remboursements': 'Pour vos questions sur les remboursements :',
      'affiliation': 'Concernant votre affiliation à l\'assurance maladie :',
      'etranger': 'Pour votre situation en tant qu\'étranger en France :',
      'demandeur_asile': 'En tant que demandeur d\'asile :',
      'soins_urgents': 'Pour les soins urgents :',
      'general': 'Selon les informations officielles d\'ameli.fr :'
    }

    return categoryIntros[classification.category] || categoryIntros.general
  }

  private generateConclusion(classification: HealthQueryClassification): string {
    if (classification.urgency === 'ELEVEE') {
      return "⚠️ Pour une situation urgente, contactez directement votre CPAM ou le 3646."
    }
    
    return "💡 Pour plus d'informations détaillées, consultez ameli.fr ou contactez votre CPAM."
  }

  private calculateConfidence(
    sections: string[],
    classification: HealthQueryClassification,
    successfulScrapes: number
  ): number {
    let confidence = 0.5 // Base

    // Augmenter selon le nombre de sections pertinentes
    confidence += Math.min(sections.length / 10, 0.3)

    // Augmenter selon la confiance de classification
    confidence += classification.confidence * 0.2

    // Augmenter selon le nombre de pages scrapées avec succès
    confidence += Math.min(successfulScrapes / 3, 0.2)

    return Math.min(confidence, 1)
  }

  private createErrorResponse(
    results: ScrapingResult[],
    classification: HealthQueryClassification,
    startTime: number
  ): ProcessedResponse {
    const errors = results.filter(r => !r.success).map(r => r.error).join(', ')
    
    return {
      synthesizedAnswer: `Je n'ai pas pu récupérer les informations d'ameli.fr. Erreurs: ${errors}`,
      sources: [],
      confidence: 0.1,
      relevantSections: [],
      metadata: {
        totalPages: results.length,
        successfulScrapes: 0,
        processingTime: Date.now() - startTime,
        category: classification.category
      }
    }
  }
}

export default ResponseProcessor 