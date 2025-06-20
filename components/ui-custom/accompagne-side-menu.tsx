"use client"

import { X, Plus, FileText, Diamond, Languages, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AccompagneSideMenuProps {
  isOpen: boolean
  onClose: () => void
  onNewConversationClick: () => void
  onMyProceduresClick: () => void
  onMyAppointmentsClick: () => void
  onLanguagesClick: () => void
}

export default function AccompagneSideMenu({
  isOpen,
  onClose,
  onNewConversationClick,
  onMyProceduresClick,
  onMyAppointmentsClick,
  onLanguagesClick,
}: AccompagneSideMenuProps) {
  if (!isOpen) return null

  const handleNewConversationClick = () => {
    onNewConversationClick()
    onClose()
  }

  const handleMyProceduresClick = () => {
    onMyProceduresClick()
    onClose()
  }

  const handleMyAppointmentsClick = () => {
    onMyAppointmentsClick()
    onClose()
  }

  const handleLanguagesClick = () => {
    onLanguagesClick()
    onClose()
  }

  const menuItems = [
    { icon: Plus, label: "Nouvelle conversation", color: "text-[#414143]", onClick: handleNewConversationClick },
    { icon: FileText, label: "Mes démarches", color: "text-[#414143]", onClick: handleMyProceduresClick },
    { icon: Diamond, label: "Mes rendez-vous", color: "text-[#414143]", onClick: handleMyAppointmentsClick },
    { icon: Languages, label: "Langues", color: "text-[#414143]", onClick: handleLanguagesClick },
    { icon: LogOut, label: "Se déconnecter", color: "text-red-500", onClick: () => {} },
  ]

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Menu */}
      <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg">
        {/* Close Button */}
        <div className="p-6">
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100">
            <X className="w-6 h-6 text-[#414143]" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="px-6 space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={item.onClick}
              className={`w-full justify-start h-14 text-lg font-normal hover:bg-gray-50 ${item.color}`}
            >
              <item.icon className="w-6 h-6 mr-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
