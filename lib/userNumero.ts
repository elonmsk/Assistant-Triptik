/**
 * Utilitaires pour la gestion des userNumero
 * Supporte les formats legacy (guest_XXX) et nouveaux (numéros entiers)
 */

export interface ParsedUserNumero {
  isValid: boolean
  numericValue: number | null
  originalValue: string
  isLegacyFormat: boolean
}

/**
 * Parse et valide un userNumero
 * @param userNumero - Le userNumero à parser (peut être "guest_123" ou "123456")
 * @returns Objet avec les informations parsées
 */
export function parseUserNumero(userNumero: string): ParsedUserNumero {
  if (!userNumero || typeof userNumero !== 'string') {
    return {
      isValid: false,
      numericValue: null,
      originalValue: userNumero,
      isLegacyFormat: false
    }
  }

  // Format legacy: guest_TIMESTAMP
  if (userNumero.startsWith('guest_')) {
    const timestampStr = userNumero.replace('guest_', '')
    const timestamp = parseInt(timestampStr, 10)
    
    if (isNaN(timestamp)) {
      return {
        isValid: false,
        numericValue: null,
        originalValue: userNumero,
        isLegacyFormat: true
      }
    }
    
    return {
      isValid: true,
      numericValue: timestamp,
      originalValue: userNumero,
      isLegacyFormat: true
    }
  }

  // Format actuel: numéro entier
  const numericValue = parseInt(userNumero, 10)
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      numericValue: null,
      originalValue: userNumero,
      isLegacyFormat: false
    }
  }

  return {
    isValid: true,
    numericValue,
    originalValue: userNumero,
    isLegacyFormat: false
  }
}

/**
 * Convertit un userNumero en valeur numérique pour la base de données
 * @param userNumero - Le userNumero à convertir
 * @returns La valeur numérique ou null si invalide
 */
export function getUserNumeroForDB(userNumero: string): number | null {
  const parsed = parseUserNumero(userNumero)
  return parsed.isValid ? parsed.numericValue : null
}

/**
 * Vérifie si un userNumero est valide
 * @param userNumero - Le userNumero à vérifier
 * @returns true si valide, false sinon
 */
export function isValidUserNumero(userNumero: string): boolean {
  return parseUserNumero(userNumero).isValid
}

