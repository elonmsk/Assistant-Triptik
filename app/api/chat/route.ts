import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI"
)

// Configuration pour votre API LLM sur Render
// TODO: Remplacer par votre vraie URL API Render
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || "https://assistant-nouveaux-arrivants-france.onrender.com";
const RENDER_API_KEY = process.env.RENDER_API_KEY || "";

interface ChatRequest {
  message: string
  conversationId?: string
  userNumero: string
  userType: 'accompagne' | 'accompagnant'
  theme?: string
}

export async function POST(req: Request) {
  try {
    const { message, conversationId, userNumero, userType, theme }: ChatRequest = await req.json()

    if (!message || !userNumero || !userType) {
      return NextResponse.json(
        { error: "Message, numéro utilisateur et type d'utilisateur requis" },
        { status: 400 }
      )
    }

    // 1. Récupérer ou créer une conversation
    let currentConversationId = conversationId
    
    if (!currentConversationId) {
      // Créer une nouvelle conversation
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_numero: userNumero,
          user_type: userType,
          theme: theme || "Général",
          title: message.substring(0, 50) + (message.length > 50 ? "..." : "")
        })
        .select("id")
        .single()

      if (convError) {
        console.error("Erreur création conversation:", convError)
        return NextResponse.json(
          { error: "Erreur lors de la création de la conversation" },
          { status: 500 }
        )
      }

      currentConversationId = newConversation.id
    }

    // 2. Sauvegarder le message utilisateur
    const { error: userMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: currentConversationId,
        role: "user",
        content: message
      })

    if (userMsgError) {
      console.error("Erreur sauvegarde message utilisateur:", userMsgError)
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde du message" },
        { status: 500 }
      )
    }

    // 3. Récupérer l'historique de la conversation pour le contexte
    const { data: conversationHistory, error: historyError } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true })
      .limit(10) // Limiter à 10 derniers messages pour éviter de surcharger

    if (historyError) {
      console.error("Erreur récupération historique:", historyError)
    }

    // 4. Récupérer les informations utilisateur pour le contexte
    const { data: userData, error: userError } = await supabase
      .from("info")
      .select("*")
      .eq("numero", userNumero)
      .single()

    if (userError) {
      console.error("Erreur récupération utilisateur:", userError)
    }

    // 5. Préparer le contexte pour le LLM
    const contextMessages = conversationHistory?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || []

    // Ajouter le contexte utilisateur si disponible
    let systemContext = `Tu es un assistant pour ${userType === 'accompagne' ? 'une personne accompagnée' : 'un accompagnant'} dans le domaine social.`
    
    if (userData) {
      systemContext += ` Informations utilisateur: ${userType === 'accompagne' ? 'Accompagné' : 'Accompagnant'}`
      if (userData.ville) systemContext += `, vit à ${userData.ville}`
      if (userData.langue) systemContext += `, langue préférée: ${userData.langue}`
      if (userData["Niveau de francais"]) systemContext += `, niveau français: ${userData["Niveau de francais"]}`
    }

    if (theme) {
      systemContext += ` La conversation concerne le thème: ${theme}.`
    }

    // 6. Appeler votre API LLM sur Render
    const llmResponse = await callRenderLLM({
      systemContext,
      messages: contextMessages,
      userMessage: message
    })

    if (!llmResponse.success) {
      return NextResponse.json(
        { error: "Erreur lors de la communication avec le LLM" },
        { status: 500 }
      )
    }

    // 7. Sauvegarder la réponse de l'assistant
    const { error: assistantMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: currentConversationId,
        role: "assistant",
        content: llmResponse.content
      })

    if (assistantMsgError) {
      console.error("Erreur sauvegarde réponse assistant:", assistantMsgError)
    }

    // 8. Mettre à jour la conversation (updated_at)
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", currentConversationId)

    return NextResponse.json({
      message: llmResponse.content,
      conversationId: currentConversationId,
      success: true
    })

  } catch (error) {
    console.error("Erreur API chat:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// Fonction pour appeler votre API LLM sur Render
async function callRenderLLM({ systemContext, messages, userMessage }: {
  systemContext: string
  messages: Array<{ role: string; content: string }>
  userMessage: string
}) {
  let context: string | undefined;
  try {
    const lastUserMessage = userMessage.trim();
    context = detectContext(lastUserMessage);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: lastUserMessage,
        context: context || undefined
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    let content = data.reply || data.response || data.message;

    if (isResponseIncomplete(content)) {
      content = formatResponse(generateFallbackResponse(lastUserMessage, context || ''));
    } else {
      content = formatResponse(content);
    }

    return { success: true, content };

  } catch (error) {
    console.error("Erreur lors de l'appel au LLM:", error);
    let fallbackContent = generateFallbackResponse(userMessage, context || '');
    if ((error as Error).name === 'AbortError') {
      fallbackContent += "\n\n⚠️ *Timeout de l'API - réponse de base fournie.*";
    }
    return { success: true, content: formatResponse(fallbackContent) };
  }
}

// Fonctions auxiliaires comme dans la doc
function detectContext(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();
  const contexts = [
    { keywords: ['réfugié', 'demandeur asile', 'protection subsidiaire', 'apatride'], context: 'Personne ayant obtenu le statut de réfugié ou protection internationale' },
    { keywords: ['étudiant', 'université', 'campus france', 'visa étudiant'], context: 'Étudiant international en France' },
    { keywords: ['travailleur', 'salarié', 'carte de séjour salarié', 'contrat de travail'], context: 'Travailleur étranger en France' },
    { keywords: ['conjoint français', 'mariage', 'regroupement familial', 'visa famille'], context: 'Personne venue en France pour raisons familiales' },
    { keywords: ['première fois', 'nouvel arrivant', 'viens d\'arriver', 'récemment arrivé'], context: 'Nouvel arrivant en France' }
  ];
  for (const { keywords, context } of contexts) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return context;
    }
  }
  return 'Personne résidant en France';
}

