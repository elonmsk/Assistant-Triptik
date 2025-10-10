"use client"

import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  onClick: () => void
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "default" | "lg"
  showHome?: boolean
  className?: string
  children?: React.ReactNode
}

export default function BackButton({
  onClick,
  variant = "ghost",
  size = "default",
  showHome = false,
  className,
  children
}: BackButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size="icon"
        onClick={onClick}
        className={cn(
          "transition-all duration-200 hover:scale-105",
          "hover:bg-gray-100 active:scale-95",
          className
        )}
        aria-label="Retour"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
      {showHome && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (window.location.href = "/")}
          className={cn(
            "transition-all duration-200 hover:scale-105",
            "hover:bg-gray-100 active:scale-95",
            "text-gray-600 hover:text-gray-900"
          )}
          aria-label="Accueil"
        >
          <Home className="w-5 h-5" />
        </Button>
      )}
      
      {children}
    </div>
  )
}

// Composant pour header avec navigation
interface NavigationHeaderProps {
  onBack: () => void
  title: string
  showHome?: boolean
  rightContent?: React.ReactNode
  className?: string
}

export function NavigationHeader({
  onBack,
  title,
  showHome = true,
  rightContent,
  className
}: NavigationHeaderProps) {
  return (
    <header className={cn(
      "flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white",
      "sticky top-0 z-50 backdrop-blur-sm bg-white/95",
      className
    )}>
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} showHome={showHome} />
        <h1 className="text-xl font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>
      
      {rightContent && (
        <div className="flex items-center gap-2">
          {rightContent}
        </div>
      )}
    </header>
  )
}
