"use client"

import { Menu, MoreVertical, Play, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { ChatInput } from "@/components/ui-custom"

interface ChatConversationPageProps {
  userProfile: {
    country: string
    age: number
    status: string
    language: string
  }
  sessionId?: string | null
  onBack: () => void
  onSessionUpdate?: (sessionId: string) => void
  initialMessages?: ChatMessage[]
}

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  sources?: string[]
  metadata?: any
  fullContentForApi?: string
}

export default function ChatConversationPage({ 
  userProfile, 
  sessionId, 
  onBack, 
  onSessionUpdate,
  initialMessages = []
}: ChatConversationPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [localSessionId, setLocalSessionId] = useState<string | null>(sessionId || null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fonction pour faire défiler vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Défilement automatique quand les messages changent ou pendant le streaming
  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])
  
  // Traiter le message initial au montage du composant
  useEffect(() => {
    if (initialMessages.length > 0) {
      // Si on a seulement un message utilisateur, déclencher l'API
      const userMessages = initialMessages.filter(m => m.isUser)
      const assistantMessages = initialMessages.filter(m => !m.isUser)
      
      if (userMessages.length > 0 && assistantMessages.length === 0) {
        const lastUserMessage = userMessages[userMessages.length - 1]
        handleSendMessage(lastUserMessage.content)
      }
    }
  }, []) // Ne s'exécute qu'au montage

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSendMessage = async (message: string) => {
    if (isLoading || isStreaming) return

    console.log('Debug - handleSendMessage appelé avec:', message)

    // Arrêter tout streaming en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    console.log('Debug - États mis à jour: isLoading=true, isStreaming=false')
    setIsLoading(true)
    setIsStreaming(false)
    setStreamingContent('')
    
    // Vérifier si c'est le premier message depuis initialMessages
    const isInitialMessage = initialMessages.length > 0 && messages.length === initialMessages.length
    
    if (!isInitialMessage) {
      // Ajouter le message utilisateur (pour les messages suivants)
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])
    }

    try {
      // Si c'est un message initial, utiliser le contenu du dernier message utilisateur des initialMessages
      let messageToSend = message.trim()
      if (isInitialMessage && initialMessages.length > 0) {
        const lastUserMessage = initialMessages.filter(m => m.isUser).pop()
        if (lastUserMessage) {
          // Utiliser le contenu complet pour l'API s'il existe, sinon le contenu affiché
          messageToSend = lastUserMessage.fullContentForApi || lastUserMessage.content
        }
      }

      // Créer un nouveau AbortController pour cette requête
      abortControllerRef.current = new AbortController()
      
      console.log('Debug - Envoi de la requête streaming vers /api/chat/stream')
      console.log('Debug - Message à envoyer:', messageToSend)
      
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: localSessionId,
          userProfile
        }),
        signal: abortControllerRef.current.signal
      })

      console.log('Debug - Réponse reçue, status:', response.status)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Impossible de lire la réponse')
      }

      console.log('Debug - Passage en mode streaming: isLoading=false, isStreaming=true')
      setIsLoading(false)
      setIsStreaming(true)

             const decoder = new TextDecoder()
       let buffer = ''
       let finalSources: string[] = []
       let finalMetadata: any = null
       let finalContent = ''

       try {
         while (true) {
           const { done, value } = await reader.read()
           
           if (done) break

           buffer += decoder.decode(value, { stream: true })
           
           // Traiter les lignes complètes
           const lines = buffer.split('\n')
           buffer = lines.pop() || '' // Garder la ligne incomplète
           
           for (const line of lines) {
             if (line.startsWith('data: ')) {
               try {
                 const data = JSON.parse(line.slice(6))
                 
                 switch (data.type) {
                   case 'start':
                     console.log('Debug - SSE: Début du traitement')
                     break
                   case 'sources':
                     console.log('Debug - SSE: Consultation des sources')
                     break
                   case 'token':
                     finalContent = data.data.content
                     setStreamingContent(finalContent)
                     console.log('Debug - SSE: Token reçu, longueur:', finalContent.length)
                     break
                   case 'complete':
                     finalSources = data.data.sources || []
                     finalMetadata = data.data.metadata
                     console.log('Debug - SSE: Streaming terminé, sources:', finalSources.length)
                     
                     // Mettre à jour le sessionId si nécessaire
                     if (data.data.sessionId && data.data.sessionId !== localSessionId) {
                       setLocalSessionId(data.data.sessionId)
                       onSessionUpdate?.(data.data.sessionId)
                     }
                     break
                   case 'error':
                     console.log('Debug - SSE: Erreur reçue:', data.data.message)
                     throw new Error(data.data.message)
                 }
               } catch (parseError) {
                 console.error('Erreur parsing SSE:', parseError)
               }
             }
           }
         }

         // Créer le message final avec le contenu streamé
         if (finalContent) {
           const assistantMessage: ChatMessage = {
             id: (Date.now() + 1).toString(),
             content: finalContent,
             isUser: false,
             timestamp: new Date(),
             sources: finalSources,
             metadata: finalMetadata
           }

           setMessages(prev => [...prev, assistantMessage])
         }

      } finally {
        await reader.cancel()
      }

    } catch (error: any) {
      console.error('Erreur lors du streaming:', error)
      
      if (error.name !== 'AbortError') {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `Désolé, une erreur s'est produite : ${error.message}`,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent('')
      abortControllerRef.current = null
    }
  }

  const renderMessages = () => {
    const messageElements = []

    // Message d'accueil initial si pas de messages
    if (messages.length === 0) {
      messageElements.push(
        <div key="welcome" className="mb-8">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <p className="text-base text-[#414143]">
              Bonjour ! Je suis votre assistant intelligent Triptik. Je peux vous aider avec vos questions sur la santé, l'emploi, le logement, et bien plus encore. Je consulte des sources officielles pour vous donner des réponses précises.
            </p>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
              <Play className="w-4 h-4 text-[#414143] fill-current" />
            </Button>
          </div>
        </div>
      )
    }

    // Afficher tous les messages
    messages.forEach((message, index) => {
      if (message.isUser) {
        // Message utilisateur - style bouton comme dans CategoryQualificationPage
        messageElements.push(
          <div key={`user-${message.id}`} className="mb-8 flex justify-center">
            <div className="bg-[#2361f3] text-white px-6 py-3 rounded-full flex items-center gap-2 max-w-[80%]">
              <span>👤</span>
              <span className="text-sm">{message.content}</span>
            </div>
          </div>
        )
      } else {
        // Message assistant - style bulle comme dans CategoryQualificationPage
        messageElements.push(
          <div key={`assistant-${message.id}`} className="mb-4">
            <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
              <p className="text-base text-[#414143] whitespace-pre-wrap">{message.content}</p>
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
                <Play className="w-4 h-4 text-[#414143] fill-current" />
              </Button>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                  <div className="text-xs font-medium text-gray-600">Sources consultées :</div>
                  {message.sources.slice(0, 3).map((source, index) => (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate">ameli.fr</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }
    })

    // Indicateur de chargement initial
    if (isLoading) {
      messageElements.push(
        <div key="loading" className="mb-4">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm text-gray-600">Assistant réfléchit...</span>
            </div>
          </div>
        </div>
      )
    }

    // Indicateur de streaming sans contenu encore
    if (isStreaming && !streamingContent) {
      messageElements.push(
        <div key="streaming-start" className="mb-4">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Assistant est en train d'écrire...</span>
            </div>
          </div>
        </div>
      )
    }

    // Contenu en streaming
    if (isStreaming && streamingContent) {
      messageElements.push(
        <div key="streaming" className="mb-4">
          <div className="bg-[#f4f4f4] p-4 rounded-2xl rounded-tl-md relative max-w-[90%]">
            <p className="text-base text-[#414143] whitespace-pre-wrap">{streamingContent}</p>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
              <Play className="w-4 h-4 text-[#414143] fill-current" />
            </Button>
            
            {/* Indicateur de frappe en streaming */}
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Assistant est en train d'écrire...</span>
            </div>
          </div>
        </div>
      )
    }

    return messageElements
  }

  return (
    <div className="min-h-screen bg-[#ffffff] pb-24 relative">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <span className="text-lg">←</span>
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

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-4">
        {/* Messages de conversation */}
        <div className="space-y-4">
          {renderMessages()}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Fixed Chat Input */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? "Assistant réfléchit..." : "Continuez la conversation..."}
      />
    </div>
  )
} 