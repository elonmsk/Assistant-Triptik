"use client"

import { useEffect, useRef } from 'react'
import { useChat } from '@/contexts/ChatContext'
import ReactMarkdown from 'react-markdown';

interface SimpleChatDisplayProps {
  className?: string
}

export default function SimpleChatDisplay({ className = "" }: SimpleChatDisplayProps) {
  const { state } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.currentMessages])

  if (state.currentMessages.length === 0) {
    return null // Ne rien afficher s'il n'y a pas de messages
  }

  const renderMessages = () => {
    const messages = []

    for (let i = 0; i < state.currentMessages.length; i++) {
      const message = state.currentMessages[i]

      if (message.role === 'user') {
        // Message utilisateur - bulle bleue alignée à droite
        messages.push(
          <div key={`user-${i}`} className="mb-4 flex justify-end">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="bg-[#2361f3] text-white p-3 rounded-2xl rounded-tr-md">
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
            </div>
          </div>
        )
      } else {
        // Message assistant - bulle grise alignée à gauche
        messages.push(
          <div key={`assistant-${i}`} className="mb-4 flex justify-start">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-md">
                {message.content === "L'assistant Triptik est en train d'écrire..." ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600 italic">L'assistant Triptik est en train d'écrire</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-bold my-1" {...props} />,
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed my-1" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    }

    return messages
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {renderMessages()}
      <div ref={messagesEndRef} />
    </div>
  )
} 