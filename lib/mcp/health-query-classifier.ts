export interface HealthQueryClassification {
  isHealthRelated: boolean
  category: HealthCategory
  keywords: string[]
  confidence: number
  intent: QueryIntent
  urgency: UrgencyLevel
}

export enum HealthCategory {
  CARTE_VITALE = 'carte_vitale',
  REMBOURSEMENTS = 'remboursements',
  AFFILIATION = 'affiliation',
  ETRANGER = 'etranger',
  DEMANDEUR_ASILE = 'demandeur_asile',
  SOINS_URGENTS = 'soins_urgents',
  MEDECIN_TRAITANT = 'medecin_traitant',
  PHARMACIE = 'pharmacie',
  SPECIALISTE = 'specialiste',
  GENERAL = 'general'
}

export enum QueryIntent {
  COMMENT_FAIRE = 'comment_faire',
  OBTENIR_INFO = 'obtenir_info',
  RESOUDRE_PROBLEME = 'resoudre_probleme',
  COMPRENDRE = 'comprendre',
  CONTACT = 'contact'
}

export enum UrgencyLevel {
  FAIBLE = 'faible',
  MOYENNE = 'moyenne',
  ELEVEE = 'elevee',
  URGENTE = 'urgente'
}

export class HealthQueryClassifier {
  private healthKeywords = {
    [HealthCategory.CARTE_VITALE]: [
      'carte vitale', 'carte d\'assurance', 'vitale', 'commander carte',
      'nouvelle carte', 'renouveler carte', 'première carte'
    ],
    [HealthCategory.REMBOURSEMENTS]: [
      'remboursement', 'rembourser', 'prise en charge', 'tickets modérateurs',
      'frais médicaux', 'mutuelle', 'tiers payant'
    ],
    [HealthCategory.AFFILIATION]: [
      'affiliation', 'numéro sécurité sociale', 'immatriculation',
      'inscription', 'assurance maladie', 'droits ouverts'
    ],
    [HealthCategory.ETRANGER]: [
      'étranger', 'étranger en france', 'visa', 'titre séjour',
      'carte séjour', 'ressortissant', 'non français'
    ],
    [HealthCategory.DEMANDEUR_ASILE]: [
      'demandeur d\'asile', 'asile', 'réfugié', 'protection subsidiaire',
      'ofpra', 'cada', 'syrie', 'afghanistan', 'ukraine'
    ],
    [HealthCategory.SOINS_URGENTS]: [
      'urgence', 'urgences', 'hôpital', 'samu', 'urgence vitale',
      'accident', 'douleur intense', 'hémorragie'
    ],
    [HealthCategory.MEDECIN_TRAITANT]: [
      'médecin traitant', 'choisir médecin', 'déclaration médecin',
      'médecin référent', 'changement médecin'
    ],
    [HealthCategory.PHARMACIE]: [
      'pharmacie', 'médicaments', 'ordonnance', 'prescription',
      'pharmacien', 'automédication'
    ]
  }

  private intentKeywords = {
    [QueryIntent.COMMENT_FAIRE]: [
      'comment', 'comment faire', 'procédure', 'étapes', 'démarches'
    ],
    [QueryIntent.OBTENIR_INFO]: [
      'obtenir', 'avoir', 'recevoir', 'demander', 'commander'
    ],
    [QueryIntent.RESOUDRE_PROBLEME]: [
      'problème', 'erreur', 'ne fonctionne pas', 'refusé', 'rejeté'
    ],
    [QueryIntent.COMPRENDRE]: [
      'qu\'est-ce que', 'définition', 'expliquer', 'comprendre'
    ],
    [QueryIntent.CONTACT]: [
      'contacter', 'téléphone', 'adresse', 'rendez-vous', 'joindre'
    ]
  }

