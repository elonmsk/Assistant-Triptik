// app/api/update-french-level/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI"
)

export async function POST(req: Request) {
  const { numero, frenchLevel } = await req.json()

  if (!numero || !frenchLevel) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
  }

  const { error } = await supabase
    .from("info")
    .update({ "Niveau de francais": frenchLevel })
    .eq("numero", numero)

  if (error) {
    console.error("Erreur Supabase :", error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
  }

  return NextResponse.json({ message: "Niveau de français enregistré avec succès" })
}
