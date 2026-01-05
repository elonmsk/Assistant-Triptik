"use client"

import { Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export default function ThematiqueOuQuestionCallout({
  className,
}: {
  className?: string
}) {
  return (
    <Alert
      className={cn(
        "border-blue-200 bg-blue-50 text-blue-950 [&>svg]:text-blue-700 p-2.5 [&>svg]:left-3 [&>svg]:top-2.5 [&>svg~*]:pl-6",
        className
      )}
    >
      <Info className="h-4 w-4" />
      <AlertDescription className="text-xs leading-snug">
        <span className="font-medium">
          Vous pouvez sélectionner une thématique ou poser directement votre
          question.
        </span>
      </AlertDescription>
    </Alert>
  )
}


