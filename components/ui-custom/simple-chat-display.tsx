"use client"

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@/contexts/ChatContext'
import ReactMarkdown from 'react-markdown'
import ProcessingIndicator from '@/components/chat/ProcessingIndicator'
import { MessageRating } from '@/components/chat/MessageRating'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, ChevronUp, Copy, Volume2, Square } from 'lucide-react'

interface SimpleChatDisplayProps {
  className?: string
}

export default function SimpleChatDisplay({ className = "" }: SimpleChatDisplayProps) {
  const { state, updateMessageRating, updateMessageFeedback } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({})

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.currentMessages])

  const handleRatingChange = async (messageId: string, rating: 'like' | 'dislike' | null) => {
    // Mettre à jour l'état local immédiatement
    updateMessageRating(messageId, rating)
    
    // Sauvegarder en base de données
    try {
      const response = await fetch('/api/messages/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          rating,
          userNumero: state.userNumero,
          userType: state.userType
        })
      })

      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde de la notation')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la notation:', error)
    }
  }

  const handleFeedbackSubmit = async (messageId: string, feedback: string) => {
    // Mettre à jour l'état local immédiatement
    updateMessageFeedback(messageId, feedback)
    
    // Sauvegarder en base de données
    try {
      const response = await fetch('/api/messages/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          feedback,
          userNumero: state.userNumero,
          userType: state.userType
        })
      })

      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde du feedback')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du feedback:', error)
    }
  }

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      window.setTimeout(() => {
        setCopiedMessageId((current) => (current === messageId ? null : current))
      }, 2000)
    } catch (e) {
      console.error("Erreur lors de la copie:", e)
    }
  }

  const toPlainTextForSpeech = (content: string) => {
    return (
      content
        // liens markdown -> garder seulement le texte (ne pas lire l'URL)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        // URLs nues -> supprimer (ne pas lire http/https/www)
        .replace(/\bhttps?:\/\/[^\s)]+/gi, '')
        .replace(/\bwww\.[^\s)]+/gi, '')
        // emojis / pictogrammes -> supprimer
        .replace(/\p{Extended_Pictographic}+/gu, '')
        // variantes/liaisons emoji (VS16 + ZWJ)
        .replace(/[\uFE0F\u200D]/g, '')
        // titres markdown
        .replace(/^#{1,6}\s+/gm, '')
        // listes
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        // blockquote
        .replace(/^\s*>\s?/gm, '')
        // gras/italique/code inline
        .replace(/[*_`]/g, '')
        // espaces
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\s+\n/g, '\n')
        .trim()
    )
  }

  const stopSpeaking = () => {
    try {
      window.speechSynthesis?.cancel()
    } catch {}
    setSpeakingMessageId(null)
  }

  const handleSpeakToggle = (messageId: string, content: string) => {
    if (typeof window === 'undefined') return
    if (!('speechSynthesis' in window)) return

    if (speakingMessageId === messageId) {
      stopSpeaking()
      return
    }

    // Stop toute lecture en cours puis démarre celle-ci
    stopSpeaking()
    const text = toPlainTextForSpeech(content)
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.onend = () => {
      setSpeakingMessageId((current) => (current === messageId ? null : current))
    }
    utterance.onerror = () => {
      setSpeakingMessageId((current) => (current === messageId ? null : current))
    }

    setSpeakingMessageId(messageId)
    window.speechSynthesis.speak(utterance)
  }

  // Si le composant se démonte, arrêter la lecture
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel()
      } catch {}
    }
  }, [])

  const splitSummaryAndDetails = (content: string) => {
    const lines = content.replace(/\r\n/g, "\n").split("\n")

    const isSyntheseHeading = (line: string) =>
      /^##\s*(?:✅\s*)?synth[èe]se\b/i.test(line.trim())

    const isH2 = (line: string) => /^##\s+/.test(line.trim())

    const synthIdx = lines.findIndex(isSyntheseHeading)
    if (synthIdx >= 0) {
      let nextH2 = lines.length
      for (let i = synthIdx + 1; i < lines.length; i++) {
        if (isH2(lines[i])) {
          nextH2 = i
          break
        }
      }
      const summary = lines.slice(0, nextH2).join("\n").trim()
      const details = lines.slice(nextH2).join("\n").trim()
      return { summary, details }
    }

    // Fallback : titre + 1ère section seulement
    const h2Indexes: number[] = []
    for (let i = 0; i < lines.length; i++) {
      if (isH2(lines[i])) h2Indexes.push(i)
    }
    if (h2Indexes.length >= 2) {
      const cut = h2Indexes[1]
      return {
        summary: lines.slice(0, cut).join("\n").trim(),
        details: lines.slice(cut).join("\n").trim(),
      }
    }
    return { summary: content.trim(), details: "" }
  }

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-4" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold my-1" {...props} />,
        p: ({ node, ...props }) => <p className="text-sm leading-relaxed my-1" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
        li: ({ node, ...props }) => <li className="text-sm" {...props} />,
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 hover:underline cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              window.open(props.href, "_blank", "noopener,noreferrer")
            }}
            {...props}
          />
        ),
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        pre: ({ node, ...props }) => <pre className="bg-gray-200 p-2 rounded text-xs overflow-x-auto" {...props} />,
        code: ({ node, ...props }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )

  if (state.currentMessages.length === 0) {
    return null // Ne rien afficher s'il n'y a pas de messages
  }

  const renderMessages = () => {
    const messages = []

    for (let i = 0; i < state.currentMessages.length; i++) {
      const message = state.currentMessages[i]

      if (message.role === 'user') {
        // Message utilisateur - bulle bleue alignée à droite
        messages.push(
          <div key={`user-${i}`} className="mb-4 flex justify-end">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="bg-[#2361f3] text-white p-3 rounded-2xl rounded-tr-md">
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
            </div>
          </div>
        )
      } else {
        // Message assistant - bulle grise alignée à gauche
        const { summary, details } = splitSummaryAndDetails(message.content)
        const isExpanded = !!expandedById[message.id]
        const speechContent = isExpanded ? message.content : summary

        messages.push(
          <div key={`assistant-${i}`} className="mb-4 flex justify-start">
            <div className="flex items-start gap-3 max-w-[85%] min-w-[300px]">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="relative bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-md w-full">
                {message.content === "L'assistant Triptik est en train d'écrire..." ? (
                  // Utiliser le ProcessingIndicator si on a un état de progression actif
                  state.processingState.currentStep !== 'idle' ? (
                    <ProcessingIndicator
                      currentStep={state.processingState.currentStep}
                      message={state.processingState.message}
                      progress={state.processingState.progress}
                      category={state.processingState.category}
                      chatMode={true}
                    />
                  ) : (
                    // Fallback vers l'ancien indicateur
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600 italic">L'assistant Triptik est en train d'écrire</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    {/* Copier la réponse */}
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      {/* Lecture sonore */}
                      {'speechSynthesis' in window && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-900"
                          onClick={() => handleSpeakToggle(message.id, speechContent)}
                          aria-label={speakingMessageId === message.id ? "Arrêter la lecture" : "Lire la réponse"}
                          title={speakingMessageId === message.id ? "Stop" : "Lecture"}
                        >
                          {speakingMessageId === message.id ? (
                            <Square className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => handleCopy(message.id, message.content)}
                        aria-label="Copier la réponse"
                        title="Copier"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="prose prose-sm max-w-none overflow-hidden">
                      {renderMarkdown(summary)}

                      {details && (
                        <div className="mt-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="px-2 text-xs text-gray-600 hover:text-gray-900"
                            onClick={() =>
                              setExpandedById((prev) => ({ ...prev, [message.id]: !prev[message.id] }))
                            }
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Masquer le détail
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Voir le détail
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {details && isExpanded && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          {renderMarkdown(details)}
                        </div>
                      )}
                    </div>
                    
                    {/* Système de notation - seulement si le message n'est pas en cours d'écriture */}
                    {message.content !== "L'assistant Triptik est en train d'écrire..." && (
                      <MessageRating
                        messageId={message.id}
                        currentRating={message.rating}
                        onRatingChange={handleRatingChange}
                        onFeedbackSubmit={handleFeedbackSubmit}
                        className="mt-2"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )
      }
    }

    return messages
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {renderMessages()}
      <div ref={messagesEndRef} />
    </div>
  )
} 