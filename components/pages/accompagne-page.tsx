"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AccompagneSideMenu, ChatInput } from "@/components/ui-custom"
import {
  CreateAccountPage,
  MyProceduresPage,
  MyAppointmentsPage,
  LanguagesPage,
  CategoryQualificationPage
} from "@/components/pages"

export default function AccompagnePage() {
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMyProcedures, setShowMyProcedures] = useState(false)
  const [showMyAppointments, setShowMyAppointments] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleAccountCreationComplete = () => {
    // User has completed account creation and profile setup
    setIsLoggedIn(true)
    setShowCreateAccount(false)
  }

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  const handleBackFromQualification = () => {
    setSelectedCategory(null)
  }

  const handleSendMessage = (message: string) => {
    console.log("Message envoyé:", message)
    // Ici vous pouvez ajouter la logique pour traiter le message
  }

  if (showCreateAccount) {
    return <CreateAccountPage onComplete={handleAccountCreationComplete} />
  }

  if (selectedCategory) {
    return <CategoryQualificationPage category={selectedCategory} onBack={handleBackFromQualification} />
  }

  if (showMyProcedures) {
    return <MyProceduresPage onBack={() => setShowMyProcedures(false)} />
  }

  if (showMyAppointments) {
    return <MyAppointmentsPage onBack={() => setShowMyAppointments(false)} />
  }

  if (showLanguages) {
    return <LanguagesPage onBack={() => setShowLanguages(false)} />
  }

  const categories = [
    { name: "Santé", icon: "🏥" },
    { name: "Emploi", icon: "💼" },
    { name: "Famille", icon: "👨‍👩‍👧‍👦" },
    { name: "Formation", icon: "🇫🇷" },
    { name: "Logement", icon: "🏠" },
    { name: "Éducation", icon: "📚" },
    { name: "Juridique", icon: "⚖️" },
    { name: "Transport", icon: "🚌" },
    { name: "Démarches", icon: "📋" },
    { name: "Culture", icon: "🖼️" },
    { name: "Handicap", icon: "♿" },
    { name: "Aides", icon: "💰" },
  ]

  return (
    <div className="min-h-screen bg-[#ffffff] pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
          <Menu className="w-6 h-6 text-[#414143]" />
        </Button>
        <div className="flex items-center gap-3">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = "/")}
          />
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-4">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#414143] mb-6 leading-tight">
            {isLoggedIn ? "Bonjour ! Comment puis-je vous aider ?" : "Triptik à votre service"}
          </h1>
          <p className="text-base text-[#73726d] leading-relaxed">
            {isLoggedIn
              ? "Votre profil est maintenant configuré. Posez-moi vos questions ou choisissez une thématique."
              : "Vous pouvez poser directement une question ou sélectionner une des thématique ci-dessous"}
          </p>
        </div>

        {/* Categories Section */}
        <div className="mb-6">
          <h2 className="text-xl font-normal text-[#000000] text-center mb-8">Choisissez une thématique</h2>

          {/* Categories Grid - 4 columns, 3 rows */}
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleCategoryClick(category.name)}
                className="h-24 w-full flex flex-col items-center justify-center gap-2 border-2 border-[#e7e7e7] bg-white hover:bg-gray-50 rounded-xl p-3"
              >
                {/* Icon Circle */}
                <div className="w-11 h-11 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                  <span className="text-lg">{category.icon}</span>
                </div>
                {/* Category Name */}
                <span className="text-sm font-medium text-[#000000] text-center leading-tight">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Create Account Section - Only show if not logged in */}
        {!isLoggedIn && (
          <>
            {/* Or Divider */}
            <div className="text-center mb-6">
              <span className="text-xl font-normal text-[#000000]">ou</span>
            </div>

            {/* Create Account */}
            <div className="text-center">
              <Button
                onClick={() => setShowCreateAccount(true)}
                className="w-full bg-[#d9d9d9] hover:bg-gray-400 text-[#000000] py-3 text-base font-semibold rounded-lg mb-4"
              >
                Créer un compte / se connecter
              </Button>

              <p className="text-xs font-semibold text-[#000000] leading-tight">
                Afin d'apporter des réponses adaptées à votre situation et que vous puissiez retrouver l'historique de
                vos recherches, nous vous proposons de créer votre compte qui est complètement anonyme
              </p>
            </div>
          </>
        )}

        {/* Logged in status indicator */}
        {isLoggedIn && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connecté</span>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} />

      <AccompagneSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNewConversationClick={() => {}}
        onMyProceduresClick={() => setShowMyProcedures(true)}
        onMyAppointmentsClick={() => setShowMyAppointments(true)}
        onLanguagesClick={() => setShowLanguages(true)}
      />
    </div>
  )
}
