import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI" // service_role
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const numero = searchParams.get("numero")

  if (!numero) {
    return NextResponse.json({ error: "Numéro manquant" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("info")
    .select("*")
    .eq("numero", numero)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
  }

  return NextResponse.json(data)
}
