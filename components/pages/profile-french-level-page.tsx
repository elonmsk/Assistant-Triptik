"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import LanguagePage from "./languages-page"
import ProfileBirthDatePage from "./profile-birth-date-page"

interface ProfileFrenchLevelPageProps {
  onComplete: () => void
}

interface FrenchLevel {
  level: string
  label: string
  emoji: string
  value: string
}

export default function ProfileFrenchLevelPage({ onComplete }: ProfileFrenchLevelPageProps) {
  const [frenchLevel, setFrenchLevel] = useState<string | null>(null)
  const [numero, setNumero] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"frenchLevel" | "language" | "birthDate">("frenchLevel")

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
      setCurrentStep("language")
    } catch (err) {
      console.error("Erreur réseau :", err)
      alert("Erreur réseau")
    }
  }

  const handleBack = () => {
    setCurrentStep("birthDate")
  }

  if (currentStep === "language") {
    return <LanguagePage onBack={() => setCurrentStep("frenchLevel")} onNext={onComplete} />
  }

  if (currentStep === "birthDate") {
    return <ProfileBirthDatePage onBack={() => setCurrentStep("frenchLevel")} onNext={onComplete} />
  }

  const frenchLevels: FrenchLevel[] = [
    { level: "A1", label: "A1 (Débutant)", emoji: "🟢", value: "a1" },
    { level: "A2", label: "A2 (Élémentaire)", emoji: "🟡", value: "a2" },
    { level: "B1", label: "B1 (Intermédiaire)", emoji: "🟠", value: "b1" },
    { level: "B2", label: "B2 (Intermédiaire supérieur)", emoji: "🔵", value: "b2" },
    { level: "C1", label: "C1 (Avancé)", emoji: "🟣", value: "c1" },
    { level: "C2", label: "C2 (Maîtrise)", emoji: "🔴", value: "c2" },
  ]

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>
        <div className="mb-8">
          <p className="block text-lg font-medium text-[#414143] mb-6">Quel est votre niveau de français ?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {frenchLevels.map(({ level, label, emoji, value }) => (
              <Button
                key={level}
                onClick={() => setFrenchLevel(value)}
                className={`inline-flex items-center justify-center gap-2 bg-gray-200 text-black rounded-full py-2 px-4 text-sm whitespace-nowrap ${
                  frenchLevel === value ? "ring-2 ring-black" : ""
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleBack}
            className="flex-1 bg-gray-300 text-black py-4 rounded-lg text-sm"
          >
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={!frenchLevel}
            className="flex-1 bg-black text-white py-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}