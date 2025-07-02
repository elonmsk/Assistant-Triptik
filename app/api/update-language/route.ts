import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI" // ta clé service_role
)

export async function POST(req: Request) {
  try {
    const { numero, language } = await req.json()

    if (!numero || !language) {
      return NextResponse.json({ error: "Numéro ou langue manquant" }, { status: 400 })
    }

    const { error } = await supabase
      .from("info")
      .update({ langue: language })
      .eq("numero", numero)

    if (error) {
      console.error("Erreur update langue :", error)
      return NextResponse.json({ error: "Erreur update" }, { status: 500 })
    }

    return NextResponse.json({ message: "Langue mise à jour" })
  } catch (e) {
    console.error("Erreur serveur :", e)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
