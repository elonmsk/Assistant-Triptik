"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Volume2, Pause, ArrowLeft } from "lucide-react";
import AccountCreatedSuccessPage from "./account-created-success-page";
import PremiereConnexion from "./premiere-connexion"; // 💡 import du composant cible

export default function CreateAccountSimplePage({
  onLogin,
  onComplete,
  onBack,
}: {
  onLogin: () => void;
  onComplete?: () => void;
  onBack?: () => void;
}) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPremiereConnexion, setShowPremiereConnexion] = useState(false); // 💡 nouveau state
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const utterance = new SpeechSynthesisUtterance(`
    Votre compte restant anonyme, nous allons vous fournir un identifiant unique à mémoriser et vous proposer de créer votre propre mot de passe.
    Toutes les informations restent anonymes: aucune demande de nom, prénom, email, téléphone.
    Vous devez conserver votre identifiant et mot de passe. Si vous les oubliez vous perdrez l'historique de vos recherches et les informations concernant votre situation.
    Vous devrez alors recréer un nouveau compte et renseigner votre profil car aucune demande de mot de passe n'est autorisée dans le but de conserver votre anonymat.
  `);

  const handleCreateAccount = async () => {
    try {
      const response = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok && data.uid) {
        setUid(data.uid);
        localStorage.setItem("uid", data.uid);
        setShowSuccess(true);
      } else {
        alert("Erreur lors de la création du compte.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur de réseau.");
    }
  };

  const toggleSpeak = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleBack = () => {
    setShowPremiereConnexion(true); // 💡 on affiche PremiereConnexion
  };

  // Affichage conditionnel
  if (showPremiereConnexion) {
    return <PremiereConnexion />;
  }

  if (showSuccess && uid) {
    return (
      <AccountCreatedSuccessPage
        uid={uid}
        onContinue={onLogin}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="flex items-center gap-2 text-[#414143] hover:text-[#000000] p-0"
          >
            <ArrowLeft size={20} />
            Retour
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#414143] mb-4">
            Création de profil
          </h1>
          <p className="text-lg text-[#73726d]">
            Votre profil restera 100% anonyme
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <Label
              htmlFor="password"
              className="text-base font-medium text-[#414143] mb-2 block"
            >
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

        <div className="text-sm text-[#414143] leading-relaxed text-center relative pb-12">
          <p>
            Votre compte restant anonyme, nous allons vous fournir un
            identifiant unique à mémoriser et vous proposer de créer votre
            propre mot de passe. Toutes les informations restent anonymes: aucune
            demande de nom, prénom, email, téléphone. Vous devez conserver votre
            identifiant et mot de passe. Si vous les oubliez, vous perdrez
            l'historique de vos recherches et les informations concernant votre
            situation.
            <span className="text-red-500 font-medium">
              Vous devrez alors recréer un nouveau compte et renseigner votre
              profil car aucune demande de mot de passe n'est autorisée dans le
              but de conserver votre anonymat.
            </span>
          </p>
          <button
            onClick={toggleSpeak}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 p-2"
            aria-label="Lecture du texte"
          >
            {isSpeaking ? (
              <Pause size={28} className="text-[#414143]" />
            ) : (
              <Volume2 size={28} className="text-[#414143]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
