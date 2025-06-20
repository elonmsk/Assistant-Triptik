"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import AccountCreatedSuccessPage from "./account-created-success-page"

interface CreateAccountSimplePageProps {
  onBack: () => void
  onLogin: () => void
  onComplete?: () => void
}

export default function CreateAccountSimplePage({ onBack, onLogin, onComplete }: CreateAccountSimplePageProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCreateAccount = () => {
    // Here you would normally send the password to your backend
    // For now, we'll just show the success page
    setShowSuccess(true)
  }

  const handleContinueToLogin = () => {
    // Go back to the login page
    onLogin()
  }

  if (showSuccess) {
    return <AccountCreatedSuccessPage onContinue={handleContinueToLogin} onComplete={onComplete} />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#414143] mb-4">Création de compte</h1>
          <p className="text-lg text-[#73726d]">Votre compte restera 100% anonyme</p>
        </div>

        {/* Form */}
        <div className="space-y-6 mb-8">
          <div>
            <Label htmlFor="password" className="text-base font-medium text-[#414143] mb-2 block">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Creez votre mot de passe"
              className="w-full py-4 px-4 text-base border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Create Account Button */}
        <Button
          onClick={handleCreateAccount}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg mb-6"
        >
          Créer mon Compte
        </Button>

        {/* Or Divider */}
        <div className="text-center mb-6">
          <span className="text-lg text-[#73726d]">ou</span>
        </div>

        {/* Login Button */}
        <Button
          variant="outline"
          onClick={onLogin}
          className="w-full border-2 border-[#414143] text-[#414143] hover:bg-gray-50 py-4 text-base rounded-lg mb-8"
        >
          Déjà un compte ? Se connecter
        </Button>

        {/* Information Text */}
        <div className="text-sm text-[#414143] leading-relaxed text-center">
          <p className="mb-4">
            Votre compte restant anonyme, nous allons vous fournir un identifiant unique à mémoriser et vous proposer de
            créer votre propre mot de passe. Toutes les informations restent anonymes: aucune demande de nom, prénom,
            email, téléphone..
          </p>
          <p className="mb-4">
            Vous devez conserver votre identifiant et mot de passe. Si vous les oubliez vous perdrez l'historique de vos
            recherches et les informations concernant votre situation.
          </p>
          <p>
            <span className="text-red-500 font-medium">
              Vous devrez alors recréer un nouveau compte et renseigner votre profil car aucune demande de mot de passe
              n'est autorisée dans le but de conserver votre anonymat.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
