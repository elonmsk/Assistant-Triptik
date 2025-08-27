import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  MyProceduresPage,
  MyAppointmentsPage,
  LanguagesPage,
  CategoryQualificationPage,
} from "@/components/pages";
import AuthPage from "@/components/pages/premiere-connexion";
import CreateAccountSimplePage from "@/components/pages/create-account-simple-page";
import CreateAccountPage from "@/components/pages/create-account-page";
import { AccompagneSideMenu, ChatInput } from "@/components/ui-custom";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { useChat } from '@/contexts/ChatContext';
import SimpleChatDisplay from '@/components/ui-custom/simple-chat-display';
import ProcessingIndicator from '@/components/chat/ProcessingIndicator';
import { VersionBadge } from "@/components/ui/version-badge";

interface AccompagnePageProps {
  isLoggedIn?: boolean;
  initialCategory?: string | null;
}

export default function AccompagnePage({
  isLoggedIn: propIsLoggedIn,
  initialCategory,
}: AccompagnePageProps = {}) {
  // États
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMyProcedures, setShowMyProcedures] = useState(false);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showPremiereConnexion, setShowPremiereConnexion] = useState(false);
  const [showCreateAccountSimple, setShowCreateAccountSimple] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn || false);
  const [numeroUnique, setNumeroUnique] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const { setUserInfo, state } = useChat();

  // Effets
  useEffect(() => {
    if (propIsLoggedIn && initialCategory) {
      setIsLoggedIn(true);
      setSelectedCategory(initialCategory);
      const numero = localStorage.getItem("uid") || localStorage.getItem("numero");
      if (numero) setNumeroUnique(numero);
    } else {
      const numero = localStorage.getItem("uid") || localStorage.getItem("numero");
      if (numero) setNumeroUnique(numero);
      else {
        localStorage.removeItem("numero");
        setNumeroUnique(null);
      }
    }
  }, [propIsLoggedIn, initialCategory]);

  useEffect(() => {
    if (numeroUnique) setUserInfo(numeroUnique, 'accompagne');
  }, [numeroUnique, setUserInfo]);

  // Handlers
  const handleAccountCreationComplete = () => {
    setIsLoggedIn(true);
    setShowCreateAccount(false);
    setShowCreateAccountSimple(false);
    const numero = localStorage.getItem("uid") || localStorage.getItem("numero");
    if (numero) setNumeroUnique(numero);
  };

  const handleLoadUserData = async () => {
    // 🔒 Sécurité : ne rien faire si pas connecté
    if (!isLoggedIn || !numeroUnique) return;

    const numeroInt = parseInt(numeroUnique, 10);
    const { data, error } = await supabase
      .from("info")
      .select("*")
      .eq("numero", numeroInt)
      .single();
    if (error) console.error("Erreur Supabase", error);
    else {
      setUserData(data);
      setShowUserModal(true);
    }
  };

  const handleSendMessage = (message: string) => console.log("Message envoyé:", message);

  const handleSeConnecter = () => {
    setShowPremiereConnexion(false);
    setShowCreateAccount(true);
  };

  const handleCreerCompte = () => {
    setShowPremiereConnexion(false);
    setShowCreateAccountSimple(true);
  };

  const handleContinuerSansConnexion = () => {
    setShowPremiereConnexion(false);
    const guestId = `guest_${Date.now()}`;
    setNumeroUnique(guestId);
    setIsLoggedIn(false);
  };

  const handleBackFromAuth = () => {
    setShowPremiereConnexion(false);
    setSelectedTheme(null);
    setSelectedCategory(null);
    localStorage.removeItem("selectedTheme");
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedTheme(categoryName);
    localStorage.setItem("selectedTheme", categoryName);
    setSelectedCategory(categoryName);
    setIsMenuOpen(false);
    if (!isLoggedIn) setShowPremiereConnexion(true);
  };

  const handleConnexionButtonClick = () => setShowPremiereConnexion(true);

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("numero");
    setIsLoggedIn(false);
    setNumeroUnique(null);
    setUserData(null);
    window.location.reload();
  };

  // Rendu du header
  const renderHeader = () => (
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
        {isLoggedIn && (
          <>
            <Button variant="ghost" size="icon" onClick={handleLoadUserData}>
              {/* 👤 Icône profil affichée UNIQUEMENT si connecté */}
              <User className="w-6 h-6 text-[#414143]" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              Déconnexion
            </Button>
          </>
        )}
      </div>
    </header>
  );

  // Contenu principal
  let content;
  if (showCreateAccount) {
    content = <CreateAccountPage onComplete={handleAccountCreationComplete} />;
  } else if (showPremiereConnexion) {
    content = (
      <AuthPage
        onBack={handleBackFromAuth}
        selectedTheme={selectedTheme}
        showTheme={false}
        onSeConnecter={handleSeConnecter}
        onCreerCompte={handleCreerCompte}
        onContinuerSansConnexion={handleContinuerSansConnexion}
      />
    );
  } else if (showCreateAccountSimple) {
    content = (
      <CreateAccountSimplePage
        onBack={() => setShowCreateAccountSimple(false)}
        onLogin={() => setShowCreateAccount(true)}
        onComplete={handleAccountCreationComplete}
      />
    );
  } else if (selectedCategory) {
    content = (
      <CategoryQualificationPage
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        isConnected={isLoggedIn}
      />
    );
  } else if (showMyProcedures) {
    content = <MyProceduresPage onBack={() => setShowMyProcedures(false)} />;
  } else if (showMyAppointments) {
    content = <MyAppointmentsPage onBack={() => setShowMyAppointments(false)} />;
  } else if (showLanguages) {
    content = <LanguagesPage onBack={() => setShowLanguages(false)} />;
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
    ];

    content = (
      <main className="w-full max-w-4xl mx-auto px-6 py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#414143] mb-4">
            {isLoggedIn ? `Bonjour ${numeroUnique} ! Comment puis-je vous aider ?` : "Triptik à votre service"}
          </h1>
        <p className="text-base text-[#73726d]">
            {isLoggedIn
              ? "Votre profil est maintenant configuré. Posez-moi vos questions ou choisissez une thématique."
              : "Vous pouvez sélectionner une des thématiques ci-dessous ou poser directement une question"}
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
                <div className="w-16 h-16 bg-[#f8f8f8] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <span className="text-base font-medium text-[#000000] text-center leading-tight">
                  {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
        {isLoggedIn && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connecté</span>
            </div>
          </div>
        )}
      </main>
    );
  }

  // Conditions d'affichage
  const shouldShowHeaderAndChat =
    !showCreateAccount &&
    !showPremiereConnexion &&
    !showCreateAccountSimple &&
    !selectedCategory;

  const showChatMessages =
    shouldShowHeaderAndChat &&
    (isLoggedIn || (numeroUnique && numeroUnique.startsWith('guest_'))) &&
    state.currentMessages.length > 0;

  const showProcessingIndicator =
    shouldShowHeaderAndChat &&
    state.processingState.currentStep !== 'idle' &&
    !showChatMessages;

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      {shouldShowHeaderAndChat && renderHeader()}
      {content}
      {showChatMessages && (
        <div className="fixed top-20 left-0 right-0 bottom-24 bg-white z-30 border-t border-gray-200 flex flex-col">
          <div className="max-w-4xl mx-auto p-4 border-b border-gray-100 w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
              <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
            </div>
          </div>
          <div className="flex-1 max-w-4xl mx-auto p-6 overflow-y-auto w-full">
            <SimpleChatDisplay />
          </div>
        </div>
      )}
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
      {shouldShowHeaderAndChat && !isLoggedIn && !numeroUnique && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={handleConnexionButtonClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium"
            >
              Poser une question
            </Button>
          </div>
        </div>
      )}
      {shouldShowHeaderAndChat && isLoggedIn && (
        <ChatInput
          theme={selectedCategory || undefined}
          onSendMessage={handleSendMessage}
        />
      )}
      {shouldShowHeaderAndChat && !isLoggedIn && numeroUnique && numeroUnique.startsWith('guest_') && (
        <ChatInput
          theme={selectedCategory || undefined}
          placeholder="Posez votre question (mode invité)"
          onSendMessage={handleSendMessage}
        />
      )}
      <AccompagneSideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNewConversationClick={() => {}}
        onMyProceduresClick={() => {
          setShowMyProcedures(true);
          setIsMenuOpen(false);
        }}
        onMyAppointmentsClick={() => {
          setShowMyAppointments(true);
          setIsMenuOpen(false);
        }}
        onLanguagesClick={() => {
          setShowLanguages(true);
          setIsMenuOpen(false);
        }}
      />
      {showUserModal && userData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Mon Profil Supabase</h2>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-64">
              {JSON.stringify(userData, null, 2)}
            </pre>
            <Button onClick={() => setShowUserModal(false)} className="mt-4 w-full">
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
