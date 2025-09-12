"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { FeedbackModal } from './FeedbackModal'

export type RatingType = 'like' | 'dislike' | null

interface MessageRatingProps {
  messageId: string
  currentRating?: RatingType
  onRatingChange: (messageId: string, rating: RatingType) => void
  onFeedbackSubmit: (messageId: string, feedback: string) => void
  className?: string
}

export function MessageRating({ 
  messageId, 
  currentRating, 
  onRatingChange, 
  onFeedbackSubmit,
  className 
}: MessageRatingProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  const handleLike = () => {
    const newRating = currentRating === 'like' ? null : 'like'
    onRatingChange(messageId, newRating)
    // Ouvrir la modal de feedback pour les likes
    if (newRating === 'like') {
      setShowFeedbackModal(true)
    }
  }

  const handleDislike = () => {
    const newRating = currentRating === 'dislike' ? null : 'dislike'
    onRatingChange(messageId, newRating)
    // Ouvrir la modal de feedback pour les dislikes
    if (newRating === 'dislike') {
      setShowFeedbackModal(true)
    }
  }

  const handleFeedbackSubmit = (messageId: string, feedback: string) => {
    onFeedbackSubmit(messageId, feedback)
    setShowFeedbackModal(false)
  }

  return (
    <>
      <div className={cn("flex items-center gap-1 mt-2", className)}>
        {/* Bouton Like */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "h-8 px-2 text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors",
            currentRating === 'like' && "text-green-600 bg-green-50"
          )}
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>

        {/* Bouton Dislike */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDislike}
          className={cn(
            "h-8 px-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors",
            currentRating === 'dislike' && "text-red-600 bg-red-50"
          )}
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Modal de feedback */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        messageId={messageId}
        currentRating={currentRating}
      />
    </>
  )
}
