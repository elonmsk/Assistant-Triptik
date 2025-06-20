"use client"

import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MyAppointmentsPageProps {
  onBack: () => void
}

export default function MyAppointmentsPage({ onBack }: MyAppointmentsPageProps) {
  const appointments = [
    {
      id: "1",
      title: "Rendez-vous Pôle Emploi",
      date: "20 janvier 2025",
      time: "14:00",
      location: "Agence Pôle Emploi - Centre ville",
    },
    {
      id: "2",
      title: "Entretien logement social",
      date: "25 janvier 2025",
      time: "10:30",
      location: "Mairie - Service logement",
    },
    {
      id: "3",
      title: "Consultation médicale",
      date: "28 janvier 2025",
      time: "16:15",
      location: "Centre médical Saint-Antoine",
    },
  ]

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="flex items-center py-3 px-6 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-[#414143]" />
        </Button>
        <h1 className="text-xl font-semibold text-[#414143] flex-1 text-center">Mes rendez-vous</h1>
        <div className="flex items-center gap-3 mr-4">
          <img
            src="/images/emmaus-logo.png"
            alt="Emmaus Connect"
            className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.href = "/")}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-base font-medium text-[#414143] mb-2">{appointment.title}</h3>
                <div className="space-y-1">
                  <p className="text-sm text-[#73726d]">
                    <span className="font-medium">{appointment.date}</span> à{" "}
                    <span className="font-medium">{appointment.time}</span>
                  </p>
                  <p className="text-sm text-[#a7a8a9]">{appointment.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
