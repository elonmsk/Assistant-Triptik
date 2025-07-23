"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import ProcessingIndicator from './ProcessingIndicator'

type ProcessingStep = 'idle' | 'analyzing' | 'searching' | 'scraping' | 'processing' | 'generating' | 'complete'

// Exemples de requêtes avec leurs étapes spécifiques
const exampleQueries = [
  {
    name: "Carte Vitale",
    query: "comment obtenir une carte vitale ?",
    searchSteps: [
      'Recherche: "comment obtenir une carte vitale ?" ameli.fr',
      'Recherche: "comment obtenir une carte vitale ?" service-public.fr',
      'Recherche: "comment obtenir une carte vitale ?" CPAM',
      'Recherche: "comment obtenir une carte vitale ?" assurance maladie'
    ],
    scrapingSteps: [
      'Extraction: ameli.fr',
      'Extraction: service-public.fr',
      'Extraction: gouvernement.fr',
      'Extraction: legifrance.gouv.fr'
    ]
  },
  {
    name: "Logement",
    query: "comment trouver un logement social ?",
    searchSteps: [
      'Recherche: "comment trouver un logement social ?" service-public.fr',
      'Recherche: "comment trouver un logement social ?" CAF',
      'Recherche: "comment trouver un logement social ?" APL',
      'Recherche: "comment trouver un logement social ?" logement social'
    ],
    scrapingSteps: [
      'Extraction: service-public.fr',
      'Extraction: caf.fr',
      'Extraction: gouvernement.fr',
      'Extraction: anil.org'
    ]
  },
  {
    name: "Emploi",
    query: "comment chercher un emploi en France ?",
    searchSteps: [
      'Recherche: "comment chercher un emploi en France ?" pole-emploi.fr',
      'Recherche: "comment chercher un emploi en France ?" service-public.fr',
      'Recherche: "comment chercher un emploi en France ?" droits sociaux',
      'Recherche: "comment chercher un emploi en France ?" contrat de travail'
    ],
    scrapingSteps: [
      'Extraction: pole-emploi.fr',
      'Extraction: service-public.fr',
      'Extraction: gouvernement.fr',
      'Extraction: urssaf.fr'
    ]
  }
]

const processingSteps = [
  'Analyse des résultats',
  'Filtrage des informations',
  'Organisation des données',
  'Validation des sources'
]

const generationSteps = [
  'Structuration de la réponse',
  'Rédaction du contenu',
  'Ajout des sources',
  'Finalisation'
]

export default function ProcessingIndicatorDemo() {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedExample, setSelectedExample] = useState(0)

  const startDemo = async (exampleIndex: number = 0) => {
    setIsRunning(true)
    setCurrentStep('idle')
    setMessage('')
    setProgress(0)
    setSelectedExample(exampleIndex)

    const example = exampleQueries[exampleIndex]

    // Étape 1: Analyse
    setCurrentStep('analyzing')
    setMessage('Analyse de votre question...')
    setProgress(15)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Étape 2: Recherche
    setCurrentStep('searching')
    for (let i = 0; i < example.searchSteps.length; i++) {
      setMessage(example.searchSteps[i])
      setProgress(30 + (i * 5))
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // Étape 3: Extraction
    setCurrentStep('scraping')
    for (let i = 0; i < example.scrapingSteps.length; i++) {
      setMessage(example.scrapingSteps[i])
      setProgress(50 + (i * 5))
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    // Étape 4: Traitement
    setCurrentStep('processing')
    for (let i = 0; i < processingSteps.length; i++) {
      setMessage(processingSteps[i])
      setProgress(70 + (i * 3))
      await new Promise(resolve => setTimeout(resolve, 400))
    }

    // Étape 5: Génération
    setCurrentStep('generating')
    for (let i = 0; i < generationSteps.length; i++) {
      setMessage(generationSteps[i])
      setProgress(85 + (i * 3))
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Terminé
    setCurrentStep('complete')
    setMessage('Réponse terminée')
    setProgress(100)

    // Réinitialiser après 3 secondes
    setTimeout(() => {
      setCurrentStep('idle')
      setMessage('')
      setProgress(0)
      setIsRunning(false)
    }, 3000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Démonstration - Indicateur de Progression</h2>
        <p className="text-gray-600 mb-6">
          Testez l'indicateur avec différents types de requêtes pour voir comment les recherches et extractions s'adaptent
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {exampleQueries.map((example, index) => (
            <Button 
              key={index}
              onClick={() => startDemo(index)}
              disabled={isRunning}
              variant={selectedExample === index ? "default" : "outline"}
              className="mb-2"
            >
              {example.name}
            </Button>
          ))}
        </div>
      </div>

      <ProcessingIndicator
        currentStep={currentStep}
        message={message}
        progress={progress}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">État actuel :</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Étape :</strong> {currentStep}</div>
            <div><strong>Message :</strong> {message || 'Aucun'}</div>
            <div><strong>Progression :</strong> {progress}%</div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Exemple sélectionné :</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Requête :</strong> {exampleQueries[selectedExample]?.name}</div>
            <div><strong>Question :</strong> {exampleQueries[selectedExample]?.query}</div>
            <div><strong>Recherches :</strong> {exampleQueries[selectedExample]?.searchSteps.length}</div>
            <div><strong>Sites :</strong> {exampleQueries[selectedExample]?.scrapingSteps.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Fonctionnalités démontrées :</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>Recherche adaptative :</strong> Les requêtes changent selon le contenu de la question</li>
          <li>• <strong>Sites ciblés :</strong> Les sites scrapés s'adaptent au sujet</li>
          <li>• <strong>Progression détaillée :</strong> Chaque étape montre des informations spécifiques</li>
          <li>• <strong>Messages informatifs :</strong> L'utilisateur voit exactement ce qui se passe</li>
        </ul>
      </div>
    </div>
  )
} 