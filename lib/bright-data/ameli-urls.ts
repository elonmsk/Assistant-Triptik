import { HealthCategory } from '@/lib/mcp/health-query-classifier'

export interface AmeliURL {
  url: string
  category: HealthCategory
  priority: number
  description: string
}

export const AMELI_URL_MAPPING: Record<HealthCategory, AmeliURL[]> = {
  [HealthCategory.CARTE_VITALE]: [
    {
      url: 'https://www.ameli.fr/assure/adresses-et-contacts/votre-carte-vitale-appli-carte-vitale-carte-europeenne-d-assurance-maladie-ceam/commander-une-carte-vitale',
      category: HealthCategory.CARTE_VITALE,
      priority: 1,
      description: 'Commander une carte Vitale'
    },
    {
      url: 'https://www.ameli.fr/assure/adresses-et-contacts/votre-carte-vitale-appli-carte-vitale-carte-europeenne-d-assurance-maladie-ceam/premiere-carte-vitale',
      category: HealthCategory.CARTE_VITALE,
      priority: 2,
      description: 'Première carte Vitale'
    },
    {
      url: 'https://www.ameli.fr/assure/adresses-et-contacts/votre-carte-vitale-appli-carte-vitale-carte-europeenne-d-assurance-maladie-ceam/renouveler-carte-vitale',
      category: HealthCategory.CARTE_VITALE,
      priority: 2,
      description: 'Renouveler sa carte Vitale'
    }
  ],

  [HealthCategory.DEMANDEUR_ASILE]: [
    {
      url: 'https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-france/demandeur-d-asile',
      category: HealthCategory.DEMANDEUR_ASILE,
      priority: 1,
      description: 'Demandeur d\'asile en France'
    },
    {
      url: 'https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-france/ne-etranger-demander-numero-securite-sociale',
      category: HealthCategory.DEMANDEUR_ASILE,
      priority: 2,
      description: 'Numéro de sécurité sociale pour étrangers'
    }
  ],

  [HealthCategory.ETRANGER]: [
    {
      url: 'https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-france',
      category: HealthCategory.ETRANGER,
      priority: 1,
      description: 'Protection sociale pour étrangers'
    },
    {
      url: 'https://www.ameli.fr/assure/droits-demarches/europe-international/protection-sociale-france/ne-etranger-demander-numero-securite-sociale',
      category: HealthCategory.ETRANGER,
      priority: 1,
      description: 'Demander un numéro de sécurité sociale'
    }
  ],

  [HealthCategory.REMBOURSEMENTS]: [
    {
      url: 'https://www.ameli.fr/assure/remboursements',
      category: HealthCategory.REMBOURSEMENTS,
      priority: 1,
      description: 'Comprendre les remboursements'
    },
    {
      url: 'https://www.ameli.fr/assure/remboursements/rembourse/frais-medicaux',
      category: HealthCategory.REMBOURSEMENTS,
      priority: 1,
      description: 'Remboursement des frais médicaux'
    }
  ],

  [HealthCategory.AFFILIATION]: [
    {
      url: 'https://www.ameli.fr/assure/droits-demarches/principes/affiliation-assurance-maladie',
      category: HealthCategory.AFFILIATION,
      priority: 1,
      description: 'Affiliation à l\'assurance maladie'
    },
    {
      url: 'https://www.ameli.fr/assure/droits-demarches/principes/numeros-securite-sociale',
      category: HealthCategory.AFFILIATION,
      priority: 2,
      description: 'Numéros de sécurité sociale'
    }
  ],

  [HealthCategory.SOINS_URGENTS]: [
    {
      url: 'https://www.ameli.fr/assure/remboursements/rembourse/urgences-hospitalisations',
      category: HealthCategory.SOINS_URGENTS,
      priority: 1,
      description: 'Urgences et hospitalisations'
    }
  ],

  [HealthCategory.MEDECIN_TRAITANT]: [
    {
      url: 'https://www.ameli.fr/assure/sante/bons-gestes/medecin-traitant',
      category: HealthCategory.MEDECIN_TRAITANT,
      priority: 1,
      description: 'Choisir son médecin traitant'
    }
  ],

  [HealthCategory.PHARMACIE]: [
    {
      url: 'https://www.ameli.fr/assure/sante/medicaments',
      category: HealthCategory.PHARMACIE,
      priority: 1,
      description: 'Médicaments et pharmacie'
    }
  ],

  [HealthCategory.SPECIALISTE]: [
    {
      url: 'https://www.ameli.fr/assure/sante/bons-gestes/medecin-specialiste',
      category: HealthCategory.SPECIALISTE,
      priority: 1,
      description: 'Consulter un spécialiste'
    }
  ],

  [HealthCategory.GENERAL]: [
    {
      url: 'https://www.ameli.fr/assure',
      category: HealthCategory.GENERAL,
      priority: 1,
      description: 'Page d\'accueil assurés'
    }
  ]
}

export class AmeliUrlMapper {
  static getUrlsForCategory(category: HealthCategory, maxUrls: number = 3): string[] {
    const urls = AMELI_URL_MAPPING[category] || AMELI_URL_MAPPING[HealthCategory.GENERAL]
    
    return urls
      .sort((a, b) => a.priority - b.priority)
      .slice(0, maxUrls)
      .map(item => item.url)
  }

  static getAllUrls(): AmeliURL[] {
    return Object.values(AMELI_URL_MAPPING).flat()
  }

  static searchUrls(keywords: string[]): string[] {
    const allUrls = this.getAllUrls()
    const relevantUrls: Array<{ url: string; score: number }> = []

    allUrls.forEach(urlItem => {
      let score = 0
      keywords.forEach(keyword => {
        if (urlItem.description.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1
        }
        if (urlItem.url.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.5
        }
      })

      if (score > 0) {
        relevantUrls.push({ url: urlItem.url, score })
      }
    })

    return relevantUrls
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.url)
  }
}

export default AmeliUrlMapper 