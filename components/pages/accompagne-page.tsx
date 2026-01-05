import { useEffect, useState, useRef } from "react";
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
import {
  AccompagneSideMenu,
  ChatInput,
  BackButton,
  ThematiqueOuQuestionCallout,
} from "@/components/ui-custom";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { generateStableId } from "@/lib/utils";
import SimpleChatDisplay from "@/components/ui-custom/simple-chat-display";
import ProcessingIndicator from "@/components/chat/ProcessingIndicator";
import { VersionBadge } from "@/components/ui/version-badge";

interface AccompagnePageProps {
  isLoggedIn?: boolean;
  initialCategory?: string | null;
}

/**
 * Helpers
 */
const isGuestId = (id: string | null | undefined) =>
  !!id && /^guest([_-]|\b)/i.test(id);

export default function AccompagnePage({
  isLoggedIn: propIsLoggedIn,
  initialCategory,
}: AccompagnePageProps = {}) {
  const SHOW_MENU = false;
  // États
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMyProcedures, setShowMyProcedures] = useState(false);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showPremiereConnexion, setShowPremiereConnexion] = useState(false);
  const [showCreateAccountSimple, setShowCreateAccountSimple] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn || false);
  const [numeroUnique, setNumeroUnique] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const { setUserInfo, state } = useChat();

  // ref pour hauteur d'en-tête sticky
  const headerRef = useRef<HTMLDivElement | null>(null);

  // État dérivé (évite les incohérences d'ID invité)
  const isGuest = !isLoggedIn && isGuestId(numeroUnique);

  // Effets init
  useEffect(() => {
    // Si on arrive déjà connecté via props + catégorie
    if (propIsLoggedIn && initialCategory) {
      setIsLoggedIn(true);
      setSelectedCategory(initialCategory);
    }

    // Si c'est un RELOAD, on sort du mode invité
    try {
      const nav = (performance && (performance as any).getEntriesByType)
        ? (performance.getEntriesByType('navigation')[0] as any)
        : undefined;
      const legacy = (performance as any)?.navigation?.type === 1; // 1 = reload (legacy)
      const isReload = (nav && nav.type === 'reload') || legacy;
      if (isReload) {
        sessionStorage.removeItem('guest_id');
      }
    } catch {}

    // Synchroniser l'ID stocké (uid/numero) + session (guest)
    const numero =
      localStorage.getItem("uid") ||
      localStorage.getItem("numero") ||
      sessionStorage.getItem("guest_id");

    if (numero) {
      setNumeroUnique(numero);
    } else {
      setNumeroUnique(null);
    }
  }, [propIsLoggedIn, initialCategory]);

  useEffect(() => {
    if (numeroUnique) setUserInfo(numeroUnique, "accompagne");
  }, [numeroUnique, setUserInfo]);

  // Quand l'utilisateur devient connecté, si un thème a été choisi avant, on y retourne
  useEffect(() => {
    if (isLoggedIn) {
      const savedTheme = localStorage.getItem("selectedTheme");
      if (savedTheme) {
        setSelectedTheme(savedTheme);
        setSelectedCategory(savedTheme);
      }
    }
  }, [isLoggedIn]);

  // Fixe la hauteur de l'en-tête en CSS var pour positionner le panneau de chat
  useEffect(() => {
    const setH = () => {
      const h = headerRef.current?.offsetHeight || 64;
      document.documentElement.style.setProperty("--app-header-h", `${h}px`);
    };
    setH();
    window.addEventListener("resize", setH);
    return () => window.removeEventListener("resize", setH);
  }, []);

  // Fixe la hauteur de l'en-tête en CSS var pour positionner le panneau de chat
  useEffect(() => {
    const setH = () => {
      const h = headerRef.current?.offsetHeight || 64;
      document.documentElement.style.setProperty("--app-header-h", `${h}px`);
    };
    setH();
    window.addEventListener("resize", setH);
    return () => window.removeEventListener("resize", setH);
  }, []);

  // Handlers
  const handleAccountCreationComplete = () => {
    setIsLoggedIn(true);
    setShowCreateAccount(false);
    setShowCreateAccountSimple(false);

    const numero = localStorage.getItem("uid") || localStorage.getItem("numero");
    if (numero) setNumeroUnique(numero);

    // 🔁 Restaurer le thème choisi avant l'auth
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      setSelectedCategory(savedTheme);
    }
  };

  const handleLoadUserData = async () => {
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

  const handleSendMessage = (message: string) =>
    console.log("Message envoyé:", message);

  const handleSeConnecter = () => {
    setShowPremiereConnexion(false);
    setShowCreateAccount(true);
  };

  const handleCreerCompte = () => {
    setShowPremiereConnexion(false);
    setShowCreateAccountSimple(true);
  };

  const handleContinuerSansConnexion = () => {
    // Ferme le modal d'auth
    setShowPremiereConnexion(false);

    // Génère un ID invité plus tolérant (accepté par toutes les vérifications)
    const raw = generateStableId("guest");
    const guestId = isGuestId(raw) ? raw : `guest_${raw}`;

    // Invité = session seulement (pas de persistance longue durée)
    sessionStorage.setItem("guest_id", guestId);
    // On s'assure de ne pas écraser un éventuel numero persistant
    localStorage.removeItem("numero");

    // Met à jour l'état
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
    sessionStorage.removeItem("guest_id");
    setIsLoggedIn(false);
    setNumeroUnique(null);
    setUserData(null);
    // Pas besoin de recharger la page – on laisse React mettre à jour le rendu
    // window.location.reload();
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  // Header
  const renderHeader = () => (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 flex items-center justify-between py-3 px-6 border-b border-gray-200 bg-white"
    >
      <div className="flex items-center gap-2">
        <BackButton onClick={handleBackToHome} label="Accueil" />
        {SHOW_MENU && (
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6 text-[#414143]" />
          </Button>
        )}
      </div>
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
            {isLoggedIn
              ? `Bonjour ${numeroUnique} ! Comment puis-je vous aider ?`
              : "Triptik à votre service"}
          </h1>
          {isLoggedIn && (
            <p className="text-base text-[#73726d]">
              Votre profil est maintenant configuré. Posez-moi vos questions ou choisissez une thématique.
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-2xl text-left">
              <ThematiqueOuQuestionCallout />
            </div>
          </div>
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
    shouldShowHeaderAndChat && (isLoggedIn || isGuest) && state.currentMessages.length > 0;

  const showProcessingIndicator =
    shouldShowHeaderAndChat &&
    state.processingState.currentStep !== "idle" &&
    !showChatMessages;

  // Blocage du scroll quand overlay
  const overlayOpen =
    showChatMessages ||
    showProcessingIndicator ||
    showPremiereConnexion ||
    showUserModal ||
    isMenuOpen;

  useEffect(() => {
    if (overlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  // Barre de chat
  const renderBottomBar = () => {
    if (!shouldShowHeaderAndChat) return null;

    if (isLoggedIn || isGuest) {
      return (
        <ChatInput
          theme={selectedCategory || undefined}
          placeholder={isGuest ? "Posez votre question (mode invité)" : undefined}
          onSendMessage={handleSendMessage}
        />
      );
    } else {
      return (
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
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      {shouldShowHeaderAndChat && renderHeader()}
      {content}

      {showChatMessages && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-20" aria-hidden="true" />
          {/* Panneau chat */}
          <div
            className="fixed left-0 right-0 bottom-24 bg-white z-30 border-t border-gray-200 flex flex-col"
            style={{ top: "var(--app-header-h, 64px)" }}
          >
            <div className="flex-1 max-w-4xl mx-auto p-6 overflow-y-auto overscroll-contain w-full">
              <SimpleChatDisplay />
            </div>
          </div>
        </>
      )}

      {showProcessingIndicator && (
        <div
          className="fixed left-0 right-0 z-40 bg-white border-t border-gray-200"
          style={{ top: "var(--app-header-h, 64px)" }}
        >
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

      {renderBottomBar()}

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
            <Button
              onClick={() => setShowUserModal(false)}
              className="mt-4 w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
