"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import ProfileDocumentsPage from "./profile-documents-page"

interface ProfileCityPageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileCityPage({ onBack, onNext }: ProfileCityPageProps) {
  const [city, setCity] = useState("")
  const [department, setDepartment] = useState("")
  const [numero, setNumero] = useState<string | null>(null)
  const [showDocuments, setShowDocuments] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("uid")
    if (stored) setNumero(stored)
  }, [])

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

  const handleNext = async () => {
    if (!numero || !city || !department) {
      alert("Veuillez sélectionner une ville et saisir un département.")
      return
    }

    try {
      const res = await fetch("/api/update-city", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, ville: city, departement: department }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erreur lors de la mise à jour.")
        return
      }

      console.log("✅ Ville + département enregistrés :", data)
      setShowDocuments(true)
    } catch (err) {
      console.error("Erreur réseau :", err)
      alert("Erreur réseau.")
    }
  }

  const handleDocumentsBack = () => {
    setShowDocuments(false)
  }

  const handleDocumentsComplete = () => {
    onNext()
  }

  if (showDocuments) {
    return (
      <ProfileDocumentsPage
        onBack={handleDocumentsBack}
        onComplete={handleDocumentsComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        <div className="space-y-6 mb-8">
          {/* Ville */}
          <div>
            <label className="block text-lg font-medium text-[#414143] mb-4">
              Votre ville de domiciliation en France ?
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

          {/* Département libre */}
          <div>
            <label className="block text-lg font-medium text-[#414143] mb-4">
              Votre département de domiciliation ?
            </label>
            <Input
              type="text"
              placeholder="Exemple : 75"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full py-4 px-4 text-base border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={!city || !department}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg disabled:opacity-50"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
