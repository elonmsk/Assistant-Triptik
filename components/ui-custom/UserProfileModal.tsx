"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

interface Props {
  open: boolean
  onClose: () => void
}

export default function UserProfileModal({ open, onClose }: Props) {
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    const numero = localStorage.getItem("uid")
    if (!numero) return

    const fetchData = async () => {
      const res = await fetch(`/api/get-user?numero=${numero}`)
      const data = await res.json()
      setProfileData(data)
    }

    if (open) fetchData()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">🧾 Mon profil</DialogTitle>
        </DialogHeader>

        {!profileData ? (
          <p className="text-center text-sm text-gray-500">Chargement...</p>
        ) : (
          <div className="space-y-3 text-sm">
            <p><strong>Numéro :</strong> {profileData.numero}</p>
            <p><strong>Date de naissance :</strong> {profileData.date || "—"}</p>
            <p><strong>Nationalité :</strong> {profileData.nationalité || "—"}</p>
            <p><strong>Enfants à charge :</strong> {profileData.enfant ?? "—"}</p>
            <p><strong>Ville :</strong> {profileData.ville || "—"}</p>
            <p><strong>Département :</strong> {profileData.departement || "—"}</p>
            <p><strong>Documents :</strong> {Array.isArray(profileData.documents) ? profileData.documents.join(", ") : "—"}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
