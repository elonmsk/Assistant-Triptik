"use client"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { useState } from "react"
import ProfileDocumentsPage from "./profile-documents-page" // Importez le composant ProfileDocumentsPage

interface ProfileSetupPageProps {
  onBack: () => void
  onContinue: () => void
}

export default function ProfileSetupPage({ onBack, onContinue }: ProfileSetupPageProps) {
  const [showDocumentsQuestion, setShowDocumentsQuestion] = useState(false)

  const handleContinue = () => {
    setShowDocumentsQuestion(true)
  }

  const handleDocumentsBack = () => {
    setShowDocumentsQuestion(false)
  }

  const handleDocumentsNext = () => {
    // Les questions du profil sont complètes, appelez le gestionnaire de complétion
    onContinue()
  }

  if (showDocumentsQuestion) {
    return <ProfileDocumentsPage onBack={handleDocumentsBack} onNext={handleDocumentsNext} />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-12">Mon profil</h1>
          <h2 className="text-2xl font-semibold text-[#414143] mb-8">Bienvenue</h2>
          <p className="text-base text-[#73726d] leading-relaxed mb-12">
            Je vais vous poser quelques questions pour bien comprendre votre situation.
          </p>
        </div>
        {/* Time Indicator */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <Clock className="w-5 h-5 text-[#73726d]" />
          <span className="text-base text-[#73726d]">Cette démarche prend environ 2 minutes</span>
        </div>
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-2 border-[#414143] text-[#414143] hover:bg-gray-50 py-3 text-base rounded-lg"
          >
            Précédent
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 bg-[#000000] hover:bg-[#1c1c1c] text-white py-3 text-base rounded-lg"
          >
            D'accord
          </Button>
        </div>
      </div>
    </div>
  )
}
