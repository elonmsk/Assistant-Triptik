"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

interface ProfileDocumentsPageProps {
  onBack: () => void
  onComplete: () => void
}

export default function ProfileDocumentsPage({ onBack, onComplete }: ProfileDocumentsPageProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  const documents = [
    "Attestation OFPRA / Décision OFPRA / CNDA",
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
        // If "None" is selected, clear all other selections
        setSelectedDocuments(["Aucun de ces documents"])
      } else {
        // If "None" is unchecked, remove it
        setSelectedDocuments([])
      }
    } else {
      if (checked) {
        // Remove "None" if any other document is selected
        const newSelection = selectedDocuments.filter((doc) => doc !== "Aucun de ces documents")
        setSelectedDocuments([...newSelection, document])
      } else {
        // Remove the unchecked document
        setSelectedDocuments(selectedDocuments.filter((doc) => doc !== document))
      }
    }
  }

  const handleComplete = () => {
    // Profile is complete, call the completion handler to return to chat page as logged in
    onComplete()
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
          <h2 className="text-lg font-medium text-[#414143] mb-8">Quels documents avez-vous ?</h2>

          {/* Documents List */}
          <div className="space-y-6">
            {documents.map((document) => (
              <div key={document} className="flex items-start space-x-3">
                <Checkbox
                  id={document}
                  checked={selectedDocuments.includes(document)}
                  onCheckedChange={(checked) => handleDocumentChange(document, checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor={document} className="text-base text-[#414143] leading-relaxed cursor-pointer flex-1">
                  {document}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Button */}
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
