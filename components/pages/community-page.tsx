"use client"

import { ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CommunityPageProps {
  onBack: () => void
}

export default function CommunityPage({ onBack }: CommunityPageProps) {
  const communityGroups = [
    {
      title: "Développer l'interculturalité pour accélérer l'intégration des primo-arrivants",
      icon: MessageCircle,
    },
    {
      title: "Prévenir et accompagner les violences faites aux femmes exilées",
      icon: MessageCircle,
    },
  ]

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="flex items-center py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-[#414143]" />
        </Button>
        <h1 className="text-xl font-semibold text-[#414143] flex-1 text-center">Communauté</h1>
        <div className="flex items-center gap-3 mr-4">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = "/")}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Section Title */}
        <h2 className="text-lg text-[#a7a8a9] mb-8">Mes groupes de bonne pratique</h2>

        {/* Community Groups */}
        <div className="space-y-6">
          {communityGroups.map((group, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <group.icon className="w-6 h-6 text-[#73726d]" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-[#414143] leading-relaxed">{group.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
