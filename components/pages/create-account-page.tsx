"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CreateAccountSimplePage from "./create-account-simple-page";
import PremiereConnexion from "./premiere-connexion";
import { VersionBadge } from "@/components/ui/version-badge";

interface CreateAccountPageProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export default function CreateAccountPage({ onComplete, onBack }: CreateAccountPageProps) {
  const [showSimpleCreate, setShowSimpleCreate] = useState(false);
  const [showPremiereConnexion, setShowPremiereConnexion] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Réinitialisation de l'état ici si nécessaire
  }, []);

  const handleBack = () => {
    console.log("🔙 Bouton retour cliqué");
    if (onBack) {
      console.log("Exécution de onBack");
      onBack();
    } else {
      console.log("Affichage de PremiereConnexion");
      setShowPremiereConnexion(true);
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiant, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Une erreur est survenue.");
        return;
      }
      console.log("✅ Connexion réussie :", data);
      if (data.display_name) {
        localStorage.setItem("numero", data.display_name);
        console.log("👉 Numéro unique sauvegardé et affiché :", data.display_name);
      }
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Erreur réseau :", err);
      setErrorMessage("Erreur réseau.");
    }
  };

  if (showPremiereConnexion) {
    return (
      <PremiereConnexion
        onBack={() => setShowPremiereConnexion(false)}
        onComplete={onComplete}
      />
    );
  }

  if (showSimpleCreate) {
    return (
      <CreateAccountSimplePage
        onBack={() => setShowSimpleCreate(false)}
        onLogin={() => setShowLogin(true)}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-[#414143] hover:bg-gray-100 p-2 flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Retour
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#414143] mb-4">Se connecter</h1>
          <p className="text-lg text-[#73726d]">Votre profil restera 100% anonyme</p>
        </div>
        <div className="space-y-6 mb-8">
          <div>
            <Label htmlFor="identifier" className="text-base font-medium text-[#414143] mb-2 block">
              Identifiant
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="Votre identifiant à 6 chiffres"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 px-4 text-base border-gray-300 rounded-lg"
            />
          </div>
        </div>
        {errorMessage && (
          <div className="text-center text-red-500 font-medium mb-4">{errorMessage}</div>
        )}
        <Button
          onClick={handleLogin}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg mb-6"
        >
          Se connecter
        </Button>
        <div className="text-sm text-[#414143] leading-relaxed text-center">
          <p className="mb-4">
            Vous devez conserver votre identifiant et mot de passe. Si vous les oubliez, vos données seront perdues.
          </p>
          <p>
            <span className="text-red-500 font-medium">
              Aucun système de récupération n'est prévu.
            </span>
          </p>
        </div>
        
        {/* Version Footer */}
        <div className="text-center mt-8">
          <VersionBadge />
        </div>
      </div>
    </div>
  );
}
