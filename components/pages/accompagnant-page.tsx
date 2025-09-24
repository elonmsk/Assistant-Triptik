"use client"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { SideMenu, ChatInput } from "@/components/ui-custom"
import {
  CommunityPage,
  SearchHistoryPage,
  LanguagesPage,
  AccompagnantQualificationPage,
} from "@/components/pages"
import { useChat } from "@/contexts/ChatContext"
import SimpleChatDisplay from "@/components/ui-custom/simple-chat-display"
import ProcessingIndicator from "@/components/chat/ProcessingIndicator"
import { VersionBadge } from "@/components/ui/version-badge"

export default function AccompagnantPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCommunity, setShowCommunity] = useState(false)
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { setUserInfo, state } = useChat()

  useEffect(() => {
    const numero =
      localStorage.getItem("uid") ||
      localStorage.getItem("numero") ||
      (999000000 + Date.now()).toString()
    setUserInfo(numero, "accompagnant")
  }, [setUserInfo])

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  const handleBackFromQualification = () => {
    setSelectedCategory(null)
  }

  const handleSendMessage = (message: string) => {
    console.log("Message envoyé:", message)
  }

  const showChatMessages = state.currentMessages.length > 0
  const showProcessingIndicator =
    state.processingState.currentStep !== "idle" && !showChatMessages
  const isChatOpen = useMemo(
    () => showChatMessages || showProcessingIndicator,
    [showChatMessages, showProcessingIndicator]
  )

  if (showCommunity) {
    return <CommunityPage onBack={() => setShowCommunity(false)} />
  }

  if (showSearchHistory) {
    return <SearchHistoryPage onBack={() => setShowSearchHistory(false)} />
  }

  if (showLanguages) {
    return <LanguagesPage onBack={() => setShowLanguages(false)} />
  }

  if (selectedCategory) {
    return (
      <AccompagnantQualificationPage
        category={selectedCategory}
        onBack={handleBackFromQualification}
      />
    )
  }

  const categories = [
    { name: "Santé", icon: "🏥" },
    { name: "Emploi", icon: "💼" },
    { name: "Famille", icon: "👨‍👩‍👧‍👦" },
    { name: "Formation en français", icon: "🇫🇷" },
    { name: "Formation professionnelle", icon: "🎓" },
    { name: "Logement", icon: "🏠" },
    { name: "Éducation", icon: "📚" },
    { name: "Juridique", icon: "⚖️" },
    { name: "Transport", icon: "🚌" },
    { name: "Démarche", icon: "📋" },
    { name: "Culture", icon: "🖼️" },
    { name: "Handicap", icon: "♿" },
    { name: "Aide", icon: "💰" },
  ]

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
          <Menu className="w-6 h-6 text-[#414143]" />
        </Button>
        <div className="flex items-center gap-3">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = "/")}
          />
        </div>
        <div className="flex items-center gap-3">
          <VersionBadge variant="header" />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-6 py-6">
        {/* Accueil (catégories) */}
        {!isChatOpen && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-[#414143] mb-4">
                Triptik à votre service
              </h1>
              <p className="text-base text-[#73726d] leading-relaxed mb-2">
                Vous recherchez des informations pour aider les personnes réfugiées
              </p>
              <p className="text-base text-[#73726d] leading-relaxed">
                Vous pouvez sélectionner une des thématiques ci-dessous ou poser
                directement votre question.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-xl font-normal text-[#000000] text-center mb-8">
                Choisissez une thématique
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleCategoryClick(category.name)}
                    className="h-auto min-h-[8rem] w-full flex flex-col items-center justify-center gap-3 border-2 border-[#e7e7e7] bg-white hover:bg-gray-50 rounded-xl p-4"
                  >
                    <div className="w-16 h-16 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-[#000000] text-center leading-tight break-words whitespace-normal">
                      {category.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Zone Chat */}
        {isChatOpen && (
          <section className="relative flex flex-col items-center">
            {/* Conteneur pour l'indicateur de progression et les messages */}
            <div className="w-full max-w-full sm:max-w-2xl mx-auto px-3 sm:px-0 break-words overflow-x-hidden">
              {/* Indicateur de progression */}
              {showProcessingIndicator && (
                <div className="mb-4">
                  <ProcessingIndicator
                    currentStep={state.processingState.currentStep}
                    message={state.processingState.message}
                    progress={state.processingState.progress}
                    category={state.processingState.category}
                  />
                </div>
              )}
              {/* Messages du chat */}
              {showChatMessages && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                      😊
                    </div>
                    <span className="text-base font-medium text-[#414143]">
                      Assistant Triptik
                    </span>
                  </div>
                  <div className="chat-scroll max-h-[calc(100vh-260px)] sm:max-h-[70vh] overflow-y-auto pr-1 break-words overflow-x-hidden">
                    <SimpleChatDisplay />
                  </div>
                </div>
              )}
              {/* État vide si jamais le chat est ouvert sans message */}
              {!showChatMessages && !showProcessingIndicator && (
                <div className="text-center text-sm text-gray-500 py-10">
                  Posez votre question en bas de l’écran.
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Champ de saisie du chat (fixe/sticky) */}
      <ChatInput
        theme={selectedCategory || undefined}
        onSendMessage={handleSendMessage}
      />

      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onCommunityClick={() => setShowCommunity(true)}
        onSearchHistoryClick={() => setShowSearchHistory(true)}
        onLanguagesClick={() => setShowLanguages(true)}
      />
    </div>
  )
}
