"use client"

import { Mic, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ChatInputProps {
  placeholder?: string
  onSendMessage?: (message: string) => void
  onMessageSent?: () => void
  className?: string
}

export default function ChatInput({ 
  placeholder = "Poser une question",
  onSendMessage,
  onMessageSent,
  className = ""
}: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage("")
      setTimeout(() => {
        onMessageSent?.()
      }, 100)
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
              placeholder={placeholder}
              className="w-full py-6 px-6 pr-24 text-base border-0 rounded-full bg-[#f5f5f5] text-[#414143] placeholder:text-[#a3a3a3] min-h-[60px]"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <Mic className="w-5 h-5 text-[#a3a3a3]" />
              </Button>
              <Button 
                onClick={handleSend}
                size="icon" 
                className="rounded-full bg-[#2361f3] hover:bg-blue-600 w-10 h-10"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 