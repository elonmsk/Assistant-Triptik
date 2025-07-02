"use client"
import React from "react";
import { Button } from "@/components/ui/button";

interface AuthPageProps {
  onBack?: () => void;
  selectedTheme?: string | null;
  onSeConnecter?: () => void;
  onCreerCompte?: () => void;
  onContinuerSansConnexion?: () => void;
}

export default function AuthPage({
  onBack,
  selectedTheme,
  onSeConnecter,
  onCreerCompte,
  onContinuerSansConnexion
}: AuthPageProps) {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-6">
      {/* Bouton retour */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="self-start mb-4"
        >
          ← Retour
        </Button>
      )}

      <h1 className="text-xl font-bold">
        Etes vous deja venu sur notre site ?
      </h1>

      {selectedTheme && (
        <p className="text-sm text-gray-600">
          Thème sélectionné : <span className="font-medium">{selectedTheme}</span>
        </p>
      )}

      <div className="space-y-4 w-full max-w-xs">
        <p className="font-medium">Avez vous deja un profil ?</p>
        <Button
          className="w-full"
          onClick={onSeConnecter}
        >
          Se connecter
        </Button>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <p className="font-medium">1er connexion</p>
        <Button
          className="w-full"
          onClick={onCreerCompte}
        >
          Créer mon profil
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Pour vous apporter des réponses adaptées à votre situation et retrouver l'historique de vos recherches, nous vous suggérons de créer votre compte qui est complètement anonyme
        </p>
      </div>

      <Button
        variant="secondary"
        className="w-full max-w-xs"
        onClick={onContinuerSansConnexion}
      >
        continuer sans profil
      </Button>
    </div>
  );
}