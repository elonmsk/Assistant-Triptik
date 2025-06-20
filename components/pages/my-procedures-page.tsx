"use client"

import { ArrowLeft, Search, MessageCircle, MoreVertical, Paperclip, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface MyProceduresPageProps {
  onBack: () => void
}

export default function MyProceduresPage({ onBack }: MyProceduresPageProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const procedures = {
    "2025": [
      { id: "1", title: "J'ai perdu ma carte vitale", subtitle: "" },
      { id: "2", title: "Je cherche un mode de garde", subtitle: "" },
      { id: "3", title: "Comment toucher les APL", subtitle: "" },
      { id: "4", title: "Je cherche une formation", subtitle: "" },
      {
        id: "5",
        title: "Est itaque tempor",
        subtitle: "Est itaque tempore ut quia adr...",
      },
    ],
    "2024": [
      {
        id: "6",
        title: "Est itaque tempor",
        subtitle: "Est itaque tempore ut quia adr...",
      },
      {
        id: "7",
        title: "Est itaque tempore ut quia adr...",
        subtitle: "Est itaque tempore ut quia adr...",
      },
    ],
  }

  const handleMenuAction = (action: string, itemId: string) => {
    console.log(`${action} for item ${itemId}`)
    setOpenMenuId(null)
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6 text-[#414143]" />
        </Button>
        <h1 className="text-xl font-semibold text-[#414143]">Mes Démarches</h1>
        <div className="flex items-center gap-3">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = "/")}
          />
          <Button variant="ghost" size="icon">
            <Search className="w-6 h-6 text-[#414143]" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {Object.entries(procedures).map(([year, procedureList]) => (
          <div key={year} className="mb-8">
            {/* Year Header */}
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-medium text-[#a7a8a9]">{year}</h2>
              <div className="flex-1 h-px bg-gray-200 ml-4"></div>
            </div>

            {/* Procedure Items */}
            <div className="space-y-4">
              {procedureList.map((procedure) => (
                <div
                  key={procedure.id}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#73726d]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-[#414143] mb-1">{procedure.title}</h3>
                    {procedure.subtitle && <p className="text-sm text-[#a7a8a9] truncate">{procedure.subtitle}</p>}
                  </div>

                  {/* Menu */}
                  <DropdownMenu
                    open={openMenuId === procedure.id}
                    onOpenChange={(open) => setOpenMenuId(open ? procedure.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreVertical className="w-5 h-5 text-[#73726d]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleMenuAction("share", procedure.id)}
                        className="flex items-center gap-3 py-3"
                      >
                        <Paperclip className="w-4 h-4" />
                        Partager
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMenuAction("rename", procedure.id)}
                        className="flex items-center gap-3 py-3"
                      >
                        <Edit className="w-4 h-4" />
                        Renommer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleMenuAction("delete", procedure.id)}
                        className="flex items-center gap-3 py-3 text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
