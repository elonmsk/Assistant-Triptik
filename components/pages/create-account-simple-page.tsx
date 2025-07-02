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
  const [uid, setUid] = useState("")
  const [password, setPassword] = useState("")

  const handleCreateAccount = async () => {
    try {
      const response = await fetch("/api/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      if (response.ok && data.uid) {
        setUid(data.uid)
        localStorage.setItem("uid", data.uid)
        setShowSuccess(true)
      } else {
        alert("Erreur lors de la création du compte.")
      }
    } catch (error) {
      console.error("Erreur réseau :", error)
      alert("Erreur de réseau.")
    }
  }

  const handleContinueToLogin = () => {
    onLogin()
  }

  if (showSuccess && uid) {
    return <AccountCreatedSuccessPage uid={uid} onContinue={handleContinueToLogin} onComplete={onComplete} />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#414143] mb-4">Création de profil</h1>
          <p className="text-lg text-[#73726d]">Votre profil restera 100% anonyme</p>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <Label htmlFor="password" className="text-base font-medium text-[#414143] mb-2 block">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Créez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 px-4 text-base border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <Button
          onClick={handleCreateAccount}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg mb-6"
        >
          Créer mon profil
        </Button>




        <div className="text-sm text-[#414143] leading-relaxed text-center">
          <p className="mb-4">
            Votre profil restera anonyme. Nous allons vous fournir un identifiant unique à mémoriser.
          </p>
          <p className="mb-4">
            Si vous oubliez cet identifiant et le mot de passe, vos données seront perdues.
          </p>
          <p>
            <span className="text-red-500 font-medium">
              Aucun système de récupération n'est prévu afin de garantir l'anonymat.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
