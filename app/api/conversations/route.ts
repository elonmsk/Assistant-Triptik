import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI"
)

// GET /api/conversations?userNumero=123456&userType=accompagne
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userNumero = searchParams.get("userNumero")
    const userType = searchParams.get("userType")

    if (!userNumero || !userType) {
      return NextResponse.json(
        { error: "Numéro utilisateur et type d'utilisateur requis" },
        { status: 400 }
      )
    }

    // Convertir userNumero en entier pour la base de données
    const userNumeroInt = parseInt(userNumero, 10)
    if (isNaN(userNumeroInt)) {
      return NextResponse.json(
        { error: "Numéro utilisateur invalide" },
        { status: 400 }
      )
    }

    // Récupérer les conversations de l'utilisateur avec le dernier message
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        theme,
        title,
        created_at,
        updated_at,
        messages (
          content,
          role,
          created_at
        )
      `)
      .eq("user_numero", userNumeroInt)
      .eq("user_type", userType)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Erreur récupération conversations:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des conversations" },
        { status: 500 }
      )
    }

    // Formater les données pour inclure le dernier message
    const formattedConversations = conversations?.map(conv => {
      const lastMessage = conv.messages?.[conv.messages.length - 1]
      return {
        id: conv.id,
        theme: conv.theme,
        title: conv.title,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          role: lastMessage.role,
          created_at: lastMessage.created_at
        } : null,
        messageCount: conv.messages?.length || 0
      }
    }) || []

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    })

  } catch (error) {
    console.error("Erreur API conversations:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Créer une nouvelle conversation
export async function POST(req: Request) {
  try {
    const { userNumero, userType, theme, title } = await req.json()

    if (!userNumero || !userType) {
      return NextResponse.json(
        { error: "Numéro utilisateur et type d'utilisateur requis" },
        { status: 400 }
      )
    }

    // Convertir userNumero en entier pour la base de données
    const userNumeroInt = parseInt(userNumero, 10)
    if (isNaN(userNumeroInt)) {
      return NextResponse.json(
        { error: "Numéro utilisateur invalide" },
        { status: 400 }
      )
    }

    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        user_numero: userNumeroInt,
        user_type: userType,
        theme: theme || "Général",
        title: title || "Nouvelle conversation"
      })
      .select("*")
      .single()

    if (error) {
      console.error("Erreur création conversation:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création de la conversation" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversation: newConversation,
      success: true
    })

  } catch (error) {
    console.error("Erreur API création conversation:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// DELETE /api/conversations?conversationId=uuid&userNumero=123456
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")
    const userNumero = searchParams.get("userNumero")

    if (!conversationId || !userNumero) {
      return NextResponse.json(
        { error: "ID de conversation et numéro utilisateur requis" },
        { status: 400 }
      )
    }

    // Convertir userNumero en entier pour la base de données
    const userNumeroInt = parseInt(userNumero, 10)
    if (isNaN(userNumeroInt)) {
      return NextResponse.json(
        { error: "Numéro utilisateur invalide" },
        { status: 400 }
      )
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const { data: conversation, error: checkError } = await supabase
      .from("conversations")
      .select("user_numero")
      .eq("id", conversationId)
      .single()

    if (checkError || !conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }

    if (conversation.user_numero !== userNumeroInt) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer cette conversation" },
        { status: 403 }
      )
    }

    // Supprimer la conversation (les messages seront supprimés automatiquement grâce à ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)

    if (deleteError) {
      console.error("Erreur suppression conversation:", deleteError)
      return NextResponse.json(
        { error: "Erreur lors de la suppression de la conversation" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Conversation supprimée avec succès",
      success: true
    })

  } catch (error) {
    console.error("Erreur API suppression conversation:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 