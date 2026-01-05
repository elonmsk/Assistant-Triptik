"use client"

import { useState } from "react"
import HomeButton from "./home-button"

export default function HomeButtonDemo() {
  const [currentVariant, setCurrentVariant] = useState<"default" | "minimal" | "floating">("default")

  const handleHomeClick = () => {
    console.log("Retour à l'accueil cliqué")
    // Ici vous pourriez ajouter la logique de navigation
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Démonstration du bouton de retour à l'accueil</h1>
        
        {/* Contrôles */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Choisir la variante :</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentVariant("default")}
              className={`px-4 py-2 rounded-lg border ${
                currentVariant === "default" 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setCurrentVariant("minimal")}
              className={`px-4 py-2 rounded-lg border ${
                currentVariant === "minimal" 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Minimal
            </button>
            <button
              onClick={() => setCurrentVariant("floating")}
              className={`px-4 py-2 rounded-lg border ${
                currentVariant === "floating" 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Floating
            </button>
          </div>
        </div>

        {/* Démonstration */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Variante actuelle : {currentVariant}</h3>
            <div className="flex items-center gap-4">
              <HomeButton 
                onHomeClick={handleHomeClick} 
                variant={currentVariant}
              />
              <span className="text-gray-600">
                Cliquez sur le bouton pour tester la fonctionnalité
              </span>
            </div>
          </div>

          {/* Exemples d'utilisation */}
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Exemples d'utilisation :</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Header de page (variante minimal)</h4>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">☰</div>
                  <HomeButton onHomeClick={handleHomeClick} variant="minimal" />
                  <div className="text-sm text-gray-600">Parfait pour les headers</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Bouton principal (variante default)</h4>
                <div className="flex items-center gap-3">
                  <HomeButton onHomeClick={handleHomeClick} variant="default" />
                  <div className="text-sm text-gray-600">Style standard avec bordure</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Bouton flottant (variante floating)</h4>
                <div className="relative h-32 bg-gray-100 rounded-lg">
                  <HomeButton onHomeClick={handleHomeClick} variant="floating" />
                  <div className="absolute bottom-2 left-4 text-sm text-gray-600">
                    Position fixe en haut à droite
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
