"use client"
import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import ProfileCityPage from "./profile-city-page" // Importez le composant ProfileCityPage

interface LanguagesPageProps {
  onBack: () => void
}

export default function LanguagesPage({ onBack }: LanguagesPageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("Français")
  const [showProfileCityPage, setShowProfileCityPage] = useState(false) // État pour gérer la redirection

  const languages = [
    "Français",
    "English",
    "Arabe",
    "Pachto",
    "Ukrainien",
    "Soudanais",
    "Iranien",
    "Bengali",
    "Ethyopie",
  ]

  const handleLanguageSelect = async (language: string) => {
    setSelectedLanguage(language)
    console.log(`Language selected: ${language}`)
    const numero = localStorage.getItem("numero")
    if (!numero) {
      console.error("Aucun numéro trouvé en localStorage")
      return
    }
    const response = await fetch('/api/update-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero, language }),
    })
    if (response.ok) {
      console.log("Langue enregistrée avec succès")
    } else {
      console.error("Erreur enregistrement langue")
    }
    setShowProfileCityPage(true)
  }

  const handleCityBack = () => {
    setShowProfileCityPage(false) // Retour à la page de sélection de langue
  }

  const handleCityNext = () => {
    // Logique pour continuer après la page de la ville
  }

  if (showProfileCityPage) {
    return <ProfileCityPage onBack={handleCityBack} onNext={handleCityNext} />
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="flex items-center py-3 px-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-[#414143] flex-1 text-center">Langues</h1>
        <div className="flex items-center gap-3 mr-4">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = "/")}
          />
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-6">
        <div className="space-y-4">
          {languages.map((language) => (
            <Button
              key={language}
              variant="outline"
              onClick={() => handleLanguageSelect(language)}
              className={`w-full h-16 flex items-center px-6 text-lg font-normal border-2 rounded-2xl transition-colors ${
                selectedLanguage === language
                  ? "bg-gray-100 text-black border-gray-300"
                  : "border-gray-300 hover:border-gray-400 text-[#414143]"
              }`}
            >
              <span>{language}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-4 mt-8">
          <Button
            onClick={onBack}
            className="flex-1 bg-gray-300 text-black py-4 rounded-lg"
          >
            Précédent
          </Button>
        </div>
      </main>
    </div>
  )
}