"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ProfileChildrenPageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileChildrenPage({ onBack, onNext }: ProfileChildrenPageProps) {
  const [children, setChildren] = useState("")

  const handleNext = () => {
    if (children !== "") {
      onNext()
    }
  }

  const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Only allow digits
    if (Number.parseInt(value) <= 20 || value === "") {
      // Reasonable limit for number of children
      setChildren(value)
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        {/* Question */}
        <div className="mb-8">
          <label htmlFor="children" className="block text-lg font-medium text-[#414143] mb-6">
            Combien d'enfants à charge ?
          </label>
          <Input
            id="children"
            type="text"
            value={children}
            onChange={handleChildrenChange}
            placeholder="Nombre d'enfants"
            className="w-full py-4 px-4 text-base border-gray-300 rounded-lg text-[#a7a8a9]"
          />
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={children === ""}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
