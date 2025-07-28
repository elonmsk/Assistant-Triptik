"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PremiereConnexion from "./accompagne-page";
import CreateAccountPage from "./create-account-page";
import CreateAccountSimplePage from "./create-account-simple-page";
import { VersionBadge } from "@/components/ui/version-badge";

interface AuthPageProps {
  selectedTheme?: string | null;
  showTheme?: boolean;
  onContinuerSansConnexion?: () => void;
}

export default function AuthPage({
  selectedTheme,
  showTheme = true,
  onContinuerSansConnexion,
}: AuthPageProps) {
  const [currentView, setCurrentView] = useState<"auth" | "createAccount" | "createSimpleAccount" | "premiereConnexion">("auth");

  useEffect(() => {
    const handlePageShow = () => {
      setCurrentView("auth");
    };

    handlePageShow();
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const handleRetour = () => {
    setCurrentView("auth");
  };

  if (currentView === "premiereConnexion") {
    return <PremiereConnexion onRetour={handleRetour} />;
  }

  if (currentView === "createAccount") {
    return <CreateAccountPage />;
  }

  if (currentView === "createSimpleAccount") {
    return <CreateAccountSimplePage />;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 text-center overflow-hidden bg-white">
      <Button
        variant="ghost"
        onClick={() => setCurrentView("premiereConnexion")}
        className="absolute top-4 left-4"
      >
        ← Retour
      </Button>
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <h1 className="text-xl font-bold">
          Êtes-vous déjà venu sur notre site ?
        </h1>
        {selectedTheme && showTheme && (
          <p className="text-sm text-gray-600">
            Thème sélectionné : <span className="font-medium">{selectedTheme}</span>
          </p>
        )}
        <div className="w-full space-y-2">
          <p className="font-medium">Avez-vous déjà un profil ?</p>
          <Button className="w-full" onClick={() => setCurrentView("createAccount")}>
            Se connecter
          </Button>
        </div>
        <div className="w-full space-y-2">
          <p className="font-medium">1ère connexion</p>
          <Button className="w-full" onClick={() => setCurrentView("createSimpleAccount")}>
            Créer mon profil
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Pour vous apporter des réponses adaptées à votre situation et
            retrouver l'historique de vos recherches, nous vous suggérons de
            créer votre compte, qui est complètement anonyme.
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={onContinuerSansConnexion}
        >
          Continuer sans profil
        </Button>
        
        {/* Version Footer */}
        <div className="mt-8">
          <VersionBadge />
        </div>
      </div>
    </div>
  );
}
