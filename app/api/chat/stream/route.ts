import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabase = createClient(
  "https://amikskoyjbqdvvohgssv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI"
)

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Contexte comportemental
const contextBehavior = `
Tu es un assistant spécialisé dans l'orientation des personnes réfugiées ou en situation de précarité.

Comportement :
- Si la thématique de la question est liée à la **formation professionnelle ou scolaire**, tu chercheras exclusivement des informations sur le site : https://www.oriane.info
- Si la thématique concerne l'**apprentissage du français**, tu chercheras exclusivement des informations sur le site : https://www.reseau-alpha.org/trouver-une-formation
- Pour toute autre thématique (hébergement, santé, alimentation, etc.), tu chercheras exclusivement des informations dans ce document PDF : https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

Tu ne dois jamais utiliser d'autres sources que celles mentionnées, selon la catégorie.
`

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
        let isControllerClosed = false;

        // Helper function pour vérifier et fermer le contrôleur
        const safeClose = () => {
          if (!isControllerClosed) {
            try {
              controller.close();
              isControllerClosed = true;
            } catch (error) {
              // Le contrôleur est déjà fermé, on ignore l'erreur
              console.log("Contrôleur déjà fermé (normal)");
            }
          }
        };

        // Helper function pour envoyer des données de manière sécurisée
        const safeEnqueue = (data: any) => {
          if (!isControllerClosed) {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            } catch (error) {
              console.error("Erreur lors de l'envoi de données:", error);
              isControllerClosed = true;
              throw error;
            }
          }
        };

        try {
          // Signal de début
          safeEnqueue({ type: 'start' });

          // TEMPORAIRE: Contourner Supabase pour tester OpenAI
          console.log('🚀 Appel OpenAI streaming pour:', message);

          // Préparer le contexte
          let systemContext = `${contextBehavior}\n\nTu es un assistant pour ${userType === 'accompagne' ? 'une personne accompagnée' : 'un accompagnant'} dans le domaine social.`

          if (theme) {
            systemContext += ` La conversation concerne le thème: ${theme}.`
          }

          // Appeler OpenAI avec streaming
          const llmResponse = await callOpenAIStream(message, safeEnqueue, systemContext, []);

          if (!llmResponse.success) {
            safeEnqueue({
              type: 'error',
              error: 'Erreur lors de la communication avec l\'IA'
            });
            safeClose();
            return;
          }

          // Signal de fin
          safeEnqueue({ 
            type: 'done',
            conversationId: conversationId || 'temp-' + Date.now()
          });

          safeClose();

        } catch (error) {
          console.error("Erreur dans le stream:", error);
          safeEnqueue({
            type: 'error',
            error: 'Erreur interne du serveur'
          });
          safeClose();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Erreur API chat stream:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

async function callOpenAIStream(
  message: string,
  safeEnqueue: (data: any) => void,
  systemContext: string,
  contextMessages: Array<{ role: string; content: string }>
) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    console.log('🚀 Requête envoyée à OpenAI:', { message, systemContext });

    const response = await openai.responses.create({
      model: "o4-mini",
      reasoning: { effort: "medium" },
      tools: [{ type: "web_search_preview" }],
      input: [
        {
          role: "system",
          content: systemContext
        },
        ...contextMessages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ]
    });

    clearTimeout(timeoutId);

    let content = response.output_text || "Désolé, je n'ai pas pu générer de réponse.";

    // Formatage de la réponse
    content = formatResponse(content);

    // ENVOYER LA RÉPONSE COMPLÈTE D'UN COUP (pas de streaming)
    safeEnqueue({
      type: 'chunk',
      content: content
    });

    return { success: true, content };

  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI:", error);
    let fallbackContent = generateFallbackResponse(message, '');
    if ((error as Error).name === 'AbortError') {
      fallbackContent += "\n\n⚠️ *Timeout de l'API - réponse de base fournie.*";
    }
    
    const formattedContent = formatResponse(fallbackContent);
    
    // Envoyer la réponse de fallback
    safeEnqueue({
      type: 'chunk',
      content: formattedContent
    });

    return { success: true, content: formattedContent };
  }
}

// Fonctions auxiliaires conservées
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

  // Étape 12: Amélioration du formatage des listes
  formatted = formatted.replace(/^•\s*(.*$)/gm, '• $1');
  formatted = formatted.replace(/^–\s*(.*$)/gm, '– $1');

  // Étape 13: Ajout de structure Markdown pour les listes
  formatted = formatted.replace(/(•\s*.*\n)+/g, (match) => {
    return '\n' + match + '\n';
  });

  return formatted.trim();
}

function generateFallbackResponse(message: string, context: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('formation') || lowerMessage.includes('étudier') || lowerMessage.includes('école')) {
    return `🏫 **Formation professionnelle ou scolaire**\n\nPour trouver des informations sur les formations disponibles, je vous recommande de consulter le site Oriane Info : https://www.oriane.info\n\nCe site regroupe toutes les formations professionnelles et scolaires disponibles en France. Vous pourrez y trouver des informations détaillées sur les formations en restauration à Paris.`;
  }
  
  if (lowerMessage.includes('français') || lowerMessage.includes('langue') || lowerMessage.includes('apprendre')) {
    return `📚 **Apprentissage du français**\n\nPour trouver des cours de français, consultez le Réseau Alpha : https://www.reseau-alpha.org/trouver-une-formation\n\nCe réseau regroupe les associations qui proposent des cours de français pour les personnes en situation de précarité.`;
  }
  
  return `📋 **Informations générales**\n\nPour des informations sur l'hébergement, la santé, l'alimentation et d'autres services, consultez le guide Watizat : https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf\n\nCe document contient toutes les informations pratiques pour les personnes en situation de précarité à Paris.`;
}

function detectCategory(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('formation') || lowerMessage.includes('étudier') || lowerMessage.includes('école')) {
    return 'formation';
  }
  
  if (lowerMessage.includes('français') || lowerMessage.includes('langue') || lowerMessage.includes('apprendre')) {
    return 'français';
  }
  
  return 'general';
}