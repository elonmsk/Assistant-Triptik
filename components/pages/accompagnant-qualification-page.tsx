"use client"
import { Menu, MoreVertical, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { ChatInput, SimpleChatDisplay } from "@/components/ui-custom"
import { useChat } from '@/contexts/ChatContext'
import ProcessingIndicator from '@/components/chat/ProcessingIndicator'
import { generateStableId } from '@/lib/utils'

interface AccompagnantQualificationPageProps {
  category: string
  onBack: () => void
}

interface QualificationStep {
  question: string
  answers?: { text: string; emoji: string; value: string }[]
  type?: "input"
  condition?: (answers: string[]) => boolean
}

export default function AccompagnantQualificationPage({ category, onBack }: AccompagnantQualificationPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showInitialMessage, setShowInitialMessage] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [skipQualification, setSkipQualification] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { state, setUserInfo } = useChat()

  useEffect(() => {
    const numero = localStorage.getItem("uid") || localStorage.getItem("numero") || generateStableId('accompagnant')
    setUserInfo(numero, 'accompagnant')
  }, [setUserInfo])

  const showChatMessages = state.currentMessages.length > 0
  const showProcessingIndicator = state.processingState.currentStep !== 'idle' && !showChatMessages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentStep, userAnswers, showInitialMessage])

  const getQualificationSteps = (categoryName: string): QualificationStep[] => {
    const commonSteps: QualificationStep[] = [
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
        type: "input"
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
        question: "Quelle est la langue courante de la personne ?",
        answers: [
          { text: "Français", emoji: "🇫🇷", value: "french" },
          { text: "Anglais", emoji: "🇬🇧", value: "english" },
          { text: "Arabe", emoji: "🌍", value: "arabic" },
          { text: "Autre", emoji: "🗣️", value: "other" },
        ],
      },
      {
        question: "Quelle est la ville de domiciliation de la personne ?",
        type: "input"
      },
      {
        question: "Quel est le département de domiciliation de la personne ?",
        type: "input"
      },
      {
        question: "La personne est-elle en situation de handicap ?",
        answers: [
          { text: "Oui", emoji: "♿", value: "yes" },
          { text: "Non", emoji: "👍", value: "no" },
        ],
      },
      {
        question: "Combien d'enfants a-t-elle ?",
        type: "input",
        condition: (answers: string[]) => answers.includes("yes"),
      },
    ]

    const specificSteps: { [key: string]: QualificationStep[] } = {
      Santé: [
        {
          question: "La personne a-t-elle une couverture sociale (Carte Sécu, CMU, AME) ?",
          answers: [
            { text: "Oui", emoji: "💳", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
          ],
        },
      ],
      Emploi: [
        {
          question: "La personne réside-t-elle en France depuis plus de 6 mois ou 5 ans ?",
          answers: [
            { text: "Plus de 6 mois", emoji: "🏠", value: "6_months" },
            { text: "Plus de 5 ans", emoji: "🏡", value: "5_years" },
            { text: "Moins de 6 mois", emoji: "❌", value: "less_6_months" },
          ],
        },
        {
          question: "Quel est le niveau scolaire de la personne ?",
          answers: [
            { text: "Primaire", emoji: "📚", value: "primary" },
            { text: "Collège", emoji: "🎓", value: "middle" },
            { text: "Lycée", emoji: "🎒", value: "high" },
            { text: "Supérieur", emoji: "🎓", value: "higher" },
          ],
        },
        {
          question: "La personne est-elle inscrite à France Travail ?",
          answers: [
            { text: "Oui", emoji: "✅", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
          ],
        },
        {
          question: "La personne a-t-elle déjà travaillé en France ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
        {
          question: "La personne a-t-elle un CV à jour ?",
          answers: [
            { text: "Oui", emoji: "👍", value: "yes" },
            { text: "Non", emoji: "👎", value: "no" },
          ],
        },
      ],
    }

    return [...commonSteps, ...(specificSteps[categoryName] || [])]
  }

  const qualificationSteps = getQualificationSteps(category)

  const handleInitialAccept = () => setShowInitialMessage(false)

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers, answer]
    setUserAnswers(newAnswers)
    
    // Sauvegarder les réponses de qualification dans localStorage
    const qualificationData = {
      category,
      answers: newAnswers,
      timestamp: Date.now(),
      userType: 'accompagnant'
    }
    localStorage.setItem(`qualification_${category}_accompagnant`, JSON.stringify(qualificationData))
    
    if (currentStep < qualificationSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleInputAnswer = () => {
    if (!inputValue.trim()) return
    const newAnswers = [...userAnswers, inputValue.trim()]
    setUserAnswers(newAnswers)
    
    // Sauvegarder les réponses de qualification dans localStorage
    const qualificationData = {
      category,
      answers: newAnswers,
      timestamp: Date.now(),
      userType: 'accompagnant'
    }
    localStorage.setItem(`qualification_${category}_accompagnant`, JSON.stringify(qualificationData))
    
    handleAnswer(inputValue.trim())
    setInputValue("")
  }

  const renderMessages = () => {
    const messages = []
    if (showInitialMessage) {
      messages.push(
        <div key="intro" className="mb-8">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md max-w-[90%] mx-auto">
            <p>Vous avez choisi : {category}. Nous allons poser quelques questions sur la personne accompagnée.</p>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={handleInitialAccept} className="bg-[#919191] text-white rounded-full px-6 py-2">
              👍 D'accord
            </Button>
          </div>
        </div>
      )
    } else {
      for (let i = 0; i <= Math.min(currentStep, userAnswers.length - 1); i++) {
        const step = qualificationSteps[i]
        const answer = userAnswers[i]
        const answerLabel = step.answers?.find(a => a.value === answer)
        messages.push(
          <div key={`q-${i}`} className="mb-4">
            <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md max-w-[90%]">
              <p>{step.question}</p>
            </div>
            <div className="flex justify-center mt-2">
              <Button disabled className="bg-[#919191] text-white rounded-full px-4 py-2">
                {answerLabel ? `${answerLabel.emoji} ${answerLabel.text}` : answer}
              </Button>
            </div>
          </div>
        )
      }

      if (currentStep < qualificationSteps.length && currentStep >= userAnswers.length) {
        const current = qualificationSteps[currentStep]
        messages.push(
          <div key="current" className="mb-4">
            <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md max-w-[90%]">
              <p>{current.question}</p>
            </div>
            {current.type === "input" ? (
              <div className="flex justify-center mt-4">
                <div className="flex gap-2 w-full max-w-md">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="px-4 py-2 border rounded-full flex-1"
                  />
                  <Button onClick={handleInputAnswer} className="bg-[#919191] text-white rounded-full px-6 py-2">
                    Valider
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {current.answers?.map((ans, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleAnswer(ans.value)}
                    className="bg-[#919191] text-white rounded-full px-4 py-2"
                  >
                    {ans.emoji} {ans.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )
      }
    }
    return messages
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <Menu className="w-6 h-6 text-gray-700" />
        </Button>
        <img src="/images/emmaus-logo.png" className="h-20 w-auto" onClick={() => (window.location.href = "/")} alt="Emmaus Connect" />
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
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">😊</div>
                <span className="text-base font-medium text-[#414143]">Assistant Triptik</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
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
      <ChatInput
        theme={category}
        placeholder={skipQualification ? `Posez votre question sur ${category}...` : "Répondez à la question ou posez votre propre question..."}
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
              const current = qualificationSteps[currentStep]
              if (current.type === "input") {
                setInputValue(message)
                handleInputAnswer()
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
