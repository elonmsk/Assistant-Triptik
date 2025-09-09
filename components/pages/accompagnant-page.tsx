<<<<<<< HEAD
"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SideMenu, ChatInput } from "@/components/ui-custom";
import {
  CommunityPage,
  SearchHistoryPage,
  LanguagesPage,
  AccompagnantQualificationPage,
} from "@/components/pages";
import { useChat } from "@/contexts/ChatContext";
import SimpleChatDisplay from "@/components/ui-custom/simple-chat-display";
import ProcessingIndicator from "@/components/chat/ProcessingIndicator";
import { VersionBadge } from "@/components/ui/version-badge";

export default function AccompagnantPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Contexte chat
  const { setUserInfo, state } = useChat();

  // Initialiser l'identité "accompagnant"
=======
"use client"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { SideMenu, ChatInput } from "@/components/ui-custom"
import { CommunityPage, SearchHistoryPage, LanguagesPage, AccompagnantQualificationPage } from "@/components/pages"
import { useChat } from '@/contexts/ChatContext'
import SimpleChatDisplay from '@/components/ui-custom/simple-chat-display'
import ProcessingIndicator from '@/components/chat/ProcessingIndicator'
import { VersionBadge } from "@/components/ui/version-badge"

export default function AccompagnantPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCommunity, setShowCommunity] = useState(false)
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { setUserInfo, state } = useChat()

>>>>>>> guillaume
  useEffect(() => {
    const numero =
      localStorage.getItem("uid") ||
      localStorage.getItem("numero") ||
      (999000000 + Date.now()).toString();
    setUserInfo(numero, "accompagnant");
  }, [setUserInfo]);

  const handleCategoryClick = (categoryName: string) => setSelectedCategory(categoryName);
  const handleBackFromQualification = () => setSelectedCategory(null);
  const handleSendMessage = (message: string) => console.log("Message envoyé:", message);

  const showChatFullScreen = state.currentMessages.length > 0; // plein écran si au moins 1 msg
  const showProcessingIndicator =
    state.processingState.currentStep !== "idle" && !showChatFullScreen;

  // 🔒 Figer le fond quand le chat plein écran OU le menu latéral est ouvert
  const isScrollLocked = showChatFullScreen || isMenuOpen;

<<<<<<< HEAD
  useEffect(() => {
    if (!isScrollLocked) return;
=======
  const showChatMessages = state.currentMessages.length > 0
  const showProcessingIndicator = state.processingState.currentStep !== 'idle' && !showChatMessages
  const isChatOpen = useMemo(() => showChatMessages || showProcessingIndicator, [showChatMessages, showProcessingIndicator])
>>>>>>> guillaume

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    // Fixe le body pour empêcher tout scroll de fond
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overscrollBehavior = "none";

    // iOS: bloque le scroll tactile
    const preventDefault = (e: TouchEvent) => e.preventDefault();
    body.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      body.removeEventListener("touchmove", preventDefault as any);
      html.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overscrollBehavior = "";
      window.scrollTo(0, scrollY);
    };
  }, [isScrollLocked]);

  // Pages secondaires
  if (showCommunity) return <CommunityPage onBack={() => setShowCommunity(false)} />;
  if (showSearchHistory) return <SearchHistoryPage onBack={() => setShowSearchHistory(false)} />;
  if (showLanguages) return <LanguagesPage onBack={() => setShowLanguages(false)} />;
  if (selectedCategory)
    return (
      <AccompagnantQualificationPage
        category={selectedCategory}
        onBack={handleBackFromQualification}
      />
    );

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
  ];

  return (
<<<<<<< HEAD
    <div className={`bg-[#ffffff] ${isScrollLocked ? "h-screen" : "min-h-screen"} pb-24`}>
=======
    <div className="min-h-screen bg-white pb-24">
>>>>>>> guillaume
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

      {/* Contenu accueil */}
      <main className="w-full max-w-4xl mx-auto px-6 py-6">
<<<<<<< HEAD
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#414143] mb-4">Triptik à votre service</h1>
          <p className="text-base text-[#73726d] leading-relaxed mb-2">
            Vous recherchez des informations pour aider les personnes réfugiées
          </p>
          <p className="text-base text-[#73726d] leading-relaxed">
            Vous pouvez sélectionner une des thématiques ci-dessous ou poser directement votre question.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-normal text-[#000000] text-center mb-8">Choisissez une thématique</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleCategoryClick(category.name)}
                className="h-32 w-full max-w-[180px] mx-auto flex flex-col items-center justify-center gap-3 border-2 border-[#e7e7e7] bg-white hover:bg-gray-50 rounded-xl p-4"
              >
                <div className="w-16 h-16 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <span className="text-base font-medium text-[#000000] text-center leading-tight">
                  {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </main>

      {/* Indicateur de traitement (pendant qu'il n'y a pas de chat plein écran) */}
      {showProcessingIndicator && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto p-4">
            <ProcessingIndicator
              currentStep={state.processingState.currentStep}
              message={state.processingState.message}
              progress={state.processingState.progress}
              category={state.processingState.category}
            />
          </div>
        </div>
      )}

      {/* Input docké en bas quand PAS de chat plein écran */}
      {!showChatFullScreen && (
        <ChatInput theme={selectedCategory || undefined} onSendMessage={handleSendMessage} />
      )}
=======
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
                Vous pouvez sélectionner une des thématiques ci-dessous ou poser directement votre question.
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
                    className="h-32 w-full max-w-[180px] mx-auto flex flex-col items-center justify-center gap-3 border-2 border-[#e7e7e7] bg-white hover:bg-gray-50 rounded-xl p-4"
                  >
                    <div className="w-16 h-16 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <span className="text-base font-medium text-[#000000] text-center leading-tight">
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
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
                    <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
                  </div>
                  <div className="chat-scroll max-h-[calc(100vh-260px)] sm:max-h-[70vh] overflow-y-auto pr-1 break-words overflow-x-hidden">
                    <SimpleChatDisplay />
                  </div>
                </div>
              )}
              {/* État vide si jamais le chat est ouvert sans message */}
              {!showChatMessages && !showProcessingIndicator && (
                <div className="text-center text-sm text-gray-500 py-10">Posez votre question en bas de l’écran.</div>
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
>>>>>>> guillaume

      {/* —— CHAT PLEIN ÉCRAN —— */}
      {showChatFullScreen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Top bar du chat */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
              <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
            </div>
            <div className="flex items-center gap-2">
              <VersionBadge variant="header" />
              <Button variant="ghost" size="icon" title="Chat plein écran">
                <X className="w-5 h-5 text-[#414143]" />
              </Button>
            </div>
          </div>

          {/* Zone messages avec scroll interne */}
          <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 overflow-y-auto">
            <SimpleChatDisplay />
          </div>

          {/* Input dans la vue plein écran */}
          <div className="w-full max-w-4xl mx-auto px-4 pb-4">
            <ChatInput
              theme={selectedCategory || undefined}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}

      {/* Menu latéral */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onCommunityClick={() => setShowCommunity(true)}
        onSearchHistoryClick={() => setShowSearchHistory(true)}
        onLanguagesClick={() => setShowLanguages(true)}
      />
    </div>
  );
}
