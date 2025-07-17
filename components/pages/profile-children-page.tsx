"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import AccompagnePage from "./accompagne-page" // Importez le composant AccompagnePage

interface ProfileChildrenPageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileChildrenPage({ onBack, onNext }: ProfileChildrenPageProps) {
  const [children, setChildren] = useState("")
  const [numero, setNumero] = useState<string | null>(null)
  const [showAccompagnePage, setShowAccompagnePage] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("uid")
    if (stored) setNumero(stored)
  }, [])

  const handleNext = async () => {
    if (!numero || children === "") {
      alert("Identifiant ou nombre d'enfants manquant.")
      return
    }
    try {
      const res = await fetch("/api/update-children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, enfants: parseInt(children, 10) }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Erreur lors de l'enregistrement.")
        return
      }
      console.log("✅ Nombre d'enfants enregistré :", data)
      setShowAccompagnePage(true)
    } catch (err) {
      console.error("Erreur API :", err)
      alert("Erreur réseau")
    }
  }

  const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (Number.parseInt(value) <= 20 || value === "") {
      setChildren(value)
    }
  }

  const handleAccompagneBack = () => {
    setShowAccompagnePage(false)
  }

  if (showAccompagnePage) {
    const storedTheme = localStorage.getItem("selectedTheme")
    return <AccompagnePage isLoggedIn={true} initialCategory={storedTheme} />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>
        <div className="mb-8">
          <label htmlFor="children" className="block text-lg font-medium text-[#414143] mb-6">
            Combien d'enfants à charge ?
          </label>
          <Input
            id="children"
            type="text"
            value={children}
            onChange={handleChildrenChange}
            placeholder="Nombre d'enfants"
            className="w-full py-4 px-4 text-base border-gray-300 rounded-lg text-[#a7a8a9]"
          />
        </div>
        <div className="flex gap-4 mt-8">
          <Button
            onClick={onBack}
            className="flex-1 bg-gray-300 text-black py-4 rounded-lg"
          >
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={children === ""}
            className="flex-1 bg-black text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
