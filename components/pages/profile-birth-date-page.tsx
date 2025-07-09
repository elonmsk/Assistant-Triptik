"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import ProfileNationalityPage from "./profile-nationality-page"
import ProfileChildrenPage from "./profile-children-page"
import ProfileGenrePage from "./profile-genre-page"

interface ProfileBirthDatePageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileBirthDatePage({ onBack, onNext }: ProfileBirthDatePageProps) {
  const [birthDate, setBirthDate] = useState("")
  const [numero, setNumero] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"birthdate" | "nationality" | "children" | "city">("birthdate")

  // Récupération du numéro (uid) depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem("uid")
    if (stored) setNumero(stored)
  }, [])

const handleNext = async () => {
  if (currentStep === "birthdate") {
    if (!numero) {
      alert("Identifiant utilisateur introuvable.")
      return
    }

    const formatted = formatDateToISO(birthDate)

    try {
      const res = await fetch("/api/update-birthdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numero, birthdate: formatted }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'enregistrement.")
        return
      }

      console.log("✅ Date enregistrée :", data)
      // Aller directement à la page city
      setCurrentStep("city")
    } catch (err) {
      console.error("Erreur réseau :", err)
      alert("Erreur réseau")
    }
  } else if (currentStep === "nationality") {
    setCurrentStep("children")
  } else if (currentStep === "children") {
    setCurrentStep("city")
  } else if (currentStep === "city") {
    onNext()
  }
}


  const formatDateToISO = (str: string) => {
    const [day, month, year] = str.split("/")
    return `${year}-${month}-${day}`
  }

  const handleBack = () => {
    if (currentStep === "nationality") setCurrentStep("birthdate")
    else if (currentStep === "children") setCurrentStep("nationality")
    else if (currentStep === "city") setCurrentStep("children")
    else onBack()
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) value = value.substring(0, 2) + "/" + value.substring(2)
    if (value.length >= 5) value = value.substring(0, 5) + "/" + value.substring(5, 9)
    setBirthDate(value)
  }

  // Affichage conditionnel des étapes suivantes
  if (currentStep === "nationality") return <ProfileNationalityPage onBack={handleBack} onNext={handleNext} />
  if (currentStep === "children") return <ProfileChildrenPage onBack={handleBack} onNext={handleNext} />
  if (currentStep === "city") return <ProfileGenrePage onBack={handleBack} onNext={handleNext} />

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        <div className="mb-8">
          <label htmlFor="birthdate" className="block text-lg font-medium text-[#414143] mb-6">
            Votre date de naissance ?
          </label>
          <Input
            id="birthdate"
            type="text"
            value={birthDate}
            onChange={handleDateChange}
            placeholder="JJ/MM/AAAA"
            maxLength={10}
            className="w-full py-4 px-4 text-base border-gray-300 rounded-lg text-[#a7a8a9]"
          />
        </div>

        <Button
          onClick={handleNext}
          disabled={birthDate.length !== 10}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
