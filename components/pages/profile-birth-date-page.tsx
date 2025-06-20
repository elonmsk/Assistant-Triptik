"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import ProfileNationalityPage from "./profile-nationality-page"
import ProfileChildrenPage from "./profile-children-page"
import ProfileCityPage from "./profile-city-page"

interface ProfileBirthDatePageProps {
  onBack: () => void
  onNext: () => void
}

export default function ProfileBirthDatePage({ onBack, onNext }: ProfileBirthDatePageProps) {
  const [birthDate, setBirthDate] = useState("")
  const [currentStep, setCurrentStep] = useState<"birthdate" | "nationality" | "children" | "city">("birthdate")

  const handleNext = () => {
    if (currentStep === "birthdate") {
      setCurrentStep("nationality")
    } else if (currentStep === "nationality") {
      setCurrentStep("children")
    } else if (currentStep === "children") {
      setCurrentStep("city")
    } else if (currentStep === "city") {
      // Profile complete, go to next step
      onNext()
    }
  }

  const handleBack = () => {
    if (currentStep === "nationality") {
      setCurrentStep("birthdate")
    } else if (currentStep === "children") {
      setCurrentStep("nationality")
    } else if (currentStep === "city") {
      setCurrentStep("children")
    } else {
      onBack()
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Remove non-digits

    // Format as XX/XX/XXXX
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2)
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + "/" + value.substring(5, 9)
    }

    setBirthDate(value)
  }

  if (currentStep === "nationality") {
    return <ProfileNationalityPage onBack={handleBack} onNext={handleNext} />
  }

  if (currentStep === "children") {
    return <ProfileChildrenPage onBack={handleBack} onNext={handleNext} />
  }

  if (currentStep === "city") {
    return <ProfileCityPage onBack={handleBack} onNext={handleNext} />
  }

  console.log("Birth date length:", birthDate.length, "Value:", birthDate)

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-[#414143] mb-16">Mon profil</h1>
        </div>

        {/* Question */}
        <div className="mb-8">
          <label htmlFor="birthdate" className="block text-lg font-medium text-[#414143] mb-6">
            Votre date de naissance ?
          </label>
          <Input
            id="birthdate"
            type="text"
            value={birthDate}
            onChange={handleDateChange}
            placeholder="XX/XX/XXXX"
            maxLength={10}
            className="w-full py-4 px-4 text-base border-gray-300 rounded-lg text-[#a7a8a9]"
          />
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={birthDate.length !== 10}
          className="w-full bg-[#000000] hover:bg-[#1c1c1c] text-white py-4 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
