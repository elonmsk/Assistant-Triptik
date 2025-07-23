"use client"

import React, { createContext, useContext, useReducer, useCallback } from 'react'

// Types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Conversation {
  id: string
  theme: string
  title: string
  created_at: string
  updated_at: string
  lastMessage?: {
    content: string
    role: 'user' | 'assistant'
    created_at: string
  } | null
  messageCount: number
}

// Nouveau type pour les états de progression
type ProcessingStep = 
  | 'idle'
  | 'analyzing'
  | 'searching'
  | 'scraping'
  | 'processing'
  | 'generating'
  | 'complete'

interface ProcessingState {
  currentStep: ProcessingStep
  message: string
  progress: number // 0-100
  category?: string
}

interface ChatState {
  // État des conversations
  conversations: Conversation[]
  currentConversation: string | null
  currentMessages: Message[]
  
  // États de chargement
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  isSendingMessage: boolean
  
  // Nouvel état de progression
  processingState: ProcessingState
  
  // États d'erreur
  error: string | null
  
  // Informations utilisateur
  userNumero: string | null
  userType: 'accompagne' | 'accompagnant' | null
}

// Actions
type ChatAction =
  | { type: 'SET_USER_INFO'; payload: { userNumero: string; userType: 'accompagne' | 'accompagnant' } }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
  | { type: 'SET_CURRENT_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING_CONVERSATIONS'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGES'; payload: boolean }
  | { type: 'SET_SENDING_MESSAGE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'SET_PROCESSING_STATE'; payload: ProcessingState }
  | { type: 'UPDATE_PROCESSING_STEP'; payload: { step: ProcessingStep; message: string; progress: number; category?: string } }
  | { type: 'RESET_PROCESSING_STATE' }

// État initial
const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
  userNumero: null,
  userType: null,
  processingState: {
    currentStep: 'idle',
    message: '',
    progress: 0
  }
}

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_USER_INFO':
      return {
        ...state,
        userNumero: action.payload.userNumero,
        userType: action.payload.userType
      }
    
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
        isLoadingConversations: false
      }
    
    case 'SET_CURRENT_CONVERSATION':
      return {
        ...state,
        currentConversation: action.payload,
        currentMessages: action.payload ? state.currentMessages : []
      }
    
    case 'SET_CURRENT_MESSAGES':
      return {
        ...state,
        currentMessages: action.payload,
        isLoadingMessages: false
      }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        currentMessages: [...state.currentMessages, action.payload],
        isSendingMessage: false
      }
    
    case 'SET_LOADING_CONVERSATIONS':
      return {
        ...state,
        isLoadingConversations: action.payload
      }
    
    case 'SET_LOADING_MESSAGES':
      return {
        ...state,
        isLoadingMessages: action.payload
      }
    
    case 'SET_SENDING_MESSAGE':
      return {
        ...state,
        isSendingMessage: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoadingConversations: false,
        isLoadingMessages: false,
        isSendingMessage: false
      }
    
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations]
      }
    
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates }
            : conv
        )
      }
    
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        currentConversation: state.currentConversation === action.payload ? null : state.currentConversation,
        currentMessages: state.currentConversation === action.payload ? [] : state.currentMessages
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        currentMessages: state.currentMessages.map(msg =>
          msg.id === action.payload.id ? action.payload : msg
        )
      }
    
    case 'SET_PROCESSING_STATE':
      return {
        ...state,
        processingState: action.payload
      }
    
    case 'UPDATE_PROCESSING_STEP':
      return {
        ...state,
        processingState: {
          ...state.processingState,
          currentStep: action.payload.step,
          message: action.payload.message,
          progress: action.payload.progress,
          category: action.payload.category
        }
      }
    
    case 'RESET_PROCESSING_STATE':
      return {
        ...state,
        processingState: initialState.processingState
      }
    
    default:
      return state
  }
}

// Contexte
interface ChatContextType {
  state: ChatState
  
  // Actions utilisateur
  setUserInfo: (userNumero: string, userType: 'accompagne' | 'accompagnant') => void
  loadConversations: () => Promise<void>
  selectConversation: (conversationId: string | null) => Promise<void>
  sendMessage: (message: string, theme?: string) => Promise<void>
  createNewConversation: (theme?: string, title?: string) => Promise<string | null>
  deleteConversation: (conversationId: string) => Promise<void>
  clearError: () => void
  
