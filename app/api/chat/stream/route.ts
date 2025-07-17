import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI"
)

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || "https://assistant-nouveaux-arrivants-france.onrender.com";

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

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Signal de début
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

          // 1. Récupérer ou créer une conversation
          let currentConversationId = conversationId
          
          if (!currentConversationId) {
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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                error: 'Erreur lors de la création de la conversation' 
              })}\n\n`));
              controller.close();
              return;
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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Erreur lors de la sauvegarde du message' 
            })}\n\n`));
            controller.close();
            return;
          }

          // 3. Appeler le LLM avec streaming simulé
          const llmResponse = await callRenderLLMStream(message, controller, encoder);

          if (!llmResponse.success) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Erreur lors de la communication avec le LLM' 
            })}\n\n`));
            controller.close();
            return;
          }

          // 4. Sauvegarder la réponse de l'assistant
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

          // 5. Mettre à jour la conversation
          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", currentConversationId)

          // Signal de fin avec l'ID de conversation
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'end', 
            conversationId: currentConversationId 
          })}\n\n`));
          
        } catch (error) {
          console.error("Erreur streaming:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            error: 'Erreur interne du serveur' 
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error("Erreur API chat streaming:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// Fonction pour appeler le LLM avec streaming simulé
async function callRenderLLMStream(
  message: string, 
  controller: ReadableStreamDefaultController, 
  encoder: TextEncoder
) {
  try {
    const context = detectContext(message);
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 90000);

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        context: context || undefined
      }),
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    let content = data.reply || data.response || data.message;

    if (isResponseIncomplete(content)) {
      content = formatResponse(generateFallbackResponse(message, context || ''));
    } else {
      content = formatResponse(content);
    }

    // Simuler le streaming mot par mot
    const words = content.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'content',
        content: currentContent,
        done: false
      })}\n\n`));
      
      // Délai de 30ms entre les mots
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    // Signal final
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'content',
      content: currentContent,
      done: true
    })}\n\n`));

    return { success: true, content: currentContent };

  } catch (error) {
    console.error("Erreur LLM streaming:", error);
    let fallbackContent = generateFallbackResponse(message, '');
    if ((error as Error).name === 'AbortError') {
      fallbackContent += "\n\n⚠️ *Timeout de l'API - réponse de base fournie.*";
    }
    fallbackContent = formatResponse(fallbackContent);

    // Streamer le fallback
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'content',
      content: fallbackContent,
      done: true
    })}\n\n`));

    return { success: true, content: fallbackContent };
  }
}

// Fonctions utilitaires (copie depuis route.ts principal)
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

  if (formatted.includes('# ') || formatted.includes('## ') || formatted.includes('### ')) {
    return formatted.trim();
  }

  formatted = formatted.replace(/([🏥🖥️📱💻])\s*([^:\n]+)\s*:\s*([^\n]*)/g, '\n\n# $1 $2\n\n$3\n\n');
  formatted = formatted.replace(/([📋📝⚠️🆘💡📚⏱️])\s*([^:\n]+)\s*:/g, '\n\n## $1 $2\n\n');
  formatted = formatted.replace(/(\d+)\.\s*\*\*([^*]+)\*\*\s*:/g, '\n\n### $1. $2\n\n');
  formatted = formatted.replace(/(\d+)\.\s*([^:\n]+):/g, '\n\n### $1. $2\n\n');
  formatted = formatted.replace(/^[\s]*-\s*([^:\n]+):\s*([^\n]*)/gm, '- **$1**: $2');
  formatted = formatted.replace(/^[\s]*-\s*/gm, '- ');
  formatted = formatted.replace(/\[([^\]]+)\]\s*\(\s*([^)]+)\s*\)/g, '[$1]($2)');
  formatted = formatted.replace(/https:\s*\/\/([^\s]+)/g, 'https://$1');
  formatted = formatted.replace(/>\s*\*\*([^*]+)\*\*\s*:/g, '\n\n> **$1**:\n\n');
  formatted = formatted.replace(/⚠️\s*([^:\n]+):/g, '\n\n> ⚠️ **Attention**: $1\n\n');
  formatted = formatted.replace(/([.!?])\s*\n\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/g, '$1\n\n$2');
  formatted = formatted.replace(/## 📚\s*Sources consultées/g, '\n\n---\n\n## 📚 Sources consultées');
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
  formatted = formatted.replace(/^\n+|\n+$/g, '');
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