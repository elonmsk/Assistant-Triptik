"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import CreateAccountSimplePage from "./create-account-simple-page"

interface CreateAccountPageProps {
  onComplete?: () => void
}

export default function CreateAccountPage({ onComplete }: CreateAccountPageProps) {
  const [showSimpleCreate, setShowSimpleCreate] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  if (showSimpleCreate) {
    return (
      <CreateAccountSimplePage
        onBack={() => setShowSimpleCreate(false)}
        onLogin={() => setShowLogin(true)}
        onComplete={onComplete}
      />
    )
  }

  if (showLogin) {
    // You can create a separate login page component here
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#414143] mb-4">Page de connexion</h1>
          <Button onClick={() => setShowLogin(false)} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#414143] mb-4">Se connecter</h1>
          <p className="text-lg text-[#73726d]">Votre compte restera 100% anonyme</p>
        </div>

        {/* Form */}
        <div className="space-y-6 mb-8">
          <div>
            <Label htmlFor="identifier" className="text-base font-medium text-[#414143] mb-2 block">
              Identifiant
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="Votre identifiant à 6 chiffres"
              className="w-full py-4 px-4 text-base border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-base font-medium text-[#414143] mb-2 block">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              className="w-full py-4 px-4 text-base border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Login Button */}
        <Button
          onClick={onComplete}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg mb-6"
        >
          Se connecter
        </Button>

        {/* Or Divider */}
        <div className="text-center mb-6">
          <span className="text-lg text-[#73726d]">ou</span>
        </div>

        {/* Create Account Button */}
        <Button
          variant="outline"
          onClick={() => setShowSimpleCreate(true)}
          className="w-full border-2 border-[#414143] text-[#414143] hover:bg-gray-50 py-4 text-base rounded-lg mb-8"
        >
          Créer un compte
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
