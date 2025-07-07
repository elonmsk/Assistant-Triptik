"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import ProfileDisabilityPage from "./profile-handicap-page"

interface ProfileFrenchLevelPageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileFrenchLevelPage({ onBack, onNext }: ProfileFrenchLevelPageProps) {
  const [frenchLevel, setFrenchLevel] = useState<string | null>(null)
  const [numero, setNumero] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"frenchLevel" | "disability">("frenchLevel")

  useEffect(() => {
    const stored = localStorage.getItem("uid")
    if (stored) setNumero(stored)
  }, [])

  const handleNext = async () => {
    if (!frenchLevel) {
      alert("Merci de sélectionner un niveau.")
      return
    }

    if (!numero) {
      alert("Identifiant utilisateur introuvable.")
      return
    }

    try {
      const res = await fetch("/api/update-french-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, frenchLevel }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'enregistrement.")
        return
      }

      console.log("✅ Niveau de français enregistré :", data)

      // Aller à la page "handicap"
      setCurrentStep("disability")
    } catch (err) {
      console.error("Erreur réseau :", err)
      alert("Erreur réseau")
    }
  }

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

  if (currentStep === "disability")
    return <ProfileDisabilityPage onBack={() => setCurrentStep("frenchLevel")} onNext={onNext} />

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        <div className="mb-8">
          <p className="block text-lg font-medium text-[#414143] mb-6">Quel est votre niveau de français ?</p>
          <div className="grid grid-cols-3 gap-4">
            {levels.map((level) => (
              <Button
                key={level}
                onClick={() => setFrenchLevel(level)}
                className={`${frenchLevel === level ? "bg-black text-white" : "bg-gray-200 text-black"}`}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={onBack} className="flex-1 bg-gray-300 text-black py-4 text-base rounded-lg">
            Retour
          </Button>
          <Button
            onClick={handleNext}
            disabled={!frenchLevel}
            className="flex-1 bg-black text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
