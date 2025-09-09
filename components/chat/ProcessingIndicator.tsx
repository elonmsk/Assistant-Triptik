"use client"
import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Globe,
  FileText,
  Brain,
  CheckCircle,
  Loader2,
  Sparkles
} from 'lucide-react'

interface ProcessingIndicatorProps {
  currentStep: 'idle' | 'analyzing' | 'searching' | 'scraping' | 'processing' | 'generating' | 'complete'
  message: string
  progress: number
  className?: string
  category?: string
  compact?: boolean
  chatMode?: boolean
}

const stepConfig = {
  idle: {
    icon: Sparkles,
    label: 'Prêt',
    color: 'bg-gray-500',
    textColor: 'text-gray-600'
  },
  analyzing: {
    icon: Brain,
    label: 'Analyse',
    color: 'bg-blue-500',
    textColor: 'text-blue-600'
  },
  searching: {
    icon: Search,
    label: 'Recherche',
    color: 'bg-green-500',
    textColor: 'text-green-600'
  },
  scraping: {
    icon: Globe,
    label: 'Extraction',
    color: 'bg-purple-500',
    textColor: 'text-purple-600'
  },
  processing: {
    icon: FileText,
    label: 'Traitement',
    color: 'bg-orange-500',
    textColor: 'text-orange-600'
  },
  generating: {
    icon: Brain,
    label: 'Génération',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600'
  },
  complete: {
    icon: CheckCircle,
    label: 'Terminé',
    color: 'bg-green-500',
    textColor: 'text-green-600'
  }
}

export default function ProcessingIndicator({
  currentStep,
  message,
  progress,
  className = "",
  category,
  compact = false,
  chatMode = false
}: ProcessingIndicatorProps) {
  if (currentStep === 'idle') {
    return null
  }

  const config = stepConfig[currentStep]
  const IconComponent = config.icon

  // Mode chat qui remplace complètement la bulle
  if (chatMode) {
    return (
      <div className={`bg-gray-100 text-gray-800 p-3 sm:p-4 rounded-2xl rounded-tl-none w-auto max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] ${className}`}>
        <div className="space-y-2 sm:space-y-3">
          {/* En-tête avec icône et badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-full ${config.color} bg-opacity-10`}>
              <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${config.textColor}`} />
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Badge variant="outline" className={`text-xs sm:text-sm ${config.textColor}`}>
                {config.label}
              </Badge>
              {category && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {category}
                </Badge>
              )}
              {currentStep !== 'complete' && (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          {/* Message */}
          <p className="text-xs sm:text-sm text-gray-600 break-words leading-relaxed">{message}</p>

          {/* Barre de progression */}
          <div className="space-y-1 sm:space-y-2">
            <Progress value={progress} className="h-1.5 sm:h-2" />
            <div className="flex justify-between text-xs sm:text-sm text-gray-500">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Étapes en bas */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200 gap-1 sm:gap-2">
            {Object.entries(stepConfig).map(([step, stepConfig]) => {
              if (step === 'idle') return null

              const StepIcon = stepConfig.icon
              const isActive = currentStep === step
              const isCompleted = getStepOrder(currentStep) > getStepOrder(step)

              return (
                <div key={step} className="flex flex-col items-center gap-0.5 sm:gap-1 flex-1">
                  <div className={`
                    p-1 sm:p-1.5 rounded-full text-xs
                    ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                    ${isActive ? 'bg-blue-100 text-blue-600' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
                  `}>
                    <StepIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className={`text-[10px] sm:text-xs text-center ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {stepConfig.label}
                  </span>
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      </div>
    )
  }

  // Mode compact pour l'intégration dans les bulles de chat
  if (compact) {
    return (
      <div className={`space-y-2 sm:space-y-3 ${className}`}>
        {/* En-tête compact */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className={`p-1 sm:p-1.5 rounded-full ${config.color} bg-opacity-10`}>
            <IconComponent className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${config.textColor}`} />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" className={`text-[10px] sm:text-xs ${config.textColor}`}>
              {config.label}
            </Badge>
            {category && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                {category}
              </Badge>
            )}
            {currentStep !== 'complete' && (
              <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin text-gray-400" />
            )}
          </div>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-gray-600 break-words">{message}</p>

        {/* Barre de progression compacte */}
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Étapes compactes */}
        <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-100 gap-0.5 sm:gap-1">
          {Object.entries(stepConfig).map(([step, stepConfig]) => {
            if (step === 'idle') return null

            const StepIcon = stepConfig.icon
            const isActive = currentStep === step
            const isCompleted = getStepOrder(currentStep) > getStepOrder(step)

            return (
              <div key={step} className="flex flex-col items-center gap-0.5 sm:gap-1 flex-1">
                <div className={`
                  p-1 rounded-full text-xs
                  ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                  ${isActive ? 'bg-blue-100 text-blue-600' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
                `}>
                  <StepIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                </div>
              </div>
            )
          }).filter(Boolean)}
        </div>
      </div>
    )
  }

  // Mode normal (complet)
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2 rounded-full ${config.color} bg-opacity-10`}>
          <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${config.textColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Badge variant="outline" className={`text-xs sm:text-sm ${config.textColor}`}>
              {config.label}
            </Badge>
            {category && (
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {category}
              </Badge>
            )}
            {currentStep !== 'complete' && (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-400" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 break-words">{message}</p>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2">
        <Progress value={progress} className="h-1.5 sm:h-2" />
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-500">
          <span>Progression</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Indicateur des étapes */}
      <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 gap-0.5 sm:gap-1">
        {Object.entries(stepConfig).map(([step, stepConfig]) => {
          if (step === 'idle') return null

          const StepIcon = stepConfig.icon
          const isActive = currentStep === step
          const isCompleted = getStepOrder(currentStep) > getStepOrder(step)

          return (
            <div key={step} className="flex flex-col items-center gap-0.5 sm:gap-1 flex-1">
              <div className={`
                p-1 sm:p-1.5 rounded-full text-xs
                ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                ${isActive ? 'bg-blue-100 text-blue-600' : ''}
                ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                <StepIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
              <span className={`text-[10px] sm:text-xs text-center ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {stepConfig.label}
              </span>
            </div>
          )
        }).filter(Boolean)}
      </div>
    </div>
  )
}

function getStepOrder(step: string): number {
  const order = {
    'idle': 0,
    'analyzing': 1,
    'searching': 2,
    'scraping': 3,
    'processing': 4,
    'generating': 5,
    'complete': 6
  }
  return order[step as keyof typeof order] || 0
}
