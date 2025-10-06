"use client"
import { Menu, MoreVertical, Play, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect, KeyboardEvent, useCallback } from "react"
import { ChatInput, SimpleChatDisplay } from "@/components/ui-custom"
import { useChat } from '@/contexts/ChatContext'
import ProcessingIndicator from '@/components/chat/ProcessingIndicator'
import { generateStableId } from '@/lib/utils'

interface CategoryQualificationPageProps {
  category: string
  onBack: () => void
  isConnected?: boolean
}

interface QualificationStep {
  question: string
  answers?: { text: string; emoji: string; value: string }[]
  type?: "input" | "button" | "city"
  condition?: (answers: string[]) => boolean
}

interface CityOption {
  name: string
  code: string
  population?: number
  department?: string
}

export default function CategoryQualificationPage({
  category,
  onBack,
  isConnected = false
}: CategoryQualificationPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showInitialMessage, setShowInitialMessage] = useState(true)
  const [inputValue, setInputValue] = useState<string>("")
  const [skipQualification, setSkipQualification] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [isQuestionnaireFinished, setIsQuestionnaireFinished] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const { state, setUserInfo } = useChat()

  // Initialiser qualificationSteps avant userAnswers
  const getQualificationSteps = (categoryName: string, isUserConnected: boolean): QualificationStep[] => {
    const commonSteps = [
      {
        question: "Avez-vous déjà fait des démarches dans ce domaine ?",
        answers: [
          { text: "Oui", emoji: "👍", value: "yes" },
          { text: "Non", emoji: "👎", value: "no" },
        ],
      },
    ]

    const accountQuestions = {
      common: [
        {
          question: "Quels documents avez-vous ?",
          answers: [
            { text: "Attestation de demande d'asile (ADA)", emoji: "📄", value: "ada" },
            { text: "Attestation prolongation d'instruction (API)", emoji: "📋", value: "api" },
            { text: "Carte de séjour (carte de résident)", emoji: "💳", value: "carte_sejour" },
            { text: "Titre de séjour (carte de résident avec mention « réfugié »)", emoji: "🆔", value: "titre_sejour" },
            { text: "Passeport", emoji: "📕", value: "passeport" },
            { text: "Récépissé de décision favorable (titre de séjour validé)", emoji: "✅", value: "recepisse" },
            { text: "Aucun de ces documents", emoji: "❌", value: "aucun" },
          ],
        },
        {
          question: "Quel est votre genre ?",
          answers: [
            { text: "Homme", emoji: "👨", value: "male" },
            { text: "Femme", emoji: "👩", value: "female" },
          ],
        },
        {
          question: "Quel est votre âge ?",
          type: "input",
          answers: []
        },
        {
          question: "Quel est votre niveau de français ?",
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
          question: "Quelle est votre langue courante ?",
          answers: [
            { text: "Français", emoji: "🇫🇷", value: "french" },
            { text: "Anglais", emoji: "🇬🇧", value: "english" },
            { text: "Arabe", emoji: "🌍", value: "arabic" },
            { text: "Autre", emoji: "🗣️", value: "other" },
          ],
        },
        {
          question: "Quelle est votre ville de domiciliation ?",
          type: "city",
          answers: []
        },

        {
          question: "Êtes-vous en situation de handicap ?",
          answers: [
            { text: "Oui", emoji: "♿", value: "handicap_yes" },
            { text: "Non", emoji: "❌", value: "handicap_no" },
          ],
        },
        {
          question: "Lequel ?",
          type: "input",
          condition: (answers: string[]) => answers.includes("handicap_yes"),
          answers: []
        },
        {
          question: "Combien d'enfants avez-vous ?",
          type: "input",
          answers: []
        },
      ]
    }

    const specificQuestions = {
      Santé: [
        {
          question: "Avez-vous une couverture sociale (Carte Sécu, N° Sécu Provisoire, CMU, AME) ?",
          answers: [
            { text: "Oui", emoji: "💳", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
          ],
        },
      ],
      Emploi: [
        {
          question: "Êtes-vous résident en France depuis plus de 6 mois, 5 ans ?",
          answers: [
            { text: "Moins de 6 mois", emoji: "❌", value: "less_6_months" },
            { text: "Entre 6 mois et 5 ans", emoji: "🏠", value: "6_months_5_years" },
            { text: "Plus de 5 ans", emoji: "🏡", value: "5_years" },
          ],
        },
        {
          question: "Quel est votre niveau scolaire ?",
          answers: [
            { text: "Primaire", emoji: "📚", value: "primary" },
            { text: "Collège", emoji: "🎓", value: "middle" },
            { text: "Lycée", emoji: "🎒", value: "high" },
            { text: "Supérieur", emoji: "🎓", value: "higher" },
          ],
        },
        {
          question: "Êtes-vous inscrit à France Travail ?",
          answers: [
            { text: "Oui", emoji: "✅", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
          ],
        },
        {
          question: "Avez-vous déjà travaillé en France ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
        {
          question: "Avez-vous un CV à jour ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
      ],
      Logement: [
        {
          question: "Combien de personnes à loger ?",
          answers: [
            { text: "1", emoji: "👤", value: "1" },
            { text: "2-3", emoji: "👥", value: "2-3" },
            { text: "4-6", emoji: "👪", value: "4-6" },
            { text: "7+", emoji: "👨‍👩‍👧‍👦", value: "7+" },
          ],
        },
        {
          question: "Quelle est la composition de votre foyer ?",
          answers: [
            { text: "Seul", emoji: "👤", value: "single" },
            { text: "Couple", emoji: "👫", value: "couple" },
            { text: "Famille", emoji: "👨‍👩‍👧‍👦", value: "family" },
            { text: "Colocation", emoji: "🏠", value: "colocation" },
          ],
        },
        {
          question: "Avez-vous actuellement un logement ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
        {
          question: "Souhaitez-vous faire une demande de logement social ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
        {
          question: "Connaissez-vous vos droits aux aides au logement ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
      ],
      Droits: [
        {
          question: "Êtes-vous résident en France depuis plus de 6 mois, 5 ans ?",
          answers: [
            { text: "Moins de 6 mois", emoji: "❌", value: "less_6_months" },
            { text: "Entre 6 mois et 5 ans", emoji: "🏠", value: "6_months_5_years" },
            { text: "Plus de 5 ans", emoji: "🏡", value: "5_years" },
          ],
        },
        {
          question: "Quelle est votre nationalité ?",
          answers: [
            { text: "Française", emoji: "🇫🇷", value: "french" },
            { text: "UE", emoji: "🇪🇺", value: "eu" },
            { text: "Autre", emoji: "🌍", value: "other" },
          ],
        },
      ],
      Education: [
        {
          question: "Quel est votre niveau scolaire ?",
          answers: [
            { text: "Primaire", emoji: "📚", value: "primary" },
            { text: "Collège", emoji: "🎓", value: "middle" },
            { text: "Lycée", emoji: "🎒", value: "high" },
            { text: "Supérieur", emoji: "🎓", value: "higher" },
          ],
        },
        {
          question: "Avez-vous une carte INE (Identifiant national étudiant unique) ?",
          answers: [
            { text: "Oui", emoji: "🎓", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
          ],
        },
        {
          question: "Quelle est votre nationalité ?",
          answers: [
            { text: "Française", emoji: "🇫🇷", value: "french" },
            { text: "UE", emoji: "🇪🇺", value: "eu" },
            { text: "Autre", emoji: "🌍", value: "other" },
          ],
        },
      ],
      "Apprentissage Français": [
        {
          question: "Avez-vous un financement pour votre formation ?",
          answers: [
            { text: "Oui", emoji: "💰", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
            { text: "En cours", emoji: "⏳", value: "pending" },
          ],
        },
      ],
      "Formation Pro": [
        {
          question: "Avez-vous un financement pour votre formation ?",
          answers: [
            { text: "Oui", emoji: "💰", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
            { text: "En cours", emoji: "⏳", value: "pending" },
          ],
        },
        {
          question: "Quelles sont vos dates demandées ?",
          answers: [
            { text: "Immédiat", emoji: "⚡", value: "immediate" },
            { text: "Dans 1 mois", emoji: "📅", value: "one_month" },
            { text: "Dans 3 mois", emoji: "📆", value: "three_months" },
            { text: "Plus tard", emoji: "⏰", value: "later" },
          ],
        },
        {
          question: "Quelle est votre durée d'engagement ?",
          answers: [
            { text: "Courte (- 3 mois)", emoji: "⏳", value: "short" },
            { text: "Moyenne (3-6 mois)", emoji: "📆", value: "medium" },
            { text: "Longue (+ 6 mois)", emoji: "📅", value: "long" },
          ],
        },
        {
          question: "Quelle est votre disponibilité ?",
          answers: [
            { text: "Temps plein", emoji: "🕐", value: "full_time" },
            { text: "Temps partiel", emoji: "🕕", value: "part_time" },
            { text: "Flexible", emoji: "🔄", value: "flexible" },
          ],
        },
        {
          question: "Quel jour de présence souhaitez-vous ?",
          answers: [
            { text: "Lundi-Vendredi", emoji: "📅", value: "weekdays" },
            { text: "Weekend", emoji: "🎉", value: "weekend" },
            { text: "Flexible", emoji: "🔄", value: "flexible" },
          ],
        },
      ],
      Démarches: [
        {
          question: "Quelle est votre nationalité ?",
          answers: [
            { text: "Française", emoji: "🇫🇷", value: "french" },
            { text: "UE", emoji: "🇪🇺", value: "eu" },
            { text: "Autre", emoji: "🌍", value: "other" },
          ],
        },
      ],
    }

    let steps = [...commonSteps]
    if (!isUserConnected) {
      // Filtrer les questions sans condition, ou celles dont la condition est vraie
      steps = [...steps, ...accountQuestions.common.filter(step => !step.condition)]
    }
    if (specificQuestions[categoryName as keyof typeof specificQuestions]) {
      steps = [...steps, ...specificQuestions[categoryName as keyof typeof specificQuestions]]
    }
    return steps
  }

  const qualificationSteps = getQualificationSteps(category, isConnected)

  // Initialiser userAnswers avec la bonne longueur
  const [userAnswers, setUserAnswers] = useState<string[]>(() =>
    Array(qualificationSteps.length).fill("")
  )

  useEffect(() => {
    const numero = localStorage.getItem("uid") || localStorage.getItem("numero") || generateStableId('guest')
    setUserInfo(numero, 'accompagne')
  }, [setUserInfo])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentStep, userAnswers, showInitialMessage, showAnswers, editingIndex])

  const showChatMessages = state.currentMessages.length > 0
  const showProcessingIndicator = state.processingState.currentStep !== 'idle' && !showChatMessages

  // Fonctions pour l'API des villes
  const fetchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setCitySuggestions([])
      return
    }
    setIsLoadingCities(true)
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,population,departement&boost=population&limit=8`
      )
      if (response.ok) {
        const data = await response.json()
        const cities: CityOption[] = data.map((city: any) => ({
          name: city.nom,
          code: city.code,
          population: city.population,
          department: city.departement?.nom,
        }))
        setCitySuggestions(cities)
        setShowCitySuggestions(true)
        setSelectedCityIndex(-1)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des villes:", error)
      setCitySuggestions([])
    } finally {
      setIsLoadingCities(false)
    }
  }, [])

  const debouncedFetchCities = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        fetchCities(query)
      }, 300)
    },
    [fetchCities]
  )

  const handleCityInputChange = (value: string) => {
    setInputValue(value)
    debouncedFetchCities(value)
  }

  const handleCityKeyDown = (e: React.KeyboardEvent) => {
    if (!showCitySuggestions || citySuggestions.length === 0) return
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedCityIndex((prev) => (prev < citySuggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedCityIndex((prev) => (prev > 0 ? prev - 1 : citySuggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedCityIndex >= 0) {
          handleCitySelect(citySuggestions[selectedCityIndex])
        } else {
          handleInputAnswer(inputValue)
        }
        break
      case "Escape":
        setShowCitySuggestions(false)
        setSelectedCityIndex(-1)
        break
    }
  }

  const handleCitySelect = (city: CityOption) => {
    setInputValue(city.name)
    setShowCitySuggestions(false)
    setSelectedCityIndex(-1)
    setCitySuggestions([])
    setTimeout(() => {
      handleAnswer(city.name)
    }, 100)
  }

  const handleInitialAccept = () => {
    setShowInitialMessage(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const goToStepForEdit = (index: number) => {
    setEditingIndex(index)
    setCurrentStep(index)
    setInputValue(userAnswers[index] || "")
    setShowAnswers(false)
  }

  const saveAnswer = (answer: string, index: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[index] = answer
    setUserAnswers(newAnswers)
    const qualificationData = {
      category,
      answers: newAnswers,
      timestamp: Date.now()
    }
    localStorage.setItem(`qualification_${category}`, JSON.stringify(qualificationData))
  }

  const handleAnswer = (answer: string) => {
    const index = editingIndex !== null ? editingIndex : currentStep
    saveAnswer(answer, index)

    if (editingIndex !== null) {
      // Mode édition: revenir à la vue normale et continuer
      setEditingIndex(null)
      setInputValue("")

      // Trouver la prochaine question sans réponse
      const newAnswers = [...userAnswers]
      newAnswers[index] = answer
      const nextUnanswered = newAnswers.findIndex((ans) => ans === "")

      if (nextUnanswered !== -1) {
        // Il reste des questions non répondues
        setCurrentStep(nextUnanswered)
      } else {
        // Toutes les questions sont répondues
        setIsQuestionnaireFinished(true)
        setCurrentStep(qualificationSteps.length)
      }
    } else {
      // Mode normal: passer à la question suivante
      if (currentStep >= qualificationSteps.length - 1) {
        // Vérifier si toutes les questions ont été répondues
        const newAnswers = [...userAnswers]
        newAnswers[currentStep] = answer
        const allAnswered = newAnswers.every((ans) => ans !== "")
        if (allAnswered) {
          setIsQuestionnaireFinished(true)
        }
        setCurrentStep(qualificationSteps.length)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleInputAnswer = (answer: string) => {
    const currentQuestion = qualificationSteps[editingIndex ?? currentStep]
    if (currentQuestion.question.includes("âge")) {
      const age = parseInt(answer, 10)
      if (isNaN(age) || age > 100 || age < 0) {
        alert("Merci d'entrer un âge valide (0 à 100 ans)")
        return
      }
    }
    handleAnswer(answer)
    setInputValue("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const current = qualificationSteps[editingIndex ?? currentStep]
    if (current?.type === "city") {
      handleCityKeyDown(e)
    } else if (e.key === "Enter" && inputValue.trim()) {
      handleInputAnswer(inputValue)
    }
  }

  const getFinalSuggestions = (categoryName: string) => {
    const suggestions = {
      Santé: ["J'ai perdu ma carte vitale", "Renouveler ma carte vitale", "Obtenir une carte vitale"],
      Emploi: ["Créer un CV", "Chercher un emploi", "M'inscrire à France Travail"],
      Logement: ["Demander un logement social", "Obtenir des aides au logement", "Trouver un hébergement d'urgence"],
      Droits: ["Connaître mes droits", "Faire une demande d'aide", "Obtenir des informations juridiques"],
      Education: ["M'inscrire dans une école", "Obtenir une équivalence de diplôme", "Demander une bourse"],
      "Apprentissage Français": ["Trouver une formation", "M'inscrire à des cours", "Obtenir un financement"],
      "Formation Pro": ["Choisir une formation", "Obtenir un financement", "Trouver un centre de formation"],
      Démarches: ["Renouveler mes papiers", "Obtenir un titre de séjour", "Faire une demande administrative"],
    }
    return suggestions[categoryName as keyof typeof suggestions] || ["Obtenir de l'aide", "Poser une question", "Continuer"]
  }

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
    )
  }

  const renderMessages = () => {
    const messages = []
    if (showInitialMessage) {
      messages.push(
        <div key="initial" className="mb-8">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <p className="text-base text-[#414143]">
              Vous avez choisi : {category}. Je vais vous poser quelques.
              Les informations que vous allez renseigner nous permettront de mieux comprendre la situation et d'adapter nos réponses pour vous accompagner au plus près de vos besoins.
            </p>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
              <Play className="w-4 h-4 text-[#414143] fill-current" />
            </Button>
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleInitialAccept}
              className="bg-[#919191] hover:bg-gray-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
            >
              <span>👍</span>
              <span>D'accord</span>
            </Button>
          </div>
        </div>,
      )
    } else if (editingIndex !== null) {
      const step = qualificationSteps[editingIndex]
      messages.push(
        <div key="editing" className="mb-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
            <p className="text-sm text-blue-800">✏️ Mode édition - Question {editingIndex + 1}/{qualificationSteps.length}</p>
          </div>
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <p className="text-base text-[#414143]">{step.question}</p>
            {userAnswers[editingIndex] && (
              <p className="text-sm text-gray-600 mt-2">
                Réponse actuelle : <span className="font-medium">{userAnswers[editingIndex]}</span>
              </p>
            )}
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
              <Play className="w-4 h-4 text-[#414143] fill-current" />
            </Button>
          </div>
          {step.type === "input" ? (
            <div className="flex flex-col items-center mt-4 gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white border border-gray-300 px-6 py-2 rounded-full w-64"
                placeholder="Votre réponse..."
                autoFocus
              />
              <Button
                onClick={() => handleInputAnswer(inputValue)}
                className="bg-[#919191] hover:bg-gray-600 text-white px-6 py-2 rounded-full"
              >
                Valider
              </Button>
            </div>
          ) : (
            <div className="flex justify-center mt-4 gap-2 flex-wrap">
              {step.answers?.map((answer, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(answer.value)}
                  className="bg-[#919191] hover:bg-gray-600 text-white px-4 py-2 rounded-full flex items-center gap-2 mb-2"
                >
                  <span>{answer.emoji}</span>
                  <span className="text-sm">{answer.text}</span>
                </Button>
              ))}
            </div>
          )}
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                setEditingIndex(null)
                setInputValue("")
              }}
              variant="ghost"
              className="text-gray-600"
            >
              Annuler
            </Button>
          </div>
        </div>,
      )
    } else {
      for (let i = 0; i < qualificationSteps.length; i++) {
        const step = qualificationSteps[i]
        const answer = userAnswers[i]
        if (answer) {
          messages.push(
            <div key={`question-${i}`} className="mb-4">
              <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
                <p className="text-base text-[#414143]">{step.question}</p>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
                  <Play className="w-4 h-4 text-[#414143] fill-current" />
                </Button>
              </div>
              <div className="flex justify-center mt-2 gap-2">
                <div className="bg-[#919191] text-white px-6 py-2 rounded-full flex items-center gap-2">
                  {step.type === "input" ? (
                    <span>{answer}</span>
                  ) : (
                    <>
                      <span>{step.answers?.find((a) => a.value === answer)?.emoji}</span>
                      <span>{step.answers?.find((a) => a.value === answer)?.text || answer}</span>
                    </>
                  )}
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
            </div>,
          )
        }
      }

      if (currentStep < qualificationSteps.length && !isQuestionnaireFinished && !userAnswers[currentStep]) {
        const currentQuestion = qualificationSteps[currentStep]
        messages.push(
          <div key={`current-question`} className="mb-4">
            <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
              <p className="text-base text-[#414143]">{currentQuestion.question}</p>
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
                <Play className="w-4 h-4 text-[#414143] fill-current" />
              </Button>
            </div>
            {currentQuestion.type === "input" ? (
              <div className="flex flex-col items-center mt-4 gap-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white border border-gray-300 px-6 py-2 rounded-full w-64"
                  placeholder="Votre réponse..."
                />
              </div>
            ) : currentQuestion.type === "city" ? (
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
                      className="px-4 py-2 border border-gray-300 rounded-full w-full"
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
                    onClick={() => handleInputAnswer(inputValue)}
                    className="bg-[#919191] hover:bg-gray-600 text-white px-6 py-2 rounded-full"
                  >
                    Valider
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mt-4 gap-2 flex-wrap">
                {currentQuestion.answers?.map((answer, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(answer.value)}
                    className="bg-[#919191] hover:bg-gray-600 text-white px-4 py-2 rounded-full flex items-center gap-2 mb-2"
                  >
                    <span>{answer.emoji}</span>
                    <span className="text-sm">{answer.text}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>,
        )
      }

      if (isQuestionnaireFinished) {
        const finalSuggestions = getFinalSuggestions(category)
        messages.push(
          <div key="final-suggestions" className="mb-8">
            <div className="bg-[#e8f5e8] p-6 rounded-2xl max-w-[90%] mx-auto border border-[#d0e8d0] mb-4">
              <p className="font-semibold text-green-700 text-lg">
                🎉 Merci pour ces informations !
              </p>
              <p className="mt-3 text-gray-700">
                Que souhaitez-vous faire exactement ?
              </p>
            </div>
            <div className="space-y-3">
              {finalSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  variant="outline"
                  className="w-full h-16 p-4 text-left border-[#e7e7e7] bg-[#f5f5f5] hover:bg-gray-100 rounded-2xl text-[#585858] text-sm font-normal"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>,
        )
      }
    }

    return messages
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col pb-24">
      <header className="flex items-center justify-between py-3 px-6 border-b border-gray-200">
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Menu className="w-6 h-6 text-[#414143]" />
          </Button>
          {!showInitialMessage && (
            <Button
              onClick={() => setShowAnswers((prev) => !prev)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300"
            >
              {showAnswers ? "Revenir au questionnaire" : "Voir / modifier mes réponses"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = "/")}
          />
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-6 h-6 text-[#414143]" />
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
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
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
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
                <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 pb-28">
                  {renderMessages()}
                  {state.currentMessages.length > 0 && (
                    <SimpleChatDisplay />
                  )}
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
      <div className="mb-4"></div>
      <ChatInput
        theme={category}
        placeholder={skipQualification || isQuestionnaireFinished ? `Posez votre question sur ${category}...` : "Répondez à la question ou posez votre propre question..."}
        onSendMessage={(message: string) => {
          if (!skipQualification) {
            if (showInitialMessage) {
              if (message.toLowerCase().includes("d'accord")) {
                handleInitialAccept()
                return true
              } else if (message.trim()) {
                setSkipQualification(true)
                return false
              }
            } else if (currentStep < qualificationSteps.length) {
              const current = qualificationSteps[editingIndex ?? currentStep]
              if (current.type === "input") {
                handleInputAnswer(message)
                return true
              } else {
                const matchingAnswer = current.answers?.find(a =>
                  message.toLowerCase().includes(a.text.toLowerCase()) ||
                  message.toLowerCase().includes(a.value.toLowerCase())
                )
                if (matchingAnswer) {
                  handleAnswer(matchingAnswer.value)
                  return true
                } else if (message.trim()) {
                  setSkipQualification(true)
                  return false
                }
              }
            }
          }
          return false
        }}
      />
    </div>
  )
}