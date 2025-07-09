"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import ProfileCityPage from "./profile-city-page"

interface ProfileGenderPageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileGenderPage({ onBack, onNext }: ProfileGenderPageProps) {
  const [gender, setGender] = useState<"Homme" | "Femme" | null>(null)
  const [numero, setNumero] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"gender" | "city">("gender")

  useEffect(() => {
    const stored = localStorage.getItem("uid")
    if (stored) setNumero(stored)
  }, [])

  const handleNext = async () => {
    if (!gender) {
      alert("Merci de sélectionner un genre.")
      return
    }

    if (!numero) {
      alert("Identifiant utilisateur introuvable.")
      return
    }

    try {
      const res = await fetch("/api/update-gender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, gender }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'enregistrement.")
        return
      }

      console.log("✅ Genre enregistré :", data)
      setCurrentStep("city")
    } catch (err) {
      console.error("Erreur réseau :", err)
      alert("Erreur réseau")
    }
  }

  if (currentStep === "city")
    return <ProfileCityPage onBack={() => setCurrentStep("gender")} onNext={onNext} />

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        <div className="mb-8">
          <p className="text-lg font-medium text-[#414143] mb-6">Quel est votre genre ?</p>
          <div className="flex gap-4">
            <Button
              onClick={() => setGender("Homme")}
              className={`flex-1 ${gender === "Homme" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              Homme
            </Button>
            <Button
              onClick={() => setGender("Femme")}
              className={`flex-1 ${gender === "Femme" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              Femme
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={onBack} className="flex-1 bg-gray-300 text-black py-4 rounded-lg">
            Retour
          </Button>
          <Button
            onClick={handleNext}
            disabled={!gender}
            className="flex-1 bg-black text-white py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