  // Actions de progression
  setProcessingState: (state: ProcessingState) => void
  updateProcessingStep: (step: ProcessingStep, message: string, progress: number, category?: string) => void
  resetProcessingState: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  // Définir les informations utilisateur
  const setUserInfo = useCallback((userNumero: string, userType: 'accompagne' | 'accompagnant') => {
    dispatch({ type: 'SET_USER_INFO', payload: { userNumero, userType } })
  }, [])

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!state.userNumero || !state.userType) return

    dispatch({ type: 'SET_LOADING_CONVERSATIONS', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const response = await fetch(
        `/api/conversations?userNumero=${state.userNumero}&userType=${state.userType}`
      )

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des conversations')
      }

      const data = await response.json()
      dispatch({ type: 'SET_CONVERSATIONS', payload: data.conversations })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur inconnue' })
    }
  }, [state.userNumero, state.userType])

  // Sélectionner une conversation
  const selectConversation = useCallback(async (conversationId: string | null) => {
    dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversationId })

    if (!conversationId || !state.userNumero) {
      dispatch({ type: 'SET_CURRENT_MESSAGES', payload: [] })
      return
    }

    dispatch({ type: 'SET_LOADING_MESSAGES', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?userNumero=${state.userNumero}`
      )

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des messages')
      }

      const data = await response.json()
      dispatch({ type: 'SET_CURRENT_MESSAGES', payload: data.messages })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur inconnue' })
    }
  }, [state.userNumero])

  // Envoyer un message avec streaming
  const sendMessage = useCallback(async (message: string, theme?: string) => {
    if (!state.userNumero || !state.userType) {
      dispatch({ type: 'SET_ERROR', payload: 'Informations utilisateur manquantes' })
      return
    }

    dispatch({ type: 'SET_SENDING_MESSAGE', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    // Initialiser l'état de progression
    dispatch({ type: 'SET_PROCESSING_STATE', payload: {
      currentStep: 'analyzing',
      message: 'Analyse de votre question...',
      progress: 10
    }})

    // Ajouter immédiatement le message utilisateur
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId: state.currentConversation,
          userNumero: state.userNumero,
          userType: state.userType,
          theme
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      let assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "L'assistant Triptik est en train d'écrire...",
        created_at: new Date().toISOString()
      }
      
      // Ajouter le message assistant vide pour commencer le streaming
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'content') {
                  // Mettre à jour le message assistant avec le contenu streamé
                  assistantMessage = {
                    ...assistantMessage,
                    content: data.content
                  }
                  dispatch({ type: 'UPDATE_MESSAGE', payload: assistantMessage })
                } else if (data.type === 'processing_step') {
                  // Mettre à jour l'état de progression
                  dispatch({ type: 'UPDATE_PROCESSING_STEP', payload: {
                    step: data.step,
                    message: data.message,
                    progress: data.progress,
                    category: data.category
                  }})
                } else if (data.type === 'end') {
                  // Mettre à jour l'ID de conversation si nécessaire
      if (data.conversationId && !state.currentConversation) {
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: data.conversationId })
        await loadConversations()
                  }
                  
                  // Marquer comme terminé
                  dispatch({ type: 'UPDATE_PROCESSING_STEP', payload: {
                    step: 'complete',
                    message: 'Réponse terminée',
                    progress: 100
                  }})
                } else if (data.type === 'error') {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                console.error('Erreur parsing SSE:', parseError)
              }
            }
          }
        }
      }

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur inconnue' })
    } finally {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false })
      // Réinitialiser l'état de progression après un délai
      setTimeout(() => {
        dispatch({ type: 'RESET_PROCESSING_STATE' })
      }, 2000)
    }
  }, [state.userNumero, state.userType, state.currentConversation, loadConversations])

  // Créer une nouvelle conversation
  const createNewConversation = useCallback(async (theme?: string, title?: string): Promise<string | null> => {
    if (!state.userNumero || !state.userType) {
      dispatch({ type: 'SET_ERROR', payload: 'Informations utilisateur manquantes' })
      return null
    }

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userNumero: state.userNumero,
          userType: state.userType,
          theme,
          title
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la conversation')
      }

      const data = await response.json()
      dispatch({ type: 'ADD_CONVERSATION', payload: data.conversation })
      return data.conversation.id

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur inconnue' })
      return null
    }
  }, [state.userNumero, state.userType])

  // Supprimer une conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!state.userNumero) {
      dispatch({ type: 'SET_ERROR', payload: 'Informations utilisateur manquantes' })
      return
    }

    try {
      const response = await fetch(
        `/api/conversations?conversationId=${conversationId}&userNumero=${state.userNumero}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la conversation')
      }

      dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId })

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erreur inconnue' })
    }
  }, [state.userNumero])

  // Effacer l'erreur
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  const contextValue: ChatContextType = {
    state,
    setUserInfo,
    loadConversations,
    selectConversation,
    sendMessage,
    createNewConversation,
    deleteConversation,
    clearError,
    setProcessingState: (state: ProcessingState) => dispatch({ type: 'SET_PROCESSING_STATE', payload: state }),
    updateProcessingStep: (step: ProcessingStep, message: string, progress: number, category?: string) => dispatch({ type: 'UPDATE_PROCESSING_STEP', payload: { step, message, progress, category } }),
    resetProcessingState: () => dispatch({ type: 'RESET_PROCESSING_STATE' })
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook personnalisé
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat doit être utilisé dans un ChatProvider')
  }
  return context
}

// Export des types pour utilisation dans d'autres composants
export type { Message, Conversation, ChatState } 