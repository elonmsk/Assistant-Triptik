"use client"

import { useState, useEffect } from "react"
import { Send, Loader2, ExternalLink, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  sources?: string[]
  confidence?: number
  cached?: boolean
  category?: string
}

interface HealthChatProps {
  userContext?: {
    country?: string
    age?: number
    status?: string
  }
}

export default function HealthChat({ userContext }: HealthChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Bonjour ! Je suis votre assistant spécialisé en questions de santé. Je peux vous aider avec vos démarches concernant l'assurance maladie, la carte vitale, les remboursements, et bien plus. Posez-moi votre question !",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Charger les suggestions au montage
  useEffect(() => {
    loadSuggestions()
  }, [userContext])

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '',
          action: 'suggestions',
          userContext
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setSuggestions(result.data.suggestions)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error)
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

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message.trim(),
          action: 'query',
          userContext
        })
      })

      const result = await response.json()

      if (result.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.data.answer,
          isUser: false,
          timestamp: new Date(),
          sources: result.data.sources,
          confidence: result.data.confidence,
          cached: result.data.cached,
          category: result.data.category
        }

        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(result.error)
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
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

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            🏥 Assistant Santé Ameli
            <Badge variant="secondary" className="text-xs">
              Powered by MCP + Bright Data
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
              <Card className={`${
                message.isUser 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-50'
              }`}>
                <CardContent className="p-3">
                  <div className="text-sm">{message.content}</div>
                  
                  {/* Métadonnées pour les réponses de l'assistant */}
                  {!message.isUser && (message.sources || message.confidence || message.cached) && (
                    <div className="mt-3 pt-2 border-t border-gray-200 space-y-2">
                      
                      {/* Confiance */}
                      {message.confidence && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3" />
                          Confiance: {Math.round(message.confidence * 100)}%
                        </div>
                      )}

                      {/* Cache */}
                      {message.cached && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Clock className="w-3 h-3" />
                          Réponse mise en cache
                        </div>
                      )}

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-700">Sources:</div>
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
              
              <div className={`text-xs text-gray-500 mt-1 ${
                message.isUser ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Recherche sur ameli.fr...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && messages.length === 1 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Questions suggérées:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => useSuggestion(suggestion)}
                className="text-left h-auto p-2 justify-start whitespace-normal"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question sur la santé..."
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
        </CardContent>
      </Card>

      {/* Avertissement */}
      <Alert className="mt-2">
        <AlertDescription className="text-xs">
          ⚠️ Les informations fournies sont basées sur les données d'ameli.fr et ne remplacent pas un conseil médical professionnel.
        </AlertDescription>
      </Alert>
    </div>
  )
} 