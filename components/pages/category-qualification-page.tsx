"use client"
import { Menu, MoreVertical, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { ChatInput, SimpleChatDisplay } from "@/components/ui-custom"
import { useChat } from '@/contexts/ChatContext'
import ProcessingIndicator from '@/components/chat/ProcessingIndicator'

interface CategoryQualificationPageProps {
  category: string
  onBack: () => void
  isConnected?: boolean
}

interface QualificationStep {
  question: string
  answers?: { text: string; emoji: string; value: string }[]
  type?: "input" | "button"
  condition?: (answers: string[]) => boolean
}

export default function CategoryQualificationPage({
  category,
  onBack,
  isConnected = false
}: CategoryQualificationPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showInitialMessage, setShowInitialMessage] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [skipQualification, setSkipQualification] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Hook du contexte chat
  const { state, setUserInfo } = useChat()
  
  // Initialiser le contexte chat
  useEffect(() => {
    const numero = localStorage.getItem("uid") || localStorage.getItem("numero") || `guest_${Date.now()}`
    setUserInfo(numero, 'accompagne')
  }, [setUserInfo])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentStep, userAnswers, showInitialMessage])

  // Variables pour l'indicateur de progression
  const showChatMessages = state.currentMessages.length > 0;
  // Ne montrer l'indicateur fixe que s'il n'y a pas de messages de chat visibles
  const showProcessingIndicator = state.processingState.currentStep !== 'idle' && !showChatMessages;

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
          type: "input",
          answers: []
        },
        {
          question: "Quel est votre département de domiciliation ?",
          type: "input",
          answers: []
        },
        {
          question: "Êtes-vous en situation de handicap ?",
          answers: [
            { text: "Oui", emoji: "♿", value: "yes" },
            { text: "Non", emoji: "👍", value: "no" },
          ],
        },
        {
          question: "Avez-vous des enfants ?",
          answers: [
            { text: "Oui", emoji: "👶", value: "yes" },
            { text: "Non", emoji: "🚫", value: "no" },

          ],
        },
        {
          question: "Combien d'enfants avez-vous ?",
          type: "input",
          condition: (answers: string[]) => answers.includes("yes"),
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
            { text: "Plus de 6 mois", emoji: "🏠", value: "6_months" },
            { text: "Plus de 5 ans", emoji: "🏡", value: "5_years" },
            { text: "Moins de 6 mois", emoji: "❌", value: "less_6_months" },
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
            { text: "Plus de 6 mois", emoji: "🏠", value: "6_months" },
            { text: "Plus de 5 ans", emoji: "🏡", value: "5_years" },
            { text: "Moins de 6 mois", emoji: "❌", value: "less_6_months" },
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

    // Ajouter les questions générales du compte seulement si l'utilisateur n'est pas connecté
    if (!isUserConnected) {
      steps = [...steps, ...accountQuestions.common.filter(step => !step.condition || step.condition(userAnswers))]
    }

    // Ajouter les questions spécifiques au thème
    if (specificQuestions[categoryName as keyof typeof specificQuestions]) {
      steps = [...steps, ...specificQuestions[categoryName as keyof typeof specificQuestions]]
    }

    return steps
  }

  const qualificationSteps = getQualificationSteps(category, isConnected)

  const handleInitialAccept = () => {
    setShowInitialMessage(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers, answer]
    setUserAnswers(newAnswers)
    if (currentStep < qualificationSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleInputAnswer = (answer: string) => {
    const newAnswers = [...userAnswers, answer]
    setUserAnswers(newAnswers)
    if (currentStep < qualificationSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(currentStep + 1)
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

  const renderMessages = () => {
    const messages = []

    if (showInitialMessage) {
      messages.push(
        <div key="initial" className="mb-8">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <p className="text-base text-[#414143]">
              Vous avez choisi : {category}. Je vais vous poser quelques questions pour mieux comprendre votre situation.
            </p>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
              <Play className="w-4 h-4 text-[#414143] fill-current" />
            </Button>
          </div>
          {/* Suppression du bouton skip */}
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
    }

    if (!showInitialMessage) {
      for (let i = 0; i <= Math.min(currentStep, userAnswers.length - 1); i++) {
        const step = qualificationSteps[i]
        const userAnswer = userAnswers[i]

        messages.push(
          <div key={`question-${i}`} className="mb-4">
            <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
              <p className="text-base text-[#414143]">{step.question}</p>
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
                <Play className="w-4 h-4 text-[#414143] fill-current" />
              </Button>
            </div>
          </div>,
        )

        if (userAnswer) {
          if (step.type === "input") {
            messages.push(
              <div key={`answer-${i}`} className="mb-8 flex justify-center">
                <Button disabled className="bg-[#919191] text-white px-6 py-2 rounded-full flex items-center gap-2">
                  <span>{userAnswer}</span>
                </Button>
              </div>,
            )
          } else {
            const answerData = step.answers?.find((a) => a.value === userAnswer)
            if (answerData) {
              messages.push(
                <div key={`answer-${i}`} className="mb-8 flex justify-center">
                  <Button disabled className="bg-[#919191] text-white px-6 py-2 rounded-full flex items-center gap-2">
                    <span>{answerData.emoji}</span>
                    <span>{answerData.text}</span>
                  </Button>
                </div>,
              )
            }
          }
        }
      }

      if (currentStep < qualificationSteps.length && currentStep >= userAnswers.length) {
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
              <div className="flex justify-center mt-4">
                <input
                  type="text"
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-[#919191] hover:bg-gray-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
                />
                <Button
                  onClick={() => handleInputAnswer(inputValue)}
                  className="bg-[#919191] hover:bg-gray-600 text-white px-6 py-2 rounded-full flex items-center gap-2 ml-2"
                >
                  Valider
                </Button>
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
    }

    if (currentStep >= qualificationSteps.length && userAnswers.length === qualificationSteps.length) {
      const finalSuggestions = getFinalSuggestions(category)
      messages.push(
        <div key="final-suggestions" className="mb-8">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%] mb-4">
            <p className="text-base text-[#414143]">Parfait ! Maintenant, que souhaitez-vous faire exactement ?</p>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
              <Play className="w-4 h-4 text-[#414143] fill-current" />
            </Button>
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

    return messages
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col pb-24">
      <header className="flex items-center justify-between py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={onBack}>
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
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-6 h-6 text-[#414143]" />
        </Button>
      </header>
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-2xl p-6 flex flex-col">
          {/* Si on a passé la qualification, afficher SEULEMENT le chat */}
          {skipQualification ? (
            <div className="h-full">
              <SimpleChatDisplay />
            </div>
          ) : (
            <>
              {/* Header Assistant - seulement en mode qualification */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
                <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Messages de qualification */}
                  {renderMessages()}
                  
                  {/* Messages de chat intégrés directement */}
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

      {/* Indicateur de progression */}
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
        placeholder={skipQualification ? `Posez votre question sur ${category}...` : "Répondez à la question ou posez votre propre question..."}
        onSendMessage={(message: string) => {
          if (!skipQualification) {
            if (showInitialMessage) {
              if (message.toLowerCase().includes("d'accord")) {
                handleInitialAccept()
                return true // Géré, ne pas envoyer
              } else if (message.trim()) {
                setSkipQualification(true)
                return false // Envoyer le message au chat
              }
            } else if (currentStep < qualificationSteps.length) {
              const current = qualificationSteps[currentStep]
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