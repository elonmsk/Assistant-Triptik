"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ProfileNationalityPageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileNationalityPage({ onBack, onNext }: ProfileNationalityPageProps) {
  const [nationality, setNationality] = useState("")

  const countries = [
    "Afghanistan",
    "Algérie",
    "Allemagne",
    "Belgique",
    "Cameroun",
    "Canada",
    "Côte d'Ivoire",
    "Espagne",
    "France",
    "Italie",
    "Mali",
    "Maroc",
    "Niger",
    "Sénégal",
    "Syrie",
    "Tunisie",
    "Ukraine",
  ]

  const handleNext = () => {
    if (nationality) {
      onNext()
    }
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
          <label htmlFor="nationality" className="block text-lg font-medium text-[#414143] mb-6">
            Votre nationalité ?
          </label>
          <Select value={nationality} onValueChange={setNationality}>
            <SelectTrigger className="w-full py-4 px-4 text-base border-gray-300 rounded-lg">
              <SelectValue placeholder="Sélectionnez votre pays" className="text-[#a7a8a9]" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!nationality}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
