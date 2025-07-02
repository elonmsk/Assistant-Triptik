"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  CreateAccountPage,
  MyProceduresPage,
  MyAppointmentsPage,
  LanguagesPage,
  CategoryQualificationPage
} from "@/components/pages"
import AuthPage from "@/components/pages/premiere-connexion"
import CreateAccountSimplePage from "@/components/pages/create-account-simple-page"
import { AccompagneSideMenu, ChatInput } from "@/components/ui-custom"
import { Button } from "@/components/ui/button"
import { Menu, User } from "lucide-react"

interface AccompagnePageProps {
  isLoggedIn?: boolean
  initialCategory?: string | null
}

export default function AccompagnePage({ isLoggedIn: propIsLoggedIn, initialCategory }: AccompagnePageProps = {}) {
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMyProcedures, setShowMyProcedures] = useState(false)
  const [showMyAppointments, setShowMyAppointments] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [showPremiereConnexion, setShowPremiereConnexion] = useState(false)
  const [showCreateAccountSimple, setShowCreateAccountSimple] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn || false)
  const [numeroUnique, setNumeroUnique] = useState<string | null>(null)

  const [userData, setUserData] = useState<any | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    // Si on reçoit une catégorie initiale et qu'on est connecté, on l'affiche directement
    if (propIsLoggedIn && initialCategory) {
      setIsLoggedIn(true)
      setSelectedCategory(initialCategory)
      // Récupérer le numéro depuis localStorage
      const numero = localStorage.getItem("uid")
      if (numero) {
        setNumeroUnique(numero)
      }
    } else {
      // Logique existante pour forcer la déconnexion
      localStorage.removeItem("numero")
      setIsLoggedIn(false)
      setNumeroUnique(null)
    }
  }, [propIsLoggedIn, initialCategory])

  const handleAccountCreationComplete = () => {
    setIsLoggedIn(true)
    setShowCreateAccount(false)
    const numero = localStorage.getItem("numero")
    if (numero) {
      setNumeroUnique(numero)
    }
  }

  const handleLoadUserData = async () => {
    if (!numeroUnique) return
    const numeroInt = parseInt(numeroUnique, 10)
    console.log("👉 recherche numero =", numeroInt)

    const { data, error } = await supabase
      .from("info")
      .select("*")
      .eq("numero", numeroInt)
      .single()

    if (error) {
      console.error("Erreur Supabase", error)
      alert(`Erreur Supabase: ${error.message}`)
    } else {
      console.log("📦 Données Supabase", data)
      setUserData(data)
      setShowUserModal(true)
    }
  }

  const handleSendMessage = (message: string) => {
    console.log("Message envoyé:", message)
  }

  // Gestionnaires pour AuthPage
  const handleSeConnecter = () => {
    setShowPremiereConnexion(false)
    setShowCreateAccount(true)
  }

  const handleCreerCompte = () => {
    setShowPremiereConnexion(false)
    setShowCreateAccountSimple(true)
  }

  const handleContinuerSansConnexion = () => {
    setShowPremiereConnexion(false)
    // Retour à la page principale
  }

  // Gestionnaire pour les clics sur les thématiques
  const handleCategoryClick = (categoryName: string) => {
    setSelectedTheme(categoryName)
    localStorage.setItem("selectedTheme", categoryName) // Stocker le thème
    setShowPremiereConnexion(true)
    setSelectedCategory(categoryName)
  }

  /** HEADER présent partout */
  const renderHeader = () => (
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
      <Button variant="ghost" size="icon" onClick={handleLoadUserData}>
        <User className="w-6 h-6 text-[#414143]" />
      </Button>
    </header>
  )

  /** CONTENU CENTRAL: selon état */
  let content
  if (showCreateAccount) {
    content = <CreateAccountPage onComplete={handleAccountCreationComplete} />
  } else if (showPremiereConnexion) {
    content = <AuthPage
      onBack={() => setShowPremiereConnexion(false)}
      selectedTheme={selectedTheme}
      onSeConnecter={handleSeConnecter}
      onCreerCompte={handleCreerCompte}
      onContinuerSansConnexion={handleContinuerSansConnexion}
    />
  } else if (showCreateAccountSimple) {
    content = <CreateAccountSimplePage onBack={() => setShowCreateAccountSimple(false)} />
  } else if (selectedCategory) {
    content = <CategoryQualificationPage category={selectedCategory} onBack={() => setSelectedCategory(null)} />
  } else if (showMyProcedures) {
    content = <MyProceduresPage onBack={() => setShowMyProcedures(false)} />
  } else if (showMyAppointments) {
    content = <MyAppointmentsPage onBack={() => setShowMyAppointments(false)} />
  } else if (showLanguages) {
    content = <LanguagesPage onBack={() => setShowLanguages(false)} />
  } else {
    const categories = [
      { name: "Santé", icon: "🏥" },
      { name: "Emploi", icon: "💼" },
      { name: "Famille", icon: "👨‍👩‍👧‍👦" },
      { name: "Formation Français", icon: "🇫🇷" },
      { name: "Formation Pro", icon: "🎓" },
      { name: "Logement", icon: "🏠" },
      { name: "Éducation", icon: "📚" },
      { name: "Juridique", icon: "⚖️" },
      { name: "Transport", icon: "🚌" },
      { name: "Démarches", icon: "📋" },
      { name: "Culture", icon: "🖼️" },
      { name: "Handicap", icon: "♿" },
      { name: "Aides", icon: "💰" },
    ]

    content = (
      <main className="max-w-2xl mx-auto px-6 py-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#414143] mb-6 leading-tight">
            {isLoggedIn
              ? `Bonjour ${numeroUnique} ! Comment puis-je vous aider ?`
              : "Triptik à votre service"}
          </h1>
          <p className="text-base text-[#73726d] leading-relaxed">
            {isLoggedIn
              ? "Votre profil est maintenant configuré. Posez-moi vos questions ou choisissez une thématique."
              : "Vous pouvez sélectionner une des thématiques ci-dessous ou poser directement une question"}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-normal text-[#000000] text-center mb-8">Choisissez une thématique</h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleCategoryClick(category.name)}
                className="h-24 w-full flex flex-col items-center justify-center gap-2 border-2 border-[#e7e7e7] bg-white hover:bg-gray-50 rounded-xl p-3"
              >
                <div className="w-11 h-11 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                  <span className="text-lg">{category.icon}</span>
                </div>
                <span className="text-sm font-medium text-[#000000] text-center leading-tight">
                  {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {!isLoggedIn && (
          <>

          </>
        )}

        {isLoggedIn && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connecté</span>
            </div>
          </div>
        )}
      </main>
    )
  }

  // Vérifier si on doit afficher le header et le chat
  const shouldShowHeaderAndChat = !showCreateAccount && !showPremiereConnexion && !showCreateAccountSimple && !selectedCategory

  return (
    <div className="min-h-screen bg-[#ffffff] pb-24">
      {shouldShowHeaderAndChat && renderHeader()}
      {content}
      {shouldShowHeaderAndChat && <ChatInput onSendMessage={handleSendMessage} />}
      <AccompagneSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNewConversationClick={() => {}}
        onMyProceduresClick={() => setShowMyProcedures(true)}
        onMyAppointmentsClick={() => setShowMyAppointments(true)}
        onLanguagesClick={() => setShowLanguages(true)}
      />

      {showUserModal && userData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
            <h2 className="text-xl font-bold mb-4">Mon Profil Supabase</h2>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
            <Button onClick={() => setShowUserModal(false)} className="mt-4 w-full">
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}