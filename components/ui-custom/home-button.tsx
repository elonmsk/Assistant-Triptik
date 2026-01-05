"use client"

import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HomeButtonProps {
  onHomeClick: () => void
  variant?: "default" | "minimal" | "floating"
  className?: string
}

export default function HomeButton({ 
  onHomeClick, 
  variant = "default",
  className 
}: HomeButtonProps) {
  const baseClasses = "transition-all duration-200 ease-in-out"
  
  const variants = {
    default: "bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md",
    minimal: "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-0",
    floating: "fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl text-gray-700 hover:text-gray-900"
  }

  return (
    <Button
      onClick={onHomeClick}
      variant="outline"
      size="sm"
      className={cn(
        baseClasses,
        variants[variant],
        "flex items-center gap-2 px-3 py-2 rounded-lg font-medium",
        className
      )}
    >
      <Home className="w-4 h-4" />
      <span className="hidden sm:inline">Accueil</span>
    </Button>
  )
}
