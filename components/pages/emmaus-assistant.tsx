"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AccompagnePage, AccompagnantPage } from "@/components/pages"

export default function Component() {
  const [currentPage, setCurrentPage] = useState<"home" | "accompagne" | "accompagnant">("home")

  if (currentPage === "accompagne") {
    return <AccompagnePage />
  }

  if (currentPage === "accompagnant") {
    return <AccompagnantPage />
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setCurrentPage("home")}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-[#a7a8a9] text-[#414143]">
              Français
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Français</DropdownMenuItem>
            <DropdownMenuItem>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#414143] mb-6">Bienvenue sur l'assistant</h1>
          <p className="text-base text-[#73726d] mb-12">
            Je suis un outil pensé pour vous aider
            <br />à trouver les bonnes informations.
          </p>

          <p className="text-[#73726d] mb-8">Choisissez votre parcours</p>

          <div className="space-y-4 max-w-md mx-auto">
            <Button
              onClick={() => setCurrentPage("accompagnant")}
              className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-3 text-base rounded-lg"
            >
              👤 Accompagnant.e
            </Button>
            <Button
              onClick={() => setCurrentPage("accompagne")}
              className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-3 text-base rounded-lg"
            >
              👤 Accompagné.e
            </Button>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-64 h-[480px] bg-[#000000] rounded-[3rem] p-2">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                {/* Phone Screen Content */}
                <div className="p-4 h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                      😊
                    </div>
                    <span className="font-medium text-[#414143]">Assistant Triptek</span>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-tr-md max-w-xs">
                        <div className="text-sm">Obtenir une carte vitale</div>
                        <div className="text-xs opacity-75 mt-1">04:49 PM</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1">
                        😊
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-[#73726d] mb-1">Assistant Triptek</div>
                        <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-md text-sm text-[#414143]">
                          <p className="mb-3">
                            Pour obtenir votre carte Vitale, voici les étapes à suivre, que vous soyez un nouvel assuré
                            ou que vous souhaitiez renouveler votre carte :
                          </p>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold mb-2">1. Conditions préalables</h4>
                              <p className="text-xs">
                                • Numéro de sécurité sociale : Vous devez avoir un numéro de sécurité sociale définitif
                                pour faire la demande de votre carte Vitale.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">2. Demande de carte Vitale</h4>
                              <p className="text-xs mb-2">A. Pour une première carte Vitale :</p>
                              <div className="text-xs">
                                <p className="mb-1">En ligne :</p>
                                <ol className="list-decimal list-inside space-y-1 ml-2">
                                  <li>Connectez-vous à votre compte ameli.</li>
                                  <li>Accédez à la rubrique « Mes démarches » puis « Ma carte Vitale ».</li>
                                  <li>Sélectionnez l'assuré concerné (vous-même</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#414143] mb-8">Comment ça marche ?</h2>

          <div className="space-y-6 max-w-md mx-auto mb-8">
            <div className="flex items-center gap-4 text-left">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#6b7280] text-lg">Vous choisissez votre rôle</span>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#6b7280] text-lg">Vous posez vos questions</span>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#6b7280] text-lg">L'assistant vous répond</span>
            </div>
          </div>

          <Button className="w-full max-w-md bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-lg font-medium rounded-xl">
            Commencer
          </Button>
        </div>
      </main>
    </div>
  )
}
