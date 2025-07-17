"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Calendar,
  Hash
} from "lucide-react"
import { useChat, type Conversation } from '@/contexts/ChatContext'

interface ChatHistoryPanelProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

export default function ChatHistoryPanel({ 
  isOpen = true, 
  onClose,
  className = "" 
}: ChatHistoryPanelProps) {
  const { 
    state, 
    loadConversations, 
    selectConversation, 
    createNewConversation,
    deleteConversation 
  } = useChat()

  const { 
    conversations, 
    currentConversation, 
    isLoadingConversations,
    userNumero,
    userType 
  } = state

  // Charger les conversations au montage du composant
  React.useEffect(() => {
    if (userNumero && userType) {
      loadConversations()
    }
  }, [userNumero, userType, loadConversations])

  const handleNewConversation = async () => {
    const conversationId = await createNewConversation()
    if (conversationId) {
      selectConversation(conversationId)
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId)
  }

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      await deleteConversation(conversationId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return 'Aujourd\'hui'
    } else if (diffInDays === 1) {
      return 'Hier'
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      })
    }
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (!isOpen) return null

  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Conversations
          </h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      {/* Liste des conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoadingConversations ? (
            // Skeleton de chargement
            [...Array(5)].map((_, i) => (
              <Card key={i} className="p-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </Card>
            ))
          ) : conversations.length === 0 ? (
            // État vide
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">
                Aucune conversation pour le moment
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Cliquez sur "Nouvelle conversation" pour commencer
              </p>
            </div>
          ) : (
            // Liste des conversations
            conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  currentConversation === conversation.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white'
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <CardContent className="p-0">
                  {/* Titre et thème */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-900 leading-tight">
                      {truncateText(conversation.title)}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Thème */}
                  {conversation.theme && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      {conversation.theme}
                    </Badge>
                  )}

                  {/* Dernier message */}
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                      <span className={
                        conversation.lastMessage.role === 'user' 
                          ? 'text-blue-600' 
                          : 'text-green-600'
                      }>
                        {conversation.lastMessage.role === 'user' ? 'Vous: ' : 'Assistant: '}
                      </span>
                      {truncateText(conversation.lastMessage.content, 60)}
                    </p>
                  )}

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(conversation.updated_at)}
                    </div>
                    <div className="flex items-center">
                      <Hash className="w-3 h-3 mr-1" />
                      {conversation.messageCount} message{conversation.messageCount > 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer avec info utilisateur */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>Connecté en tant que:</span>
            <Badge variant="outline" className="text-xs">
              {userType === 'accompagne' ? 'Accompagné' : 'Accompagnant'}
            </Badge>
          </div>
          {userNumero && (
            <div className="mt-1 font-mono text-gray-500">
              ID: {userNumero}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 