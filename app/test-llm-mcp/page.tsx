"use client"

import { useState } from "react"
import IntelligentHealthChat from "@/components/chat/intelligent-health-chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Settings, TestTube } from "lucide-react"

export default function TestLLMMCPPage() {
  const [userProfile, setUserProfile] = useState({
    country: 'France',
    age: 25,
    status: 'resident',
    language: 'fr'
  })
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const presetProfiles = [
    {
      name: "Français typique",
      profile: { country: 'France', age: 30, status: 'resident', language: 'fr' }
    },
    {
      name: "Demandeur d'asile (Syrie)",
      profile: { country: 'Syria', age: 23, status: 'asylum_seeker', language: 'fr' }
    },
    {
      name: "Étudiant étranger",
      profile: { country: 'Morocco', age: 22, status: 'student', language: 'fr' }
    },
    {
      name: "Travailleur EU",
      profile: { country: 'Spain', age: 35, status: 'eu_worker', language: 'fr' }
    },
    {
      name: "Senior français",
      profile: { country: 'France', age: 68, status: 'retired', language: 'fr' }
    }
  ]

  const updateProfile = (field: string, value: string | number) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const loadPresetProfile = (profile: any) => {
    setUserProfile(profile)
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Test LLM + MCP Integration</h1>
                  <p className="text-sm text-gray-600">
                    Assistant santé intelligent avec Bright Data scraping
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TestTube className="w-3 h-3" />
                  Test Environment
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  Profil
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          <div className={`lg:col-span-1 space-y-4 ${showSettings ? 'block' : 'hidden lg:block'}`}>
            
            {/* Current Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profil Utilisateur Actuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Pays:</span>
                    <Badge variant="outline">{userProfile.country}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Âge:</span>
                    <Badge variant="outline">{userProfile.age} ans</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Statut:</span>
                    <Badge variant="outline">{userProfile.status}</Badge>
                  </div>
                  {currentSessionId && (
                    <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                      Session: {currentSessionId.slice(-8)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preset Profiles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profils Prédéfinis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {presetProfiles.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadPresetProfile(preset.profile)}
                    className="w-full justify-start text-xs h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-gray-500">
                        {preset.profile.country}, {preset.profile.age} ans, {preset.profile.status}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Custom Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profil Personnalisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays d'origine</Label>
                  <Select
                    value={userProfile.country}
                    onValueChange={(value) => updateProfile('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Syria">Syrie</SelectItem>
                      <SelectItem value="Morocco">Maroc</SelectItem>
                      <SelectItem value="Algeria">Algérie</SelectItem>
                      <SelectItem value="Spain">Espagne</SelectItem>
                      <SelectItem value="Italy">Italie</SelectItem>
                      <SelectItem value="Germany">Allemagne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => updateProfile('age', parseInt(e.target.value) || 0)}
                    min="16"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={userProfile.status}
                    onValueChange={(value) => updateProfile('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Résident français</SelectItem>
                      <SelectItem value="asylum_seeker">Demandeur d'asile</SelectItem>
                      <SelectItem value="student">Étudiant étranger</SelectItem>
                      <SelectItem value="eu_worker">Travailleur UE</SelectItem>
                      <SelectItem value="tourist">Touriste</SelectItem>
                      <SelectItem value="retired">Retraité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Test Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scénarios de Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-green-50 rounded text-green-800">
                    ✅ "Comment obtenir ma carte vitale ?"
                  </div>
                  <div className="p-2 bg-blue-50 rounded text-blue-800">
                    ✅ "Je viens de Syrie, quels sont mes droits ?"
                  </div>
                  <div className="p-2 bg-purple-50 rounded text-purple-800">
                    ✅ "Comment me faire rembourser ?"
                  </div>
                  <div className="p-2 bg-orange-50 rounded text-orange-800">
                    ✅ "Trouve-moi une CPAM près de chez moi"
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="h-[calc(100vh-200px)]">
              <IntelligentHealthChat
                userProfile={userProfile}
                onSessionUpdate={setCurrentSessionId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 