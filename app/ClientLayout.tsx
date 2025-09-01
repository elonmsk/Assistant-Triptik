'use client'

import { useEffect } from 'react'

// Composant client pour gérer les erreurs d'hydratation
function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Fonction pour nettoyer les attributs ajoutés par les extensions
    const cleanBrowserExtensionAttributes = () => {
      const body = document.body
      if (body) {
        // Supprimer les attributs connus des extensions
        body.removeAttribute('bis_register')
        // Supprimer les attributs qui commencent par __processed
        const attributes = Array.from(body.attributes)
        attributes.forEach(attr => {
          if (attr.name.startsWith('__processed')) {
            body.removeAttribute(attr.name)
          }
        })
      }
    }

    // Nettoyer immédiatement après l'hydratation
    const timeoutId = setTimeout(() => {
      cleanBrowserExtensionAttributes()
    }, 0)

    // Observer les mutations pour nettoyer en temps réel
    const observer = new MutationObserver(() => {
      cleanBrowserExtensionAttributes()
    })

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeOldValue: true
      })
    }

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  // Gestionnaire global d'erreur d'hydratation
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Supprimer les erreurs d'hydratation spécifiques aux extensions
      if (event.message && (
        event.message.includes('Hydration failed') ||
        event.message.includes('bis_register') ||
        event.message.includes('__processed') ||
        event.message.includes('server rendered HTML didn\'t match') ||
        event.message.includes('Warning: Expected server HTML to contain') ||
        event.message.includes('Warning: Text content did not match')
      )) {
        event.preventDefault()
        console.warn('Erreur d\'hydratation supprimée (probablement due à une extension de navigateur):', event.message)
      }
    }

    // Aussi gérer les erreurs React dans la console
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]
      if (typeof message === 'string' && (
        message.includes('Hydration failed') ||
        message.includes('bis_register') ||
        message.includes('__processed') ||
        message.includes('server rendered HTML didn\'t match') ||
        message.includes('Warning: Expected server HTML to contain') ||
        message.includes('Warning: Text content did not match')
      )) {
        console.warn('Erreur React supprimée (extension de navigateur):', message)
        return
      }
      originalConsoleError.apply(console, args)
    }

    window.addEventListener('error', handleError)
    return () => {
      window.removeEventListener('error', handleError)
      console.error = originalConsoleError
    }
  }, [])

  return <>{children}</>
}

export default ClientLayout
