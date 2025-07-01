"use client"

import { Mic, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ChatInputProps {
  placeholder?: string
  onSendMessage?: (message: string) => void | Promise<void>
  onMessageSent?: () => void
  className?: string
  disabled?: boolean
}

export default function ChatInput({ 
  placeholder = "Poser une question",
  onSendMessage,
  onMessageSent,
  className = "",
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (message.trim() && onSendMessage && !isLoading) {
      setIsLoading(true)
      try {
        await onSendMessage(message.trim())
      setMessage("")
      setTimeout(() => {
        onMessageSent?.()
      }, 100)
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white z-40 ${className}`}>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl p-6">
          <div className="relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "Traitement en cours..." : placeholder}
              disabled={disabled || isLoading}
              className="w-full py-6 px-6 pr-24 text-base border-0 rounded-full bg-[#f5f5f5] text-[#414143] placeholder:text-[#a3a3a3] min-h-[60px] disabled:opacity-70 disabled:cursor-not-allowed"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <Mic className="w-5 h-5 text-[#a3a3a3]" />
              </Button>
              <Button 
                onClick={handleSend}
                disabled={disabled || isLoading || !message.trim()}
                size="icon" 
                className="rounded-full bg-[#2361f3] hover:bg-blue-600 w-10 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                <Send className="w-4 h-4 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 