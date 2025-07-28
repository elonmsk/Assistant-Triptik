"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { History, X } from "lucide-react"
import { useChat } from '@/contexts/ChatContext'
import MessageList from './MessageList'
import { TypingIndicator } from './MessageList'
import ChatHistoryPanel from './ChatHistoryPanel'
import ChatInput from '@/components/ui-custom/chat-input'
import ProcessingIndicator from './ProcessingIndicator'
import { VersionBadge } from '@/components/ui/version-badge'

interface ChatInterfaceProps {
  userNumero: string
  userType: 'accompagne' | 'accompagnant'
  theme?: string // Thème de la conversation
  showHistoryPanel?: boolean
  className?: string
}

export default function ChatInterface({
  userNumero,
  userType,
  theme,
  showHistoryPanel = true,
  className = ""
}: ChatInterfaceProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(showHistoryPanel)
  const { state, setUserInfo, clearError } = useChat()

  const {
    currentMessages,
    isLoadingMessages,
    isSendingMessage,
    error,
    userNumero: contextUserNumero,
    processingState
  } = state

  // Initialiser les informations utilisateur si nécessaires
  useEffect(() => {
    if (userNumero && userType && userNumero !== contextUserNumero) {
      setUserInfo(userNumero, userType)
    }
  }, [userNumero, userType, contextUserNumero, setUserInfo])

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* Panneau d'historique */}
      {isHistoryOpen && (
        <ChatHistoryPanel 
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* Zone principale de chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHistoryOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                Historique
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Assistant Triptik
              </h1>
              <p className="text-sm text-gray-600">
                {userType === 'accompagne' ? 'Espace Accompagné' : 'Espace Accompagnant'}
                {theme && ` • ${theme}`}
              </p>
            </div>
          </div>

          {/* Indicateur de statut et version */}
          <div className="flex items-center gap-3">
            {isSendingMessage && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                Assistant en train d'écrire...
              </div>
            )}
            <VersionBadge variant="header" />
          </div>
        </div>

        {/* Alerte d'erreur */}
        {error && (
          <Alert className="m-4 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Alert>
        )}

        {/* Zone des messages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <MessageList 
            messages={currentMessages}
            isLoading={isLoadingMessages}
            className="flex-1 overflow-y-auto"
          />
          
          {/* Indicateur de progression - seulement si pas de messages */}
          {processingState.currentStep !== 'idle' && currentMessages.length === 0 && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <ProcessingIndicator
                currentStep={processingState.currentStep}
                message={processingState.message}
                progress={processingState.progress}
                category={processingState.category}
              />
            </div>
          )}
          
          {/* Indicateur de frappe */}
          {isSendingMessage && !processingState.currentStep || processingState.currentStep === 'idle' ? (
            <div className="p-4">
              <TypingIndicator />
            </div>
          ) : null}
        </div>

        {/* Zone d'input */}
        <div className="relative">
          <ChatInput 
            theme={theme}
            placeholder={`Posez votre question${theme ? ` sur ${theme}` : ''}...`}
            className="relative"
          />
        </div>
      </div>
    </div>
  )
}

// Composant wrapper qui inclut le provider de contexte
interface ChatInterfaceWithProviderProps extends ChatInterfaceProps {}

export function ChatInterfaceWithProvider(props: ChatInterfaceWithProviderProps) {
  return (
    <div className="h-screen">
      <ChatInterface {...props} />
    </div>
  )
} 