  private urgencyKeywords = {
    [UrgencyLevel.URGENTE]: [
      'urgent', 'urgence', 'immédiatement', 'tout de suite', 'grave'
    ],
    [UrgencyLevel.ELEVEE]: [
      'rapidement', 'vite', 'dans les plus brefs délais', 'prioritaire'
    ],
    [UrgencyLevel.MOYENNE]: [
      'bientôt', 'prochainement', 'dans quelques jours'
    ]
  }

  async classify(query: string): Promise<HealthQueryClassification> {
    const normalizedQuery = query.toLowerCase()
    
    // -- MODIFICATION POUR FORCER LA RECHERCHE GOOGLE --
    // L'ancienne logique est commentée ci-dessous.
    // On retourne systématiquement une catégorie "GENERAL" avec une faible confiance
    // pour forcer le système à passer par la recherche dynamique.
    return {
      isHealthRelated: this.isHealthQuery(normalizedQuery),
      category: HealthCategory.GENERAL,
      keywords: [],
      confidence: 0.1, // Confiance basse pour forcer la recherche
      intent: this.determineIntent(normalizedQuery),
      urgency: this.determineUrgency(normalizedQuery)
    }

    /*
    // 1. Vérifier si c'est lié à la santé
    const isHealthRelated = this.isHealthQuery(normalizedQuery)
    
    if (!isHealthRelated) {
      return {
        isHealthRelated: false,
        category: HealthCategory.GENERAL,
        keywords: [],
        confidence: 0,
        intent: QueryIntent.OBTENIR_INFO,
        urgency: UrgencyLevel.FAIBLE
      }
    }

    // 2. Déterminer la catégorie
    const category = this.determineCategory(normalizedQuery)
    
    // 3. Extraire les mots-clés
    const keywords = this.extractKeywords(normalizedQuery, category)
    
    // 4. Déterminer l'intention
    const intent = this.determineIntent(normalizedQuery)
    
    // 5. Évaluer l'urgence
    const urgency = this.determineUrgency(normalizedQuery)
    
    // 6. Calculer la confiance
    const confidence = this.calculateConfidence(normalizedQuery, category, keywords)

    return {
      isHealthRelated: true,
      category,
      keywords,
      confidence,
      intent,
      urgency
    }
    */
  }

  private isHealthQuery(query: string): boolean {
    const healthIndicators = [
      'santé', 'médical', 'maladie', 'soin', 'hôpital', 'médecin',
      'carte vitale', 'assurance maladie', 'remboursement', 'ameli',
      'sécurité sociale', 'cpam', 'pharmacie', 'ordonnance'
    ]

    return healthIndicators.some(indicator => query.includes(indicator))
  }

  private determineIntent(query: string): QueryIntent {
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return intent as QueryIntent
      }
    }
    return QueryIntent.OBTENIR_INFO
  }

  private determineUrgency(query: string): UrgencyLevel {
    for (const [urgency, keywords] of Object.entries(this.urgencyKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return urgency as UrgencyLevel
      }
    }
    return UrgencyLevel.FAIBLE
  }

  async getSuggestions(userProfile?: any): Promise<string[]> {
    const commonQuestions = [
      "Comment obtenir ma première carte vitale ?",
      "Comment renouveler ma carte vitale ?",
      "Que faire si je suis étranger en France ?",
      "Comment me faire rembourser mes soins ?",
      "Comment choisir un médecin traitant ?",
      "Où trouver une pharmacie de garde ?",
      "Comment contacter ma CPAM ?",
      "Quels sont mes droits en tant que demandeur d'asile ?"
    ]

    // Personnaliser selon le profil utilisateur
    if (userProfile?.country && userProfile.country !== 'France') {
      return [
        "Comment m'affilier à l'assurance maladie française ?",
        "Quelles démarches pour obtenir une carte vitale en tant qu'étranger ?",
        "Comment accéder aux soins d'urgence sans carte vitale ?",
        ...commonQuestions.slice(0, 5)
      ]
    }

    return commonQuestions
  }
}

export default HealthQueryClassifier 