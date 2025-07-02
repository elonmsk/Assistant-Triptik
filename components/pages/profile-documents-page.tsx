"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import AccompagnePage from "./accompagne-page"

interface ProfileDocumentsPageProps {
  onBack: () => void
  onComplete: () => void
}

export default function ProfileDocumentsPage({ onBack, onComplete }: ProfileDocumentsPageProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [numero, setNumero] = useState<string | null>(null)
  const [showAccompagnePage, setShowAccompagnePage] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("uid")
    if (stored) setNumero(stored)
  }, [])

  const documents = [
    "Attestation de demande d'asile (ADA)",
    "Attestation prolongation d'instruction (API)",
    "Carte de séjour",
    "Titre de séjour",
    "Passeport",
    "Carte AME",
    "Aucun de ces documents",
  ]

  const handleDocumentChange = (document: string, checked: boolean) => {
    if (document === "Aucun de ces documents") {
      if (checked) {
        setSelectedDocuments(["Aucun de ces documents"])
      } else {
        setSelectedDocuments([])
      }
    } else {
      if (checked) {
        const newSelection = selectedDocuments.filter((doc) => doc !== "Aucun de ces documents")
        setSelectedDocuments([...newSelection, document])
      } else {
        setSelectedDocuments(selectedDocuments.filter((doc) => doc !== document))
      }
    }
  }

  const handleComplete = async () => {
    if (!numero) {
      alert("Identifiant utilisateur introuvable.")
      return
    }

    try {
      const res = await fetch("/api/update-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, documents: selectedDocuments }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'enregistrement.")
        return
      }

      console.log("✅ Documents enregistrés :", data)
      setShowAccompagnePage(true)
    } catch (err) {
      console.error("Erreur API :", err)
      alert("Erreur réseau.")
    }
  }

  // Afficher la page accompagne avec l'état connecté et la catégorie initiale
  if (showAccompagnePage) {
    // Récupérer le thème stocké
    const storedTheme = localStorage.getItem("selectedTheme")

    return <AccompagnePage
      isLoggedIn={true}
      initialCategory={storedTheme}
    />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-[#414143] mb-8">Quels documents avez-vous ?</h2>

          <div className="space-y-6">
            {documents.map((document) => (
              <div key={document} className="flex items-start space-x-3">
                <Checkbox
                  id={document}
                  checked={selectedDocuments.includes(document)}
                  onCheckedChange={(checked) =>
                    handleDocumentChange(document, checked as boolean)
                  }
                  className="mt-1"
                />
                <label htmlFor={document} className="text-base text-[#414143] leading-relaxed cursor-pointer flex-1">
                  {document}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg mt-8"
        >
          Valider mon profil
        </Button>
      </div>
    </div>
  )
}