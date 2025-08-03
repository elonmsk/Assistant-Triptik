"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getQualificationData, formatQualificationForPrompt, getAllQualificationData, QualificationData } from '@/lib/utils'
import { useChat } from '@/contexts/ChatContext'

export default function TestProgressPage() {
  const [qualifications, setQualifications] = useState<QualificationData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [formattedPrompt, setFormattedPrompt] = useState<string>('')
  const { sendMessage } = useChat()

  useEffect(() => {
    // Charger toutes les qualifications
    const allQuals = getAllQualificationData('accompagne')
    setQualifications(allQuals)
  }, [])

  const handleTestQualification = (category: string) => {
    setSelectedCategory(category)
    const qualData = getQualificationData(category, 'accompagne')
    if (qualData) {
      const formatted = formatQualificationForPrompt(qualData, category)
      setFormattedPrompt(formatted)
    } else {
      setFormattedPrompt('Aucune donnée de qualification trouvée pour cette catégorie')
    }
  }

  const handleTestAccompagnant = (category: string) => {
    setSelectedCategory(category)
    const qualData = getQualificationData(category, 'accompagnant')
    if (qualData) {
      const formatted = formatQualificationForPrompt(qualData, category)
      setFormattedPrompt(formatted)
    } else {
      setFormattedPrompt('Aucune donnée de qualification trouvée pour cette catégorie')
    }
  }

  const handleTestMessage = async (category: string) => {
    try {
      await sendMessage(`Test de message avec qualification pour ${category}`, category)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message de test:', error)
    }
  }

  const clearAllQualifications = () => {
    // Supprimer toutes les qualifications du localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('qualification_')) {
        localStorage.removeItem(key)
      }
    }
    setQualifications([])
    setFormattedPrompt('')
  }

  const createTestQualification = () => {
    // Créer une qualification de test
    const testQualification = {
      category: 'Santé',
      answers: ['yes', 'carte_sejour', 'male', '25', 'b1', 'french', 'Paris', '75', 'no', '0', 'yes'],
      timestamp: Date.now(),
      userType: 'accompagne' as const
    }
    
    localStorage.setItem('qualification_Santé', JSON.stringify(testQualification))
    setQualifications([testQualification])
    setSelectedCategory('Santé')
    setFormattedPrompt(formatQualificationForPrompt(testQualification, 'Santé'))
  }

  const createTestQualificationSansDocuments = () => {
    // Créer une qualification de test pour quelqu'un sans documents
    const testQualification = {
      category: 'Santé',
      answers: ['no', 'aucun', 'female', '30', 'a2', 'arabic', 'Lyon', '69', 'no', '2', 'no'],
      timestamp: Date.now(),
      userType: 'accompagne' as const
    }
    
    localStorage.setItem('qualification_Santé', JSON.stringify(testQualification))
    setQualifications([testQualification])
    setSelectedCategory('Santé')
    setFormattedPrompt(formatQualificationForPrompt(testQualification, 'Santé'))
  }

  const createTestQualificationDemandeAsile = () => {
    // Créer une qualification de test pour quelqu'un en demande d'asile
    const testQualification = {
      category: 'Santé',
      answers: ['no', 'ada', 'male', '22', 'a1', 'english', 'Marseille', '13', 'no', '0', 'no'],
      timestamp: Date.now(),
      userType: 'accompagne' as const
    }
    
    localStorage.setItem('qualification_Santé', JSON.stringify(testQualification))
    setQualifications([testQualification])
    setSelectedCategory('Santé')
    setFormattedPrompt(formatQualificationForPrompt(testQualification, 'Santé'))
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test du Système de Qualification</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section des qualifications existantes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Qualifications existantes</h2>
            
            {qualifications.length === 0 ? (
              <div className="space-y-4">
                <p className="text-gray-500">Aucune qualification trouvée</p>
                <div className="space-y-2">
                  <Button onClick={createTestQualification} className="w-full">
                    Créer qualification test (avec documents)
                  </Button>
                  <Button onClick={createTestQualificationSansDocuments} variant="outline" className="w-full">
                    Créer qualification test (sans documents)
                  </Button>
                  <Button onClick={createTestQualificationDemandeAsile} variant="outline" className="w-full">
                    Créer qualification test (demande d'asile)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {qualifications.map((qual, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{qual.category}</strong>
                        <span className="ml-2 text-sm text-gray-500">
                          ({qual.userType || 'accompagne'})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleTestQualification(qual.category)}
                        >
                          Test
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTestAccompagnant(qual.category)}
                        >
                          Test Accompagnant
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleTestMessage(qual.category)}
                        >
                          Test Message
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {qual.answers.length} réponses - {new Date(qual.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              onClick={clearAllQualifications} 
              variant="destructive" 
              className="mt-4"
            >
              Effacer toutes les qualifications
            </Button>
          </div>

          {/* Section de test */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Test de formatage</h2>
            
            {selectedCategory && (
              <div className="mb-4">
                <strong>Catégorie sélectionnée :</strong> {selectedCategory}
              </div>
            )}
            
            {formattedPrompt && (
              <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold mb-2">Prompt formaté :</h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                  {formattedPrompt}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions de test :</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Allez sur une page de qualification (Santé, Emploi, etc.)</li>
            <li>Répondez aux questions de qualification</li>
            <li>Revenez sur cette page pour voir les données sauvegardées</li>
            <li>Testez le formatage du prompt</li>
            <li>Utilisez "Test Message" pour envoyer un message avec qualification</li>
            <li>Vérifiez que la réponse du LLM est personnalisée</li>
          </ol>
        </div>

        {/* Debug info */}
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Informations de débogage :</h3>
          <div className="text-sm space-y-1">
            <p><strong>localStorage keys :</strong> {Array.from({length: localStorage.length}, (_, i) => localStorage.key(i)).filter(key => key?.startsWith('qualification_')).join(', ') || 'Aucune'}</p>
            <p><strong>Nombre de qualifications :</strong> {qualifications.length}</p>
            <p><strong>Catégorie sélectionnée :</strong> {selectedCategory || 'Aucune'}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 