function isResponseIncomplete(response: string): boolean {
  console.error('Réponse brute de Render:', response); // Log pour débogage
  const indicators = [
    response.length < 100,
    response.endsWith('...'),
    response.includes('reponse incomplete'),
    response.split('\n').length > 5 && !response.includes('📚'),
    response.includes('présente dans de ') && response.endsWith('de ')
  ];
  
  if (response.includes('🏥') || response.includes('##') || response.includes('⚠️')) {
    return false;
  }
  
  return indicators.some(condition => condition);
}

function formatResponse(response: string): string {
  let formatted = response;

  // Si déjà en Markdown, retourner tel quel
  if (formatted.includes('# ') || formatted.includes('## ') || formatted.includes('### ')) {
    return formatted.trim();
  }

  // Étape 1: Formatage des Sections Principales avec Émojis (Niveau 1)
  formatted = formatted.replace(/([🏥🖥️📱💻])\s*([^:\n]+)\s*:\s*([^\n]*)/g, '\n\n# $1 $2\n\n$3\n\n');

  // Étape 2: Formatage des Sous-Sections avec Émojis (Niveau 2)
  formatted = formatted.replace(/([📋📝⚠️🆘💡📚⏱️])\s*([^:\n]+)\s*:/g, '\n\n## $1 $2\n\n');

  // Étape 3: Formatage des Étapes Numérotées (Version en Gras - Niveau 3)
  formatted = formatted.replace(/(\d+)\.\s*\*\*([^*]+)\*\*\s*:/g, '\n\n### $1. $2\n\n');

  // Étape 4: Formatage des Étapes Numérotées (Version Simple - Niveau 3)
  formatted = formatted.replace(/(\d+)\.\s*([^:\n]+):/g, '\n\n### $1. $2\n\n');

  // Étape 5: Formatage des Listes à Puces avec Sous-Titres
  formatted = formatted.replace(/^[\s]*-\s*([^:\n]+):\s*([^\n]*)/gm, '- **$1**: $2');

  // Étape 6: Formatage des Listes à Puces Simples
  formatted = formatted.replace(/^[\s]*-\s*/gm, '- ');

  // Étape 7: Correction des Liens Markdown
  formatted = formatted.replace(/\[([^\]]+)\]\s*\(\s*([^)]+)\s*\)/g, '[$1]($2)');

  // Étape 8: Correction des URLs Nues
  formatted = formatted.replace(/https:\s*\/\/([^\s]+)/g, 'https://$1');

  // Étape 9: Formatage des Citations en Gras
  formatted = formatted.replace(/>\s*\*\*([^*]+)\*\*\s*:/g, '\n\n> **$1**:\n\n');

  // Étape 10: Formatage des Alertes (⚠️)
  formatted = formatted.replace(/⚠️\s*([^:\n]+):/g, '\n\n> ⚠️ **Attention**: $1\n\n');

  // Étape 11: Espacement des Paragraphes
  formatted = formatted.replace(/([.!?])\s*\n\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/g, '$1\n\n$2');

  // Étape 12: Formatage de la Section Sources
  formatted = formatted.replace(/## 📚\s*Sources consultées/g, '\n\n---\n\n## 📚 Sources consultées');

  // Étape 13: Nettoyage des Sauts de Ligne Excessifs
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
  formatted = formatted.replace(/^\n+|\n+$/g, '');

  // Étape 14: Espacement Final des Titres
  formatted = formatted.replace(/\n(#{1,6}\s)/g, '\n\n$1');
  formatted = formatted.replace(/(#{1,6}\s[^\n]+)\n([^\n#])/g, '$1\n\n$2');

  return formatted.trim();
}

function generateFallbackResponse(message: string, context: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('demande d\'asile') && (lowerMessage.includes('puma') || lowerMessage.includes('protection universelle'))) {
    return `🏥 **PUMa et demande d'asile en cours**\n\n📋 **Délai de carence obligatoire :**\n- Depuis janvier 2020, il y a un **délai de carence de 3 mois** pour les demandeurs d'asile majeurs\n- Vous devez attendre 3 mois après l'enregistrement de votre demande d'asile\n\n⚠️ **Exception importante :**\n- Les **mineurs** demandeurs d'asile ont accès immédiat à la PUMa\n- Pas de délai d'attente pour les enfants\n\n🆘 **Pendant les 3 premiers mois :**\n- **Soins urgents** pris en charge aux urgences hospitalières\n- **PASS** (Permanences d'Accès aux Soins de Santé) dans les hôpitaux\n- Centres de santé communautaires\n- Consultations gratuites dans certaines associations\n\n📞 **Contacts utiles :**\n- CPAM : 36 46\n- 115 (urgence sociale)\n- Médecins du Monde, Médecins Sans Frontières\n\n⏰ **Après 3 mois :** Vous pourrez bénéficier de la PUMa complète.`;
  }
  if (lowerMessage.includes('réfugié') && lowerMessage.includes('assurance maladie')) {
    return `🏥 **Assurance maladie et statut de réfugié**\n\nFélicitations pour l'obtention de votre statut de réfugié ! Concernant l'assurance maladie :\n\n📋 **Votre situation actuelle :**\n- Si vous bénéficiez actuellement de l'AME (Aide Médicale d'État), vous devez effectuer une nouvelle demande\n- Votre couverture ne se poursuit PAS automatiquement\n\n🔄 **Démarches à effectuer :**\n1. **Demande d'affiliation à l'Assurance Maladie** auprès de votre CPAM\n2. **Documents à fournir :**\n   - Récépissé ou carte de séjour "réfugié"\n   - Justificatif de domicile\n   - Pièce d'identité\n\n⏰ **Délais :**\n- Faites la demande **dès que possible** pour éviter toute interruption\n- La CPAM a 2 mois pour traiter votre dossier\n\n🎯 **Avantages du nouveau statut :**\n- Accès aux mêmes droits qu'un assuré français\n- Possibilité d'obtenir une carte Vitale\n- Prise en charge à 100% selon votre situation\n\n📞 **Contact :** 36 46 (service gratuit + prix d'un appel)\n\n⚠️ **Important :** N'attendez pas la fin de vos droits AME pour faire la demande !`;
  }
  return `👋 Bonjour ! Je suis l'assistant pour les nouveaux arrivants en France.\n\nJe peux vous aider sur :\n🏥 Santé (sécurité sociale, médecins)\n🏠 Logement (recherche, aides)\n📋 Administratif (cartes, permis)\n💼 Emploi et formation\n🚗 Transport\n💰 Finances\n\n${context ? `\n🎯 **Votre profil :** ${context}` : ''}\n\nN'hésitez pas à me poser une question plus précise !`;
} 