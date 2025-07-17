"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import ProfileGenrePage from "./profile-genre-page" // Importez le composant ProfileGenrePage

interface ProfileDocumentsPageProps {
  onBack: () => void
  onComplete: () => void
}

export default function ProfileDocumentsPage({ onBack, onComplete }: ProfileDocumentsPageProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [numero, setNumero] = useState<string | null>(null)
  const [showGenrePage, setShowGenrePage] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("uid")
    if (stored) setNumero(stored)
  }, [])

  const documents = [
    "Attestation de demande d'asile (ADA)",
    "Attestation prolongation d'instruction (API)",
    "Carte de séjour (carte de résident)",
    "Titre de séjour (carte de résident avec mention « réfugié »)",
    "Passeport",
    "Récépissé de décision favorable (titre de séjour validé)",
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
      setShowGenrePage(true)
    } catch (err) {
      console.error("Erreur API :", err)
      alert("Erreur réseau.")
    }
  }

  if (showGenrePage) {
    return <ProfileGenrePage onBack={onBack} onNext={onComplete} />
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
        <div className="flex gap-4 mt-8">
          <Button
            onClick={onBack}
            className="flex-1 bg-gray-300 text-black py-4 rounded-lg"
          >
            Précédent
          </Button>
          <Button
            onClick={handleComplete}
            className="flex-1 bg-black text-white py-4 text-base rounded-lg"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
