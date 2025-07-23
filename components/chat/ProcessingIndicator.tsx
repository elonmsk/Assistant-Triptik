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
  category
}: ProcessingIndicatorProps) {
  if (currentStep === 'idle') {
    return null
  }

  const config = stepConfig[currentStep]
  const IconComponent = config.icon

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full ${config.color} bg-opacity-10`}>
          <IconComponent className={`w-4 h-4 ${config.textColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={config.textColor}>
              {config.label}
            </Badge>
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
            {currentStep !== 'complete' && (
              <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 break-words">{message}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progression</span>
          <span>{progress}%</span>
        </div>
      </div>
      
      {/* Indicateur des étapes */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        {Object.entries(stepConfig).map(([step, stepConfig]) => {
          if (step === 'idle') return null
          
          const StepIcon = stepConfig.icon
          const isActive = currentStep === step
          const isCompleted = getStepOrder(currentStep) > getStepOrder(step)
          
          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <div className={`
                p-1.5 rounded-full text-xs
                ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                ${isActive ? 'bg-blue-100 text-blue-600' : ''}
                ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                <StepIcon className="w-3 h-3" />
              </div>
              <span className={`text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
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