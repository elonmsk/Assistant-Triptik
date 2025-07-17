// Composants de chat
export { default as ChatInterface, ChatInterfaceWithProvider } from './ChatInterface'
export { default as MessageList, TypingIndicator } from './MessageList'
export { default as ChatHistoryPanel } from './ChatHistoryPanel'

// Contexte et hooks
export { ChatProvider, useChat } from '../../contexts/ChatContext'
export type { Message, Conversation, ChatState } from '../../contexts/ChatContext' 