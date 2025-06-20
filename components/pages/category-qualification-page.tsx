"use client"

import { Menu, MoreVertical, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { ChatInput } from "@/components/ui-custom"

interface CategoryQualificationPageProps {
  category: string
  onBack: () => void
}

interface QualificationStep {
  question: string
  answers: { text: string; emoji: string; value: string }[]
}

export default function CategoryQualificationPage({ category, onBack }: CategoryQualificationPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showInitialMessage, setShowInitialMessage] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fonction pour faire défiler vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Défilement automatique quand les messages changent
  useEffect(() => {
    scrollToBottom()
  }, [currentStep, userAnswers, showInitialMessage])

  const getQualificationSteps = (categoryName: string): QualificationStep[] => {
    const steps: { [key: string]: QualificationStep[] } = {
      Santé: [
        {
          question: "Avez-vous un numéro de sécurité sociale ? Il est composé de 13 chiffres au minimum.",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
        {
          question: "C'est un numéro provisoire ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
        {
          question: "Êtes-vous en situation de handicap ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
      ],
      Emploi: [
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
        {
          question: "Êtes-vous inscrit à Pôle Emploi ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
      ],
      Logement: [
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
    }

    return (
      steps[categoryName] || [
        {
          question: "Avez-vous déjà fait des démarches dans ce domaine ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
      ]
    )
  }

  const qualificationSteps = getQualificationSteps(category)

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
      // Qualification terminée - afficher les suggestions finales
      setCurrentStep(currentStep + 1) // Pour déclencher l'affichage des suggestions
    }
  }

  const renderMessages = () => {
    const messages = []

    // Message initial
    if (showInitialMessage) {
      messages.push(
        <div key="initial" className="mb-8">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <p className="text-base text-[#414143]">
              Vous avez choisi : {category}. Je vais vous poser quelques questions pour mieux comprendre votre
              situation.
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
    }

    // Questions et réponses précédentes
    if (!showInitialMessage) {
      for (let i = 0; i <= Math.min(currentStep, userAnswers.length - 1); i++) {
        const step = qualificationSteps[i]
        const userAnswer = userAnswers[i]

        // Question
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

        // Réponse de l'utilisateur (si elle existe)
        if (userAnswer) {
          const answerData = step.answers.find((a) => a.value === userAnswer)
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

      // Question actuelle (si pas encore répondue)
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
            <div className="flex justify-center mt-4 gap-4">
              {currentQuestion.answers.map((answer, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(answer.value)}
                  className="bg-[#919191] hover:bg-gray-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
                >
                  <span>{answer.emoji}</span>
                  <span>{answer.text}</span>
                </Button>
              ))}
            </div>
          </div>,
        )
      }
    }

    // Suggestions finales après qualification terminée
    if (currentStep >= qualificationSteps.length && userAnswers.length === qualificationSteps.length) {
      const finalSuggestions = ["J'ai perdu ma carte vitale", "Renouveler ma carte vitale", "Obtenir une carte vitale"]

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
      {/* Header */}
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

      {/* Chat Content */}
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-2xl p-6 flex flex-col">
          {/* Assistant Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
            <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
          </div>

          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {renderMessages()}
              {/* Référence pour le défilement automatique */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Chat Input */}
      <ChatInput onSendMessage={(message) => setInputValue(message)} />
    </div>
  )
}
