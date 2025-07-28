// Configuration de la version de l'application
export const APP_VERSION = {
  version: 'V1',
  date: '28 Juillet',
  full: 'V1 au 28 Juillet'
}

// Fonction utilitaire pour formater la version
export const formatVersion = (format: 'short' | 'full' | 'date' = 'short') => {
  switch (format) {
    case 'short':
      return `${APP_VERSION.version} • ${APP_VERSION.date}`
    case 'full':
      return APP_VERSION.full
    case 'date':
      return APP_VERSION.date
    default:
      return `${APP_VERSION.version} • ${APP_VERSION.date}`
  }
} 