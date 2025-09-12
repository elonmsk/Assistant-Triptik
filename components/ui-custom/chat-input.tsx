"use client"

import { Mic, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useChat } from '@/contexts/ChatContext'

interface ChatInputProps {
  placeholder?: string
  theme?: string // Thème de la conversation (ex: "Santé", "Emploi", etc.)
  onSendMessage?: (message: string) => void
  onMessageSent?: () => void
  className?: string
}

export default function ChatInput({ 
  placeholder = "Poser une question",
  theme,
  onSendMessage,
  onMessageSent,
  className = ""
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const { state, sendMessage } = useChat()
  const { isSendingMessage, error } = state

  const handleSend = async () => {
    if (message.trim()) {
      const messageToSend = message.trim()
      setMessage("")
      
      let handled = false;
      if (onSendMessage) {
        handled = onSendMessage(messageToSend)
      }
      
      if (handled) return;
      
      // Envoyer le message via le contexte du chat
      try {
        await sendMessage(messageToSend, theme)
        onMessageSent?.()
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error)
        // Remettre le message dans l'input en cas d'erreur
        setMessage(messageToSend)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isDisabled = isSendingMessage || !message.trim()

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white z-40 ${className}`}>
      {/* Affichage d'erreur si nécessaire */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-2">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        <div className="w-full max-w-2xl p-6">
          <div className="relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isSendingMessage ? "L'assistant écrit..." : placeholder}
              disabled={isSendingMessage}
              className="w-full py-6 px-6 pr-24 text-base border-0 rounded-full bg-[#f5f5f5] text-[#414143] placeholder:text-[#a3a3a3] min-h-[60px] disabled:opacity-70"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full w-10 h-10"
                disabled={isSendingMessage}
              >
                <Mic className="w-5 h-5 text-[#a3a3a3]" />
              </Button>
              <Button 
                onClick={handleSend}
                size="icon" 
                disabled={isDisabled}
                className="rounded-full bg-[#2361f3] hover:bg-blue-600 w-10 h-10 disabled:opacity-50"
              >
                {isSendingMessage ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Indication du thème si présent */}
          {theme && (
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                💬 Conversation sur: {theme}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 