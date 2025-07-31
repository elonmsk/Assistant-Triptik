import { NextResponse } from "next/server"
import OpenAI from "openai"

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

interface TestRequest {
  message: string
}

export async function POST(req: Request) {
  try {
    const { message }: TestRequest = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message requis" },
        { status: 400 }
      )
    }

    console.log('🚀 Test OpenAI avec message:', message);

    // Appeler OpenAI directement
    const response = await openai.responses.create({
      model: "o4-mini",
      reasoning: { effort: "medium" },
      tools: [{ type: "web_search_preview" }],
      input: [
        {
          role: "system",
          content: contextBehavior
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    let content = response.output_text || "Désolé, je n'ai pas pu générer de réponse.";

    // Formatage de la réponse
    content = formatResponse(content);

    console.log('✅ Réponse OpenAI:', content.substring(0, 100) + '...');

    return NextResponse.json({
      message: content,
      success: true
    })

  } catch (error) {
    console.error("Erreur API test:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// Fonction de formatage simplifiée
function formatResponse(response: string): string {
  let formatted = response;

  // Si déjà en Markdown, retourner tel quel
  if (formatted.includes('# ') || formatted.includes('## ') || formatted.includes('### ')) {
    return formatted.trim();
  }

  // Formatage basique
  formatted = formatted.replace(/([🏥🖥️📱💻])\s*([^:\n]+)\s*:\s*([^\n]*)/g, '\n\n# $1 $2\n\n$3\n\n');
  formatted = formatted.replace(/([📋📝⚠️🆘💡📚⏱️])\s*([^:\n]+)\s*:/g, '\n\n## $1 $2\n\n');

  return formatted.trim();
} 