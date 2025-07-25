import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProfileChildrenPage from "./profile-children-page";

interface ProfileDisabilityPageProps {
  onBack: () => void;
  onNext: () => void;
}

export default function ProfileDisabilityPage({ onBack, onNext }: ProfileDisabilityPageProps) {
  const [disability, setDisability] = useState<"oui" | "non" | null>(null);
  const [numero, setNumero] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"disability" | "children">("disability");

  useEffect(() => {
    const stored = localStorage.getItem("uid");
    if (stored) setNumero(stored);
  }, []);

  const handleNext = async () => {
    if (!disability) return alert("Merci de sélectionner une réponse.");
    if (!numero) return alert("Identifiant utilisateur introuvable.");

    try {
      const res = await fetch("/api/update-handicap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, disability }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erreur lors de l'enregistrement.");

      setCurrentStep("children");
    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Erreur réseau");
    }
  };

  if (currentStep === "children") {
    return <ProfileChildrenPage onBack={() => setCurrentStep("disability")} onNext={onNext} />;
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md pb-12"> {/* ⬅️ espacement vers le bas */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        <div className="mb-8">
          <p className="block text-lg font-medium text-[#414143] mb-6">
            Avez-vous une situation de handicap ?
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => setDisability("oui")}
              className={`flex-1 ${disability === "oui" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              Oui
            </Button>
            <Button
              onClick={() => setDisability("non")}
              className={`flex-1 ${disability === "non" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              Non
            </Button>
          </div>
        </div>

        {/* Boutons navigation */}
        <div className="flex gap-4 mt-10">
          <Button
            onClick={onBack}
            className="flex-1 bg-gray-300 text-black py-4 rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            disabled={!disability}
            className="flex-1 bg-black text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Suivant
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
