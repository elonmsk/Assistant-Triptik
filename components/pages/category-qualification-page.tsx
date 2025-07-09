"use client"

import { Menu, MoreVertical, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { ChatInput } from "@/components/ui-custom"

interface CategoryQualificationPageProps {
  category: string
  onBack: () => void
  isConnected?: boolean // Nouveau prop pour savoir si l'utilisateur est connecté
}

interface QualificationStep {
  question: string
  answers: { text: string; emoji: string; value: string }[]
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fonction pour faire défiler vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Défilement automatique quand les messages changent
  useEffect(() => {
    scrollToBottom()
  }, [currentStep, userAnswers, showInitialMessage])

  const getQualificationSteps = (categoryName: string, isUserConnected: boolean): QualificationStep[] => {
    const commonSteps = [
      common: [

      {
        question: "Avez-vous déjà fait des démarches dans ce domaine ?",
        answers: [
          { text: "Oui", emoji: "👍", value: "yes" },
          { text: "Non", emoji: "👎", value: "no" },
        ],
      },
    ];

    // Questions du compte (en rouge dans l'image) - posées si pas connecté
    const accountQuestions = {
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
          question: "Quelle est votre date de naissance ?",
          answers: [
            { text: "1990-2000", emoji: "📅", value: "1990-2000" },
            { text: "2000-2010", emoji: "📆", value: "2000-2010" },
            { text: "Autre", emoji: "🗓️", value: "other" },
          ],
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
          answers: [
            { text: "Paris", emoji: "🏙️", value: "paris" },
            { text: "Lyon", emoji: "🌆", value: "lyon" },
            { text: "Marseille", emoji: "🏖️", value: "marseille" },
            { text: "Autre", emoji: "📍", value: "other" },
          ],
        },
        {
          question: "Quel est votre département de domiciliation ?",
          answers: [
            { text: "75 (Paris)", emoji: "🏢", value: "75" },
            { text: "92 (Hauts-de-Seine)", emoji: "🏘️", value: "92" },
            { text: "93 (Seine-Saint-Denis)", emoji: "🏙️", value: "93" },
            { text: "94 (Val-de-Marne)", emoji: "🌳", value: "94" },
            { text: "Autre", emoji: "📮", value: "other" },
          ],
        },
        {
          question: "Quel est votre âge ?",
          answers: [
            { text: "18-25", emoji: "👦", value: "18-25" },
            { text: "26-40", emoji: "👨", value: "26-40" },
            { text: "41-60", emoji: "👨‍🦳", value: "41-60" },
            { text: "60+", emoji: "👴", value: "60+" },
          ],
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
      ],
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
          question: "Êtes-vous inscrit à France Travail ?",
          answers: [
            { text: "Oui", emoji: "✅", value: "yes" },
            { text: "Non", emoji: "❌", value: "no" },
          ],
        },
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
    };

    // Questions spécifiques à chaque thématique (en gris dans l'image)
    const specificQuestions = {
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
    };

    let steps = [...commonSteps];

    // Logique spécifique pour la santé
    if (categoryName === "Santé") {
      if (!isUserConnected) {
        // Si pas connecté pour la santé : questions communes + questions spécifiques santé du compte
        steps = [...steps, ...accountQuestions.common];
        if (accountQuestions.Santé) {
          steps = [...steps, ...accountQuestions.Santé];
        }
      }
      // Dans tous les cas (connecté ou pas), ajouter les questions spécifiques grises
      if (specificQuestions.Santé) {
        steps = [...steps, ...specificQuestions.Santé];
      }
    } else {
      // Pour les autres catégories, comportement normal
      if (!isUserConnected) {
        steps = [...steps, ...accountQuestions.common];
        if (accountQuestions[categoryName as keyof typeof accountQuestions]) {
          steps = [...steps, ...accountQuestions[categoryName as keyof typeof accountQuestions]];
        }
      }

      if (specificQuestions[categoryName as keyof typeof specificQuestions]) {
        steps = [...steps, ...specificQuestions[categoryName as keyof typeof specificQuestions]];
      }
    }

    return steps;
  };

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
      // Qualification terminée - afficher les suggestions finales
      setCurrentStep(currentStep + 1) // Pour déclencher l'affichage des suggestions
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
    };

    return suggestions[categoryName as keyof typeof suggestions] || ["Obtenir de l'aide", "Poser une question", "Continuer"];
  };

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
            <div className="flex justify-center mt-4 gap-2 flex-wrap">
              {currentQuestion.answers.map((answer, index) => (
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
          </div>,
        )
      }
    }

    // Suggestions finales après qualification terminée
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
