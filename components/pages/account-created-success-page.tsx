"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import ProfileSetupPage from "./profile-setup-page"

interface AccountCreatedSuccessPageProps {
  onContinue: () => void
  onComplete?: () => void
}

export default function AccountCreatedSuccessPage({ onContinue, onComplete }: AccountCreatedSuccessPageProps) {
  const [showProfileSetup, setShowProfileSetup] = useState(false)

  // Generate a random 6-digit identifier (in real app, this would come from the server)
  const generatedId = Math.floor(100000 + Math.random() * 900000).toString()

  const handleContinueToProfile = () => {
    setShowProfileSetup(true)
  }

  const handleProfileSetupBack = () => {
    setShowProfileSetup(false)
  }

  const handleProfileSetupContinue = () => {
    // Profile setup is complete, call the completion handler
    if (onComplete) {
      onComplete()
    } else {
      onContinue()
    }
  }

  if (showProfileSetup) {
    return <ProfileSetupPage onBack={handleProfileSetupBack} onContinue={handleProfileSetupContinue} />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-4">Compte créé avec succès</h1>
        </div>

        {/* Identifier Display */}
        <div className="mb-8">
          <div className="bg-[#d9d9d9] rounded-lg p-6 text-center">
            <p className="text-base text-[#414143] mb-4">Votre identifiant</p>
            <div className="text-5xl font-bold text-[#000000] mb-2">{generatedId}</div>
          </div>
        </div>

        {/* Warning Text */}
        <div className="text-center mb-12">
          <p className="text-lg font-medium text-[#ffff00] bg-white px-4 py-2">
            Notez votre identifiant, il vous sera demandé à chaque connexion
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinueToProfile}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg"
        >
          Continuer vers la connexion
        </Button>
      </div>
    </div>
  )
}
