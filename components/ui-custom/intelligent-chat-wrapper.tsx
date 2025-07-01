"use client"

import { useState, useEffect, useRef } from "react"
import { X, ExternalLink, Brain, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ChatInput from "./chat-input"

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  sources?: string[]
  metadata?: any
}

interface IntelligentChatWrapperProps {
  userProfile: {
    country: string
    age: number
    status: string
    language: string
  }
  sessionId?: string | null
  onSessionUpdate?: (sessionId: string) => void
  onFirstMessage?: (messages: ChatMessage[]) => void
  fullScreenMode?: boolean
}

export default function IntelligentChatWrapper({
  userProfile,
  sessionId,
  onSessionUpdate,
  onFirstMessage,
  fullScreenMode = false
}: IntelligentChatWrapperProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<ChatMessage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [localSessionId, setLocalSessionId] = useState<string | null>(sessionId || null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas en mode plein écran
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (fullScreenMode) {
      scrollToBottom()
    }
  }, [messages, fullScreenMode])

  const handleSendMessage = async (message: string) => {
    if (isLoading) return

    // Déclencher le passage en mode chat si c'est le premier message
    if (messages.length === 0 && onFirstMessage) {
      // Créer le message utilisateur
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date()
      }
      
      const newMessages = [...messages, userMessage]
      onFirstMessage(newMessages)
      return // Arrêter ici car ChatConversationPage va prendre le relais
    }

    setIsLoading(true)
    
    // Ajouter le message utilisateur (pour les messages suivants)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: message.trim(),
          sessionId: localSessionId,
          userProfile
        })
      })

      const result = await response.json()

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: result.data.response,
          isUser: false,
          timestamp: new Date(),
          sources: result.data.sources,
          metadata: result.data.metadata
        }

        setMessages(prev => [...prev, assistantMessage])
        
        // En mode plein écran, on n'affiche pas la modal
        if (!fullScreenMode) {
          setCurrentResponse(assistantMessage)
          setShowResponseModal(true)
        }
        
        // Mettre à jour le sessionId si nécessaire
        if (result.data.sessionId && result.data.sessionId !== localSessionId) {
          setLocalSessionId(result.data.sessionId)
          onSessionUpdate?.(result.data.sessionId)
        }
        
      } else {
        console.error("Erreur:", result.error)
        // Ajouter un message d'erreur
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `Désolé, une erreur s'est produite : ${result.error}`,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        
        if (!fullScreenMode) {
          setCurrentResponse(errorMessage)
          setShowResponseModal(true)
        }
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, une erreur s'est produite lors de la communication avec le serveur.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      if (!fullScreenMode) {
        setCurrentResponse(errorMessage)
        setShowResponseModal(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const closeResponseModal = () => {
    setShowResponseModal(false)
    setCurrentResponse(null)
  }

  if (fullScreenMode) {
    // Mode plein écran avec historique des messages
    return (
      <div className="flex flex-col h-full">
        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-2">Assistant Intelligent Triptik</h3>
                <p className="text-sm">Posez-moi vos questions sur la santé, l'emploi, le logement, et bien plus encore. Je consulte des sources officielles pour vous donner des réponses précises.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <div className={`p-3 rounded-lg ${
                    message.isUser 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Métadonnées pour les réponses de l'assistant */}
                    {!message.isUser && message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                        <div className="text-xs font-medium text-gray-600">Sources :</div>
                        {message.sources.slice(0, 2).map((source, index) => (
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
                  
                  {/* Timestamp */}
                  <div className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
                         ))
           )}
           
           {/* Indicateur de frappe quand l'IA répond */}
           {isLoading && (
             <div className="flex justify-start">
               <div className="max-w-[80%]">
                 <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
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
             </div>
           )}
           
           {/* Élément invisible pour le scroll automatique */}
           <div ref={messagesEndRef} />
         </div>

         {/* Chat Input fixe en bas */}
        <div className="border-t bg-white p-4">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder={isLoading ? "Réflexion en cours..." : "Continuez la conversation..."}
            className="relative"
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chat Input fixe en bas */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? "Réflexion en cours..." : "Posez votre question à l'assistant intelligent"}
      />

      {/* Modal de réponse */}
      {showResponseModal && currentResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>Assistant Intelligent</span>
                  <Badge variant="secondary" className="text-xs">
                    LLM + MCP
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeResponseModal}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Réponse principale */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm whitespace-pre-wrap">{currentResponse.content}</div>
              </div>

              {/* Métadonnées */}
              {currentResponse.metadata && (
                <div className="space-y-2">
                  {currentResponse.metadata.tool_calls_made > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{currentResponse.metadata.tool_calls_made} recherches effectuées</span>
                    </div>
                  )}
                  
                  {currentResponse.metadata.functions_used && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Brain className="w-4 h-4" />
                      <span>Outils utilisés: {currentResponse.metadata.functions_used.join(', ')}</span>
                    </div>
                  )}
                  
                  {currentResponse.metadata.total_tokens && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{currentResponse.metadata.total_tokens} tokens utilisés</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sources */}
              {currentResponse.sources && currentResponse.sources.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Sources consultées :</div>
                  <div className="space-y-1">
                    {currentResponse.sources.slice(0, 5).map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline p-2 bg-gray-50 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{source}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeResponseModal}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
} 