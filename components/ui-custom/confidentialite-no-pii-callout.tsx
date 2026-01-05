"use client"

import { ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ConfidentialiteNoPiiCallout({
  className,
}: {
  className?: string
}) {
  return (
    <div
      role="note"
      className={cn(
        "w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2",
        className
      )}
    >
      <div className="flex items-start gap-2 text-slate-700">
        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
        <p className="text-xs leading-snug">
          <span className="font-medium">Confidentialité :</span> ne saisissez pas
          votre <span className="font-medium">numéro de téléphone</span>,{" "}
          <span className="font-medium">adresse e-mail</span>,{" "}
          <span className="font-medium">nom</span> ou{" "}
          <span className="font-medium">prénom</span>.
        </p>
      </div>
    </div>
  )
}


