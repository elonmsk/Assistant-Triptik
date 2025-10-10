"use client";
import { Menu, MoreVertical, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput, SimpleChatDisplay, BackButton } from "@/components/ui-custom";
import { useChat } from "@/contexts/ChatContext";
import ProcessingIndicator from "@/components/chat/ProcessingIndicator";
import { generateStableId } from "@/lib/utils";

interface AccompagnantQualificationPageProps {
  category: string;
  onBack: () => void;
}

interface QualificationStep {
  question: string;
  answers?: { text: string; emoji: string; value: string }[];
  type?: "input" | "handicap" | "city";
}

interface CityOption {
  name: string;
  code: string;
  population?: number;
  department?: string;
}

export default function AccompagnantQualificationPage({
  category,
  onBack,
}: AccompagnantQualificationPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(9).fill(""));
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [skipQualification, setSkipQualification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1);
  const [isQuestionnaireFinished, setIsQuestionnaireFinished] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const { state, setUserInfo } = useChat();

  useEffect(() => {
    const numero = localStorage.getItem("uid") || localStorage.getItem("numero") || generateStableId("accompagnant");
    setUserInfo(numero, "accompagnant");
  }, [setUserInfo]);

  const showChatMessages = state.currentMessages.length > 0;
  const showProcessingIndicator = state.processingState.currentStep !== "idle" && !showChatMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStep, userAnswers, showInitialMessage, showAnswers]);

  const fetchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    setIsLoadingCities(true);
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,population,departement&boost=population&limit=8`
      );
      if (response.ok) {
        const data = await response.json();
        const cities: CityOption[] = data.map((city: any) => ({
          name: city.nom,
          code: city.code,
          population: city.population,
          department: city.departement?.nom,
        }));
        setCitySuggestions(cities);
        setShowCitySuggestions(true);
        setSelectedCityIndex(-1);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des villes:", error);
      setCitySuggestions([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  const debouncedFetchCities = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        fetchCities(query);
      }, 300);
    },
    [fetchCities]
  );

  const handleCityInputChange = (value: string) => {
    setInputValue(value);
    debouncedFetchCities(value);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent) => {
    if (!showCitySuggestions || citySuggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedCityIndex((prev) => (prev < citySuggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedCityIndex((prev) => (prev > 0 ? prev - 1 : citySuggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedCityIndex >= 0) {
          handleCitySelect(citySuggestions[selectedCityIndex]);
        } else {
          handleInputAnswer();
        }
        break;
      case "Escape":
        setShowCitySuggestions(false);
        setSelectedCityIndex(-1);
        break;
    }
  };

  const handleCitySelect = (city: CityOption) => {
    setInputValue(city.name);
    setShowCitySuggestions(false);
    setSelectedCityIndex(-1);
    setCitySuggestions([]);
    setTimeout(() => {
      handleAnswer(city.name);
    }, 100);
  };

  const qualificationSteps: QualificationStep[] = [
    {
      question: "La personne a-t-elle déjà fait des démarches dans ce domaine ?",
      answers: [
        { text: "Oui", emoji: "👍", value: "yes" },
        { text: "Non", emoji: "👎", value: "no" },
      ],
    },
    {
      question: "Quels documents la personne possède-t-elle ?",
      answers: [
        { text: "Attestation de demande d'asile (ADA)", emoji: "📄", value: "ada" },
        { text: "Attestation prolongation d'instruction (API)", emoji: "📋", value: "api" },
        { text: "Carte de séjour", emoji: "💳", value: "carte_sejour" },
        { text: "Titre de séjour réfugié", emoji: "🆔", value: "titre_sejour" },
        { text: "Passeport", emoji: "📕", value: "passeport" },
        { text: "Récépissé de décision favorable", emoji: "✅", value: "recepisse" },
        { text: "Aucun", emoji: "❌", value: "aucun" },
      ],
    },
    {
      question: "Quel est le genre de la personne ?",
      answers: [
        { text: "Homme", emoji: "👨", value: "male" },
        { text: "Femme", emoji: "👩", value: "female" },
      ],
    },
    {
      question: "Quel est l'âge de la personne ?",
      type: "input",
    },
    {
      question: "Quel est le niveau de français de la personne ?",
      answers: [
        { text: "A1 (Débutant)", emoji: "🟢", value: "a1" },
        { text: "A2 (Élémentaire)", emoji: "🟡", value: "a2" },
        { text: "B1 (Intermédiaire)", emoji: "🟠", value: "b1" },
        { text: "B2 (Intermédiaire supérieur)", emoji: "🔵", value: "b2" },
        { text: "C1 (Avancé)", emoji: "🟣", value: "c1" },
        { text: "C2 (Maîtrise)", emoji: "🔴", value: "c2" },
      ],
    },
    {
      question: "Quelle est la ville de domiciliation de la personne ?",
      type: "city",
    },


    {
      question: "Combien d'enfants a-t-elle ?",
      type: "input",
    },
  ];

  const handleInitialAccept = () => setShowInitialMessage(false);

  const saveAnswer = (answer: string, index: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = answer;
    setUserAnswers(newAnswers);
    localStorage.setItem(
      `qualification_${category}_accompagnant`,
      JSON.stringify({ category, answers: newAnswers, timestamp: Date.now() })
    );
  };

  const goToStepForEdit = (index: number) => {
    setEditingIndex(index);
    setCurrentStep(index);
    setInputValue(userAnswers[index] || "");
    setShowAnswers(false);
  };

  const handleAnswer = (answer: string) => {
    const index = editingIndex !== null ? editingIndex : currentStep;
    saveAnswer(answer, index);

    if (editingIndex !== null) {
      // Sortir du mode édition et revenir à la vue normale
      setEditingIndex(null);
      setInputValue("");

      // Si toutes les questions sont répondues, afficher le message de fin
      const allAnswered = userAnswers.every((ans, idx) => idx === index || ans !== "");
      if (allAnswered || index === qualificationSteps.length - 1) {
        setIsQuestionnaireFinished(true);
        setCurrentStep(qualificationSteps.length);
      } else {
        // Sinon, aller à la prochaine question non répondue
        const nextUnanswered = userAnswers.findIndex((ans, idx) => idx > index && ans === "");
        if (nextUnanswered !== -1) {
          setCurrentStep(nextUnanswered);
        } else {
          setIsQuestionnaireFinished(true);
          setCurrentStep(qualificationSteps.length);
        }
      }
    } else {
      if (currentStep === qualificationSteps.length - 1) {
        setIsQuestionnaireFinished(true);
        setCurrentStep(qualificationSteps.length);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
    setInputValue("");
  };

  const handleInputAnswer = () => {
    if (!inputValue.trim()) return;
    const current = qualificationSteps[editingIndex ?? currentStep];
    if (current.question.toLowerCase().includes("âge")) {
      const age = parseInt(inputValue.trim(), 10);
      if (isNaN(age) || age > 100) {
        setError("Âge invalide : entre 0 et 100");
        return;
      }
    }
    setError(null);
    handleAnswer(inputValue.trim());
  };

  const handleHandicapInput = () => {
    if (!inputValue.trim()) return;
    handleAnswer(`Oui : ${inputValue.trim()}`);
  };

  const renderAnswersSummary = () => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Récapitulatif de vos réponses</h3>
          <p className="text-sm text-blue-700">Cliquez sur une réponse pour la modifier</p>
        </div>

        {qualificationSteps.map((step, index) => (
          <div key={`summary-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{step.question}</p>
                <p className="text-base text-gray-900 font-medium">
                  {userAnswers[index] || <span className="text-gray-400 italic">Non répondu</span>}
                </p>
              </div>
              <Button
                onClick={() => goToStepForEdit(index)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setShowAnswers(false)}
            className="bg-blue-600 text-white rounded-full px-6 py-3 hover:bg-blue-700"
          >
            Retour au questionnaire
          </Button>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    const messages = [];
    if (showInitialMessage) {
      messages.push(
        <div key="intro" className="mb-8">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl max-w-[90%] mx-auto">
            <p>Vous avez choisi : {category}. Nous allons poser quelques questions sur la personne accompagnée.
            Les informations que vous allez renseigner nous permettront de mieux comprendre la situation et d'adapter nos réponses pour vous accompagner au plus près de vos besoins.

            </p>
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleInitialAccept}
              className="bg-[#919191] text-white rounded-full px-6 py-2"
            >
              👍 D'accord
            </Button>
          </div>
        </div>
      );
    } else if (editingIndex !== null) {
      // Mode édition : afficher uniquement la question en cours d'édition
      const step = qualificationSteps[editingIndex];
      messages.push(
        <div key="editing" className="mb-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
            <p className="text-sm text-blue-800">✏️ Mode édition - Question {editingIndex + 1}/{qualificationSteps.length}</p>
          </div>
          <div className="bg-[#f4f4f4] p-4 rounded-2xl max-w-[90%]">
            <p>{step.question}</p>
            {userAnswers[editingIndex] && (
              <p className="text-sm text-gray-600 mt-2">
                Réponse actuelle : <span className="font-medium">{userAnswers[editingIndex]}</span>
              </p>
            )}
          </div>
          {step.type === "input" && (
            <div className="flex flex-col items-center mt-4 gap-2 w-full">
              <div className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInputAnswer();
                    }
                  }}
                  className="px-4 py-2 border rounded-full flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleInputAnswer}
                  className="bg-[#919191] text-white rounded-full px-6 py-2"
                >
                  Valider
                </Button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          )}
          {step.type === "city" && (
            <div className="flex flex-col items-center mt-4 gap-2 w-full">
              <div className="flex gap-2 w-full max-w-md relative">
                <div className="flex-1 relative">
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    onKeyDown={handleCityKeyDown}
                    onFocus={() => inputValue && citySuggestions.length > 0 && setShowCitySuggestions(true)}
                    placeholder="Commencez à taper le nom de la ville..."
                    className="px-4 py-2 border rounded-full w-full"
                    autoFocus
                  />
                  {showCitySuggestions && (citySuggestions.length > 0 || isLoadingCities) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingCities ? (
                        <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          Recherche en cours...
                        </div>
                      ) : (
                        citySuggestions.map((city, index) => (
                          <button
                            key={city.code}
                            onClick={() => handleCitySelect(city)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                              index === selectedCityIndex ? "bg-blue-50 border-l-4 border-blue-500" : ""
                            } ${index !== citySuggestions.length - 1 ? "border-b border-gray-100" : ""}`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">{city.name}</div>
                                {city.department && (
                                  <div className="text-sm text-gray-500">{city.department}</div>
                                )}
                              </div>
                              {city.population && (
                                <div className="text-xs text-gray-400">
                                  {city.population.toLocaleString()} hab.
                                </div>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleInputAnswer}
                  className="bg-[#919191] text-white rounded-full px-6 py-2"
                >
                  Valider
                </Button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          )}
          {step.type === undefined && step.answers && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {step.answers.map((ans, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleAnswer(`${ans.emoji} ${ans.text}`)}
                  className="bg-[#919191] text-white rounded-full px-4 py-2"
                >
                  {ans.emoji} {ans.text}
                </Button>
              ))}
            </div>
          )}
          {step.type === "handicap" && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
              <Button
                onClick={() => handleAnswer("Non")}
                className="bg-[#919191] text-white rounded-full px-4 py-2"
              >
                ❌ Non
              </Button>
              <div className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  placeholder="Si oui, lequel ?"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleHandicapInput();
                    }
                  }}
                  className="px-4 py-2 border rounded-full flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleHandicapInput}
                  className="bg-[#919191] text-white rounded-full px-6 py-2"
                >
                  Valider
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                setEditingIndex(null);
                setInputValue("");
                setError(null);
              }}
              variant="ghost"
              className="text-gray-600"
            >
              Annuler
            </Button>
          </div>
        </div>
      );
    } else {
      // Vue normale : afficher toutes les questions répondues + question actuelle
      for (let i = 0; i < qualificationSteps.length; i++) {
        const step = qualificationSteps[i];
        const answer = userAnswers[i];
        if (answer) {
          messages.push(
            <div key={`q-${i}`} className="mb-4">
              <div className="bg-[#f4f4f4] p-4 rounded-2xl max-w-[90%]">
                <p>{step.question}</p>
              </div>
              <div className="flex justify-center mt-2 gap-2">
                <div className="bg-[#919191] text-white rounded-full px-4 py-2">
                  {answer}
                </div>
                <Button
                  onClick={() => goToStepForEdit(i)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        }
      }

      // Afficher la question actuelle uniquement si elle n'a pas encore été répondue
      if (currentStep < qualificationSteps.length && !userAnswers[currentStep] && !isQuestionnaireFinished) {
        const current = qualificationSteps[currentStep];
        messages.push(
          <div key="current" className="mb-4">
            <div className="bg-[#f4f4f4] p-4 rounded-2xl max-w-[90%]">
              <p>{current.question}</p>
            </div>
            {current.type === "input" && (
              <div className="flex flex-col items-center mt-4 gap-2 w-full">
                <div className="flex gap-2 w-full max-w-md">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleInputAnswer();
                      }
                    }}
                    className="px-4 py-2 border rounded-full flex-1"
                  />
                  <Button
                    onClick={handleInputAnswer}
                    className="bg-[#919191] text-white rounded-full px-6 py-2"
                  >
                    Valider
                  </Button>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            )}
            {current.type === "city" && (
              <div className="flex flex-col items-center mt-4 gap-2 w-full">
                <div className="flex gap-2 w-full max-w-md relative">
                  <div className="flex-1 relative">
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => handleCityInputChange(e.target.value)}
                      onKeyDown={handleCityKeyDown}
                      onFocus={() => inputValue && citySuggestions.length > 0 && setShowCitySuggestions(true)}
                      placeholder="Commencez à taper le nom de la ville..."
                      className="px-4 py-2 border rounded-full w-full"
                    />
                    {showCitySuggestions && (citySuggestions.length > 0 || isLoadingCities) && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingCities ? (
                          <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            Recherche en cours...
                          </div>
                        ) : (
                          citySuggestions.map((city, index) => (
                            <button
                              key={city.code}
                              onClick={() => handleCitySelect(city)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                index === selectedCityIndex ? "bg-blue-50 border-l-4 border-blue-500" : ""
                              } ${index !== citySuggestions.length - 1 ? "border-b border-gray-100" : ""}`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-gray-900">{city.name}</div>
                                  {city.department && (
                                    <div className="text-sm text-gray-500">{city.department}</div>
                                  )}
                                </div>
                                {city.population && (
                                  <div className="text-xs text-gray-400">
                                    {city.population.toLocaleString()} hab.
                                  </div>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleInputAnswer}
                    className="bg-[#919191] text-white rounded-full px-6 py-2"
                  >
                    Valider
                  </Button>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            )}
            {current.type === undefined && current.answers && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {current.answers.map((ans, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleAnswer(`${ans.emoji} ${ans.text}`)}
                    className="bg-[#919191] text-white rounded-full px-4 py-2"
                  >
                    {ans.emoji} {ans.text}
                  </Button>
                ))}
              </div>
            )}
            {current.type === "handicap" && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
                <Button
                  onClick={() => handleAnswer("Non")}
                  className="bg-[#919191] text-white rounded-full px-4 py-2"
                >
                  ❌ Non
                </Button>
                <div className="flex gap-2 w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Si oui, lequel ?"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleHandicapInput();
                      }
                    }}
                    className="px-4 py-2 border rounded-full flex-1"
                  />
                  <Button
                    onClick={handleHandicapInput}
                    className="bg-[#919191] text-white rounded-full px-6 py-2"
                  >
                    Valider
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      }

      // Afficher le message de remerciement si toutes les questions sont répondues
      if (isQuestionnaireFinished) {
        messages.push(
          <div key="thank-you" className="mb-4 text-center">
            <div className="bg-[#e8f5e8] p-6 rounded-2xl max-w-[90%] mx-auto border border-[#d0e8d0]">
              <p className="font-semibold text-green-700 text-lg">
                🎉 Merci pour ces informations !
              </p>
              <p className="mt-3 text-gray-700">
                Vous pouvez maintenant poser votre question ci-dessous.
              </p>
            </div>
          </div>
        );
      }
    }
    return messages;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex gap-2 items-center">
          <BackButton onClick={onBack} />
          <Button
            onClick={() => setShowAnswers((prev) => !prev)}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            {showAnswers ? "Revenir au questionnaire" : "Voir / modifier mes réponses"}
          </Button>
        </div>
        <img
          src="/images/emmaus-logo.png"
          className="h-20 w-auto cursor-pointer"
          onClick={() => (window.location.href = "/")}
          alt="Emmaus Connect"
        />
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-6 h-6 text-gray-700" />
        </Button>
      </header>
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-2xl p-6 flex flex-col">
          {skipQualification ? (
            <div className="h-full">
              <SimpleChatDisplay />
            </div>
          ) : showAnswers ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                  😊
                </div>
                <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 pb-28">
                  {renderAnswersSummary()}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                  😊
                </div>
                <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 pb-28">
                  {renderMessages()}
                  {state.currentMessages.length > 0 && <SimpleChatDisplay />}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {showProcessingIndicator && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-white border-t border-gray-200">
          <div className="max-w-2xl mx-auto p-4">
            <ProcessingIndicator
              currentStep={state.processingState.currentStep}
              message={state.processingState.message}
              progress={state.processingState.progress}
              category={state.processingState.category}
            />
          </div>
        </div>
      )}
      <ChatInput
        theme={category}
        placeholder={
          skipQualification || isQuestionnaireFinished
            ? `Posez votre question sur ${category}...`
            : "Répondez à la question ou posez votre propre question..."
        }
        onSendMessage={(message: string) => {
          if (!skipQualification) {
            if (showInitialMessage) {
              if (message.toLowerCase().includes("d'accord")) {
                handleInitialAccept();
                return true;
              } else if (message.trim()) {
                setSkipQualification(true);
                return false;
              }
            } else if (currentStep < qualificationSteps.length) {
              const current = qualificationSteps[currentStep];
              if (current.type === "input") {
                setInputValue(message);
                handleInputAnswer();
                return true;
              } else if (current.type === "city") {
                setInputValue(message);
                const matchingCity = citySuggestions.find((city) =>
                  city.name.toLowerCase().includes(message.toLowerCase())
                );
                if (matchingCity) {
                  handleCitySelect(matchingCity);
                } else {
                  handleInputAnswer();
                }
                return true;
              } else if (current.type === "handicap") {
                setInputValue(message);
                handleHandicapInput();
                return true;
              } else {
                const matchingAnswer = current.answers?.find(
                  (a) =>
                    message.toLowerCase().includes(a.text.toLowerCase()) ||
                    message.toLowerCase().includes(a.value.toLowerCase())
                );
                if (matchingAnswer) {
                  handleAnswer(`${matchingAnswer.emoji} ${matchingAnswer.text}`);
                  return true;
                } else if (message.trim()) {
                  setSkipQualification(true);
                  return false;
                }
              }
            }
          }
          return false;
        }}
      />
    </div>
  );
}