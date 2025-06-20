"use client"

import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface LanguagesPageProps {
  onBack: () => void
}

export default function LanguagesPage({ onBack }: LanguagesPageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("Français")

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

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    // Here you would typically save the language preference
    console.log(`Language selected: ${language}`)
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="flex items-center py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-[#414143]" />
        </Button>
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
              className={`w-full h-16 flex items-center justify-between px-6 text-lg font-normal border-2 rounded-2xl transition-colors ${
                selectedLanguage === language
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400 text-[#414143]"
              }`}
            >
              <span>{language}</span>
              {selectedLanguage === language && <Check className="w-5 h-5 text-blue-700" />}
            </Button>
          ))}
        </div>
      </main>
    </div>
  )
}
