import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI" // ta clé service_role
)

export async function POST(req: Request) {
  const { numero, documents } = await req.json()

  if (!numero || !Array.isArray(documents)) {
    return NextResponse.json({ error: "Champs manquants ou invalides" }, { status: 400 })
  }

  const { error } = await supabase
    .from("info")
    .update({ documents })
    .eq("numero", numero)

  if (error) {
    console.error("Erreur Supabase :", error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
  }

  return NextResponse.json({ message: "Documents enregistrés avec succès" })
}
