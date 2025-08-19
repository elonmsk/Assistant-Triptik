import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserNumeroForDB, isValidUserNumero } from "@/lib/userNumero"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI"
)

// GET /api/conversations/[id]/messages?userNumero=123456
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const userNumero = searchParams.get("userNumero")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!userNumero) {
      return NextResponse.json(
        { error: "Numéro utilisateur requis" },
        { status: 400 }
      )
    }

    const conversationId = params.id

    // Vérifier que la conversation appartient à l'utilisateur
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("user_numero, theme, title, created_at")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }

    // Valider et convertir userNumero (supporte les formats legacy et nouveaux)
    if (!isValidUserNumero(userNumero)) {
      return NextResponse.json(
        { error: "Numéro utilisateur invalide" },
        { status: 400 }
      )
    }

    const userNumeroInt = getUserNumeroForDB(userNumero)
    if (userNumeroInt === null) {
      return NextResponse.json(
        { error: "Erreur de conversion du numéro utilisateur" },
        { status: 400 }
      )
    }

    if (conversation.user_numero !== userNumeroInt) {
      return NextResponse.json(
        { error: "Non autorisé à accéder à cette conversation" },
        { status: 403 }
      )
    }

    // Récupérer les messages de la conversation
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error("Erreur récupération messages:", messagesError)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des messages" },
        { status: 500 }
      )
    }

    // Compter le total des messages pour la pagination
    const { count: totalMessages, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId)

    if (countError) {
      console.error("Erreur comptage messages:", countError)
    }

    return NextResponse.json({
      conversation: {
        id: conversationId,
        theme: conversation.theme,
        title: conversation.title,
        created_at: conversation.created_at
      },
      messages: messages || [],
      pagination: {
        total: totalMessages || 0,
        limit,
        offset,
        hasMore: (totalMessages || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error("Erreur API messages:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/messages - Ajouter un message à une conversation
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content, role, userNumero } = await req.json()

    if (!content || !role || !userNumero) {
      return NextResponse.json(
        { error: "Contenu, rôle et numéro utilisateur requis" },
        { status: 400 }
      )
    }

    if (!["user", "assistant"].includes(role)) {
      return NextResponse.json(
        { error: "Rôle doit être 'user' ou 'assistant'" },
        { status: 400 }
      )
    }

    const conversationId = params.id

    // Vérifier que la conversation appartient à l'utilisateur
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("user_numero")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }

    // Valider et convertir userNumero (supporte les formats legacy et nouveaux)
    if (!isValidUserNumero(userNumero)) {
      return NextResponse.json(
        { error: "Numéro utilisateur invalide" },
        { status: 400 }
      )
    }

    const userNumeroInt = getUserNumeroForDB(userNumero)
    if (userNumeroInt === null) {
      return NextResponse.json(
        { error: "Erreur de conversion du numéro utilisateur" },
        { status: 400 }
      )
    }

    if (conversation.user_numero !== userNumeroInt) {
      return NextResponse.json(
        { error: "Non autorisé à ajouter un message à cette conversation" },
        { status: 403 }
      )
    }

    // Ajouter le message
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content
      })
      .select("*")
      .single()

    if (messageError) {
      console.error("Erreur ajout message:", messageError)
      return NextResponse.json(
        { error: "Erreur lors de l'ajout du message" },
        { status: 500 }
      )
    }

    // Mettre à jour le timestamp de la conversation
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    return NextResponse.json({
      message: newMessage,
      success: true
    })

  } catch (error) {
    console.error("Erreur API ajout message:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// DELETE /api/conversations/[id]/messages?messageId=uuid&userNumero=123456
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const messageId = searchParams.get("messageId")
    const userNumero = searchParams.get("userNumero")

    if (!messageId || !userNumero) {
      return NextResponse.json(
        { error: "ID du message et numéro utilisateur requis" },
        { status: 400 }
      )
    }

    const conversationId = params.id

    // Vérifier que la conversation appartient à l'utilisateur
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("user_numero")
      .eq("id", conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }

    // Valider et convertir userNumero (supporte les formats legacy et nouveaux)
    if (!isValidUserNumero(userNumero)) {
      return NextResponse.json(
        { error: "Numéro utilisateur invalide" },
        { status: 400 }
      )
    }

    const userNumeroInt = getUserNumeroForDB(userNumero)
    if (userNumeroInt === null) {
      return NextResponse.json(
        { error: "Erreur de conversion du numéro utilisateur" },
        { status: 400 }
      )
    }

    if (conversation.user_numero !== userNumeroInt) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer ce message" },
        { status: 403 }
      )
    }

    // Vérifier que le message appartient à cette conversation
    const { data: message, error: messageCheckError } = await supabase
      .from("messages")
      .select("conversation_id")
      .eq("id", messageId)
      .single()

    if (messageCheckError || !message || message.conversation_id !== conversationId) {
      return NextResponse.json(
        { error: "Message non trouvé dans cette conversation" },
        { status: 404 }
      )
    }

    // Supprimer le message
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)

    if (deleteError) {
      console.error("Erreur suppression message:", deleteError)
      return NextResponse.json(
        { error: "Erreur lors de la suppression du message" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Message supprimé avec succès",
      success: true
    })

  } catch (error) {
    console.error("Erreur API suppression message:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 