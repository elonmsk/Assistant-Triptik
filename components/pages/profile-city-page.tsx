"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import ProfileDocumentsPage from "./profile-documents-page"

interface ProfileCityPageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileCityPage({ onBack, onNext }: ProfileCityPageProps) {
  const [city, setCity] = useState("")
  const [showDocuments, setShowDocuments] = useState(false)

  const cities = [
    "Bordeaux",
    "Lille",
    "Lyon",
    "Marseille",
    "Montpellier",
    "Nantes",
    "Nice",
    "Paris",
    "Rennes",
    "Strasbourg",
    "Toulouse",
  ]

  const handleNext = () => {
    if (city) {
      setShowDocuments(true)
    }
  }

  const handleDocumentsBack = () => {
    setShowDocuments(false)
  }

  const handleDocumentsComplete = () => {
    // Profile is complete, go to next step
    onNext()
  }

  if (showDocuments) {
    return <ProfileDocumentsPage onBack={handleDocumentsBack} onComplete={handleDocumentsComplete} />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        {/* Question */}
        <div className="mb-8">
          <label htmlFor="city" className="block text-lg font-medium text-[#414143] mb-6">
            Votre ville de résidence en France ?
          </label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full py-4 px-4 text-base border-gray-300 rounded-lg">
              <SelectValue placeholder="Sélectionnez une ville" className="text-[#a7a8a9]" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!city}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
