"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { RatingType } from './MessageRating'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (messageId: string, feedback: string) => void
  messageId: string
  currentRating?: RatingType
}

export function FeedbackModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  messageId, 
  currentRating 
}: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedback.trim()) {
      onSubmit(messageId, feedback.trim())
      setFeedback('')
    }
  }

  const handleClose = () => {
    setFeedback('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentRating === 'dislike' ? (
              <>
                <ThumbsDown className="w-5 h-5 text-red-600" />
                Que pouvons-nous améliorer ?
              </>
            ) : currentRating === 'like' ? (
              <>
                <ThumbsUp className="w-5 h-5 text-green-600" />
                Partagez votre avis
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Votre feedback
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {currentRating === 'dislike' 
              ? "Aidez-nous à améliorer nos réponses en nous expliquant ce qui ne vous a pas convenu."
              : currentRating === 'like'
              ? "Dites-nous ce qui vous a plu dans cette réponse pour nous aider à continuer dans cette direction."
              : "Partagez votre avis sur cette réponse pour nous aider à nous améliorer."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">
              {currentRating === 'dislike' 
                ? "Que pouvons-nous améliorer ?"
                : "Votre commentaire"
              }
            </Label>
            <Textarea
              id="feedback"
              placeholder={
                currentRating === 'dislike'
                  ? "Ex: La réponse n'était pas assez précise, manquait d'informations sur..."
                  : currentRating === 'like'
                  ? "Ex: Très utile, informations claires et bien structurées..."
                  : "Ex: La réponse était correcte mais pourrait être plus détaillée..."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {feedback.length}/500 caractères
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!feedback.trim()}
            >
              Envoyer le feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
