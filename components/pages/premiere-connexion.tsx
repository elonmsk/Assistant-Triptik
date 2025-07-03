"use client"
import React from "react";
import { Button } from "@/components/ui/button";

interface AuthPageProps {
  onBack?: () => void;
  selectedTheme?: string | null;
  showTheme?: boolean; // Nouvelle prop pour contrôler l'affichage du thème
  onSeConnecter?: () => void;
  onCreerCompte?: () => void;
  onContinuerSansConnexion?: () => void;
}

export default function AuthPage({
  onBack,
  selectedTheme,
  showTheme = true, // Par défaut, afficher le thème
  onSeConnecter,
  onCreerCompte,
  onContinuerSansConnexion
}: AuthPageProps) {

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 text-center overflow-hidden bg-white">
      {/* Bouton retour */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-4 left-4"
        >
          ← Retour
        </Button>
      )}

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <h1 className="text-xl font-bold">
          Êtes-vous déjà venu sur notre site ?
        </h1>

        {/* Affichage conditionnel du thème */}
        {selectedTheme && showTheme && (
          <p className="text-sm text-gray-600">
            Thème sélectionné : <span className="font-medium">{selectedTheme}</span>
          </p>
        )}

        <div className="w-full space-y-2">
          <p className="font-medium">Avez-vous déjà un profil ?</p>
          <Button
            className="w-full"
            onClick={onSeConnecter}
          >
            Se connecter
          </Button>
        </div>

        <div className="w-full space-y-2">
          <p className="font-medium">1ère connexion</p>
          <Button
            className="w-full"
            onClick={onCreerCompte}
          >
            Créer mon profil
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Pour vous apporter des réponses adaptées à votre situation et retrouver l'historique de vos recherches, nous vous suggérons de créer votre compte, qui est complètement anonyme.
          </p>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={onContinuerSansConnexion}
        >
          Continuer sans profil
        </Button>
      </div>
    </div>
  );
}