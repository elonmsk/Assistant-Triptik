"use client"

import React, { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useChat, type Message } from '@/contexts/ChatContext'
import ProcessingIndicator from './ProcessingIndicator'

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  className?: string
}

export default function MessageList({ messages, isLoading = false, className = "" }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 p-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full text-center p-8 ${className}`}>
        <div className="max-w-md">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Commencez une nouvelle conversation
          </h3>
          <p className="text-gray-600">
            Posez une question pour commencer à discuter avec votre assistant.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col space-y-4 p-4 ${className}`}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className={
              message.role === 'user' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-green-100 text-green-600'
            }>
              {message.role === 'user' ? '👤' : '🤖'}
            </AvatarFallback>
          </Avatar>

          {/* Message */}
          <div className={`flex flex-col max-w-[90%] ${
            message.role === 'user' ? 'items-end' : 'items-start'
          }`}>
            <Card className={`p-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-200'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </Card>
            
            {/* Timestamp */}
            <span className="text-xs text-gray-500 mt-1 px-1">
              {formatTime(message.created_at)}
            </span>
          </div>
        </div>
      ))}
      
      {/* Élément invisible pour l'auto-scroll */}
      <div ref={messagesEndRef} />
    </div>
  )
}

// Composant pour l'indicateur de frappe
export function TypingIndicator() {
  const { state } = useChat()
  const { processingState } = state

  // Si on a un état de progression actif, utiliser le ProcessingIndicator
  if (processingState.currentStep !== 'idle') {
    return (
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-green-100 text-green-600">
            🤖
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <ProcessingIndicator
            currentStep={processingState.currentStep}
            message={processingState.message}
            progress={processingState.progress}
            category={processingState.category}
            chatMode={true}
          />
        </div>
      </div>
    )
  }

  // Fallback vers l'ancien indicateur si pas d'état de progression
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-green-100 text-green-600">
          🤖
        </AvatarFallback>
      </Avatar>
      
      <Card className="p-3 bg-white border-gray-200">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">L'assistant écrit...</span>
        </div>
      </Card>
    </div>
  )
} 