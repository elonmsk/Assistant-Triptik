import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  'https://amikskoyjbqdvvohgssv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI'
)

export async function POST(request: Request) {
  const { password } = await request.json()

  // 1. Lister les utilisateurs existants
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    return NextResponse.json({ error: 'Erreur récupération utilisateurs' }, { status: 500 })
  }

  const existing = users?.users
    .map((u) => u.user_metadata?.display_name)
    .filter(Boolean)

  // 2. Générer un identifiant unique
  let uid
  do {
    uid = Math.floor(100000 + Math.random() * 900000).toString()
  } while (existing.includes(uid))

  const email = `${uid}@gmail.com`

  // 3. Créer l'utilisateur Supabase
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: uid },
  })

  if (createError) {
    return NextResponse.json({ error: 'Erreur création utilisateur' }, { status: 500 })
  }

  // 4. Enregistrer l'identifiant dans la table `info`
  const { error: insertError } = await supabaseAdmin.from('info').insert([{ numero: uid }])

  if (insertError) {
    console.error("Erreur insertion DB:", insertError)
    return NextResponse.json({ error: 'Utilisateur créé, mais erreur enregistrement DB.' }, { status: 500 })
  }

  // 5. Succès
  return NextResponse.json({ uid })
}
