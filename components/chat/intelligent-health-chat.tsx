"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2, ExternalLink, Bot, User, Brain, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  sources?: string[]
  metadata?: {
    tool_calls_made?: number
    functions_used?: string[]
    total_tokens?: number
  }
  loading?: boolean
}

interface IntelligentHealthChatProps {
  userProfile?: {
    country?: string
    age?: number
    status?: string
    language?: string
  }
  onSessionUpdate?: (sessionId: string) => void
}

export default function IntelligentHealthChat({ 
  userProfile, 
  onSessionUpdate 
}: IntelligentHealthChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialiser la conversation
  useEffect(() => {
    initializeConversation()
    loadSystemStatus()
  }, [userProfile])

  const initializeConversation = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'new_conversation',
          userProfile
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setSessionId(result.data.sessionId)
        onSessionUpdate?.(result.data.sessionId)
        
        // Message d'accueil
        setMessages([{
          id: '1',
          content: result.data.welcomeMessage,
          isUser: false,
          timestamp: new Date()
        }])
        
        // Charger les suggestions
        loadSuggestions()
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/chat?action=suggestions')
      const result = await response.json()
      if (result.success) {
        setSuggestions(result.data.suggestions)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error)
    }
  }

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/chat?action=health')
      const result = await response.json()
      if (result.success) {
        setSystemStatus(result.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du statut:', error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      isUser: true,
      timestamp: new Date()
    }

    // Ajouter le message utilisateur
    setMessages(prev => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    // Ajouter un indicateur de chargement pour l'IA
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "Je réfléchis et consulte ameli.fr pour vous...",
      isUser: false,
      timestamp: new Date(),
      loading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: message.trim(),
          sessionId,
          userProfile
        })
      })

      const result = await response.json()

      // Retirer le message de chargement
      setMessages(prev => prev.filter(m => !m.loading))

      if (result.success) {
        const botMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: result.data.response,
          isUser: false,
          timestamp: new Date(),
          sources: result.data.sources,
          metadata: result.data.metadata
        }

        setMessages(prev => [...prev, botMessage])
        
        // Mettre à jour sessionId si nécessaire
        if (result.data.sessionId && result.data.sessionId !== sessionId) {
          setSessionId(result.data.sessionId)
          onSessionUpdate?.(result.data.sessionId)
        }
      } else {
        throw new Error(result.error)
      }

    } catch (error) {
      // Retirer le message de chargement en cas d'erreur
      setMessages(prev => prev.filter(m => !m.loading))
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `Désolé, une erreur s'est produite : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(currentMessage)
    }
  }

  const useSuggestion = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const formatMetadata = (metadata?: any) => {
    if (!metadata) return null
    
    const items = []
    if (metadata.tool_calls_made) {
      items.push(`${metadata.tool_calls_made} outil(s) utilisé(s)`)
    }
    if (metadata.functions_used) {
      items.push(`Fonctions: ${metadata.functions_used.join(', ')}`)
    }
    if (metadata.total_tokens) {
      items.push(`${metadata.total_tokens} tokens`)
    }
    
    return items.length > 0 ? items.join(' • ') : null
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header avec statut système */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <span className="text-lg">Assistant Santé IA</span>
              <Badge variant="secondary" className="text-xs">
                {systemStatus?.llm_provider?.toUpperCase()} + MCP + Bright Data
              </Badge>
            </div>
            
            {systemStatus && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{systemStatus.llm_model}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {systemStatus.active_conversations} conversations
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Zone de messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    }`}>
                      {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1">
                      <Card className={`${
                        message.isUser 
                          ? 'bg-blue-50 border-blue-200' 
                          : message.loading
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <CardContent className="p-4">
                          {message.loading ? (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">{message.content}</span>
                            </div>
                          ) : (
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          )}
                          
                          {/* Métadonnées pour les réponses de l'assistant */}
                          {!message.isUser && !message.loading && (message.sources || message.metadata) && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                              
                              {/* Métadonnées IA */}
                              {message.metadata && (
                                <div className="flex items-center gap-1 text-xs text-purple-600">
                                  <Zap className="w-3 h-3" />
                                  <span>{formatMetadata(message.metadata)}</span>
                                </div>
                              )}

                              {/* Sources */}
                              {message.sources && message.sources.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-gray-700">Sources officielles:</div>
                                  {message.sources.slice(0, 3).map((source, index) => (
                                    <a
                                      key={index}
                                      href={source}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      ameli.fr
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className={`text-xs text-gray-500 px-11 ${
                    message.isUser ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length === 1 && (
          <div className="p-4 border-t">
            <div className="text-sm font-medium text-gray-700 mb-3">💡 Questions suggérées :</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => useSuggestion(suggestion)}
                  className="text-left h-auto p-3 justify-start whitespace-normal text-xs hover:bg-blue-50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question de santé..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage(currentMessage)}
              disabled={isLoading || !currentMessage.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Avertissement */}
      <Alert className="mt-4">
        <AlertDescription className="text-xs">
          🤖 Assistant IA alimenté par des données officielles d'ameli.fr. 
          Les informations ne remplacent pas un conseil médical professionnel.
        </AlertDescription>
      </Alert>
    </div>
  )
} 