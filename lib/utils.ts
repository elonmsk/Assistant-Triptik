import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Générateur d'ID stable pour éviter les problèmes d'hydratation
let idCounter = 0
export function generateStableId(prefix: string = "id"): string {
  // Utiliser un compteur au lieu de Date.now() pour des IDs prévisibles
  // En production, on pourrait utiliser une librairie comme uuid
  if (typeof window !== 'undefined') {
    // Côté client, on peut utiliser un timestamp initial + compteur
    if (!window.__stableIdBase) {
      window.__stableIdBase = Date.now()
    }
    return `${prefix}-${window.__stableIdBase}-${++idCounter}`
  } else {
    // Côté serveur, utiliser seulement le compteur
    return `${prefix}-server-${++idCounter}`
  }
}

// Extension du window pour TypeScript
declare global {
  interface Window {
    __stableIdBase?: number
  }
}

// Fonctions pour la gestion des qualifications
export interface QualificationData {
  category: string
  answers: string[]
  timestamp: number
  userType?: 'accompagne' | 'accompagnant'
}

export function getQualificationData(category: string, userType: 'accompagne' | 'accompagnant' = 'accompagne'): QualificationData | null {
  // Vérifier que nous sommes côté client
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const key = userType === 'accompagnant' ? `qualification_${category}_accompagnant` : `qualification_${category}`
    const data = localStorage.getItem(key)
    if (data) {
      const parsed = JSON.parse(data) as QualificationData
      // Vérifier si les données ne sont pas trop anciennes (7 jours)
      if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed
      }
    }
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération des données de qualification:', error)
    return null
  }
}

export function formatQualificationForPrompt(qualificationData: QualificationData, category: string): string {
  if (!qualificationData || !qualificationData.answers.length) {
    return ''
  }

  const answers = qualificationData.answers
  const userType = qualificationData.userType || 'accompagne'
  
  let profile = `\n\n📋 PROFIL DE L'UTILISATEUR (${userType === 'accompagne' ? 'Personne accompagnée' : 'Accompagnant'} - ${category}):\n`
  
  // Questions communes
  const commonQuestions = [
    "Démarches antérieures",
    "Documents possédés", 
    "Genre",
    "Âge",
    "Niveau de français",
    "Langue courante",
    "Ville de domiciliation",
    "Département de domiciliation",
    "Situation de handicap",
    "Enfants"
  ]

  // Questions spécifiques par catégorie
  const specificQuestions: { [key: string]: string[] } = {
    'Santé': ['Couverture sociale'],
    'Emploi': ['Résidence en France', 'Niveau scolaire', 'Inscription France Travail', 'Expérience professionnelle', 'CV à jour'],
    'Logement': ['Nombre de personnes', 'Composition du foyer', 'Logement actuel', 'Demande logement social', 'Connaissance des aides'],
    'Droits': ['Résidence en France', 'Nationalité'],
    'Éducation': ['Niveau scolaire', 'Carte INE', 'Nationalité'],
    'Apprentissage Français': ['Financement formation'],
    'Formation Pro': ['Financement', 'Dates demandées', 'Durée engagement', 'Disponibilité', 'Jours présence'],
    'Démarches': ['Nationalité']
  }

  const allQuestions = [...commonQuestions, ...(specificQuestions[category] || [])]
  
  answers.forEach((answer, index) => {
    if (index < allQuestions.length) {
      profile += `• ${allQuestions[index]}: ${answer}\n`
    }
  })

  return profile
}

export function getAllQualificationData(userType: 'accompagne' | 'accompagnant' = 'accompagne'): QualificationData[] {
  // Vérifier que nous sommes côté client
  if (typeof window === 'undefined') {
    return []
  }
  
  const qualifications: QualificationData[] = []
  
  try {
    // Parcourir toutes les clés de localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('qualification_')) {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data) as QualificationData
          // Vérifier si c'est pour le bon type d'utilisateur et si les données ne sont pas trop anciennes
          if (parsed.userType === userType || (!parsed.userType && userType === 'accompagne')) {
            if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
              qualifications.push(parsed)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les qualifications:', error)
  }
  
  return qualifications
}
