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
              safeEnqueue({
                type: 'error',
                error: 'Erreur lors de la création de la conversation'
              });
              safeClose();
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
            safeEnqueue({
              type: 'error',
              error: 'Erreur lors de la sauvegarde du message'
            });
            safeClose();
            return;
          }

          // 3. Appeler le LLM avec streaming simulé
          const llmResponse = await callRenderLLMStream(message, safeEnqueue);

          // Vérifier si le contrôleur est encore ouvert avant de continuer
          if (isControllerClosed) {
            return;
          }

          if (!llmResponse.success) {
            safeEnqueue({
              type: 'error',
              error: 'Erreur lors de la communication avec le LLM'
            });
            safeClose();
            return;
          }

          // 4. Sauvegarder la réponse de l'assistant (seulement si le contrôleur est ouvert)
          if (!isControllerClosed) {
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
            safeEnqueue({
              type: 'end',
              conversationId: currentConversationId
            });
          }

        } catch (error) {
          console.error("Erreur streaming:", error);
          if (!isControllerClosed) {
            try {
              safeEnqueue({
                type: 'error',
                error: 'Erreur interne du serveur'
              });
            } catch (enqueueError) {
              console.error("Erreur lors de l'envoi de l'erreur:", enqueueError);
              isControllerClosed = true;
            }
          }
        } finally {
          // Fermeture sécurisée dans tous les cas
          safeClose();
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
  safeEnqueue: (data: any) => void
) {
  try {
    // Détecter la catégorie en premier
    const category = detectCategory(message);
    const categoryConfig = CATEGORY_SITES[category as keyof typeof CATEGORY_SITES];

    console.log(`📂 Catégorie détectée: ${categoryConfig.name}`);

    // Étape 1: Analyse
    console.log('🚀 Envoi étape: analyzing')
    try {
      safeEnqueue({
        type: 'processing_step',
        step: 'analyzing',
        message: `Analyse de votre question (${categoryConfig.name})...`,
        progress: 15,
        category: categoryConfig.name
      });
    } catch (e) {
      // Stream fermé, on arrête
      return { success: false, content: '' };
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const context = detectContext(message);

    // Étape 2: Recherche
    console.log('🔍 Envoi étape: searching')

    // Utiliser la requête spécifique à la catégorie
    const searchQuery = categoryConfig.searchQuery(message);

    try {
      safeEnqueue({
        type: 'processing_step',
        step: 'searching',
        message: `Recherche: "${searchQuery}"`,
        progress: 30,
        category: categoryConfig.name
      });
    } catch (e) {
      return { success: false, content: '' };
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 90000);

    // Étape 3: Extraction (sites fixes par catégorie)
    console.log('🌐 Envoi étape: scraping')

    // Utiliser les sites fixes de la catégorie
    const sitesToScrape = categoryConfig.sites;

    for (let i = 0; i < sitesToScrape.length; i++) {
      const site = sitesToScrape[i];
      const progress = 50 + (i * 10); // 50%, 60%, etc.

      try {
        safeEnqueue({
          type: 'processing_step',
          step: 'scraping',
          message: `Extraction: ${site}`,
          progress: progress,
          category: categoryConfig.name
        });
      } catch (e) {
        clearTimeout(timeoutId);
        return { success: false, content: '' };
      }

      await new Promise(resolve => setTimeout(resolve, 600));
    }

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

    // Étape 4: Traitement
    console.log('📄 Envoi étape: processing')

    const processingSteps = [
      'Analyse des résultats',
      'Filtrage des informations',
      'Organisation des données',
      'Validation des sources'
    ];

    for (let i = 0; i < processingSteps.length; i++) {
      const step = processingSteps[i];
      const progress = 70 + (i * 3); // 70%, 73%, 76%, 79%

      safeEnqueue({
        type: 'processing_step',
        step: 'processing',
        message: step,
        progress: progress,
        category: categoryConfig.name
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Étape 5: Génération
    console.log('🧠 Envoi étape: generating')

    const generationSteps = [
      'Structuration de la réponse',
      'Rédaction du contenu',
      'Ajout des sources',
      'Finalisation'
    ];

    for (let i = 0; i < generationSteps.length; i++) {
      const step = generationSteps[i];
      const progress = 85 + (i * 3); // 85%, 88%, 91%, 94%

      safeEnqueue({
        type: 'processing_step',
        step: 'generating',
        message: step,
        progress: progress,
        category: categoryConfig.name
      });

      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Simuler le streaming mot par mot
    const words = content.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];

      safeEnqueue({
        type: 'content',
        content: currentContent,
        done: false
      });

      // Délai de 30ms entre les mots
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    // Signal final
    safeEnqueue({
      type: 'content',
      content: currentContent,
      done: true
    });

    return { success: true, content: currentContent };

  } catch (error) {
    console.error("Erreur LLM streaming:", error);
    let fallbackContent = generateFallbackResponse(message, '');
    if ((error as Error).name === 'AbortError') {
      fallbackContent += "\n\n⚠️ *Timeout de l'API - réponse de base fournie.*";
    }
    fallbackContent = formatResponse(fallbackContent);

    // Streamer le fallback
    safeEnqueue({
      type: 'content',
      content: fallbackContent,
      done: true
    });

    return { success: true, content: fallbackContent };
  }
}

// Fonctions utilitaires (identiques à l'original)
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

// Fonction pour déterminer la catégorie selon le message
function detectCategory(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('carte vitale') || lowerMessage.includes('sécurité sociale') ||
      lowerMessage.includes('santé') || lowerMessage.includes('médecin') ||
      lowerMessage.includes('hôpital') || lowerMessage.includes('assurance maladie') ||
      lowerMessage.includes('cpam') || lowerMessage.includes('remboursement')) {
    return 'sante';
  }

  if (lowerMessage.includes('logement') || lowerMessage.includes('appartement') ||
      lowerMessage.includes('maison') || lowerMessage.includes('apl') ||
      lowerMessage.includes('caf') || lowerMessage.includes('logement social') ||
      lowerMessage.includes('bail') || lowerMessage.includes('loyer')) {
    return 'logement';
  }

  if (lowerMessage.includes('emploi') || lowerMessage.includes('travail') ||
      lowerMessage.includes('chômage') || lowerMessage.includes('pole emploi') ||
      lowerMessage.includes('contrat') || lowerMessage.includes('salaire') ||
      lowerMessage.includes('urssaf') || lowerMessage.includes('cotisations')) {
    return 'emploi';
  }

  if (lowerMessage.includes('formation') || lowerMessage.includes('études') ||
      lowerMessage.includes('université') || lowerMessage.includes('école') ||
      lowerMessage.includes('diplôme') || lowerMessage.includes('apprentissage')) {
    return 'formation';
  }

  if (lowerMessage.includes('papiers') || lowerMessage.includes('carte de séjour') ||
      lowerMessage.includes('titre de séjour') || lowerMessage.includes('visa') ||
      lowerMessage.includes('préfecture') || lowerMessage.includes('naturalisation')) {
    return 'administratif';
  }

  if (lowerMessage.includes('transport') || lowerMessage.includes('bus') ||
      lowerMessage.includes('métro') || lowerMessage.includes('train') ||
      lowerMessage.includes('permis') || lowerMessage.includes('voiture')) {
    return 'transport';
  }

  if (lowerMessage.includes('argent') || lowerMessage.includes('aides') ||
      lowerMessage.includes('allocations') || lowerMessage.includes('rsa') ||
      lowerMessage.includes('prestations') || lowerMessage.includes('finances')) {
    return 'finances';
  }

  return 'general';
}

// Configuration des sites par catégorie (sans dérogation)
const CATEGORY_SITES = {
  sante: {
    name: 'Santé',
    searchQuery: (message: string) => `"${message}" ameli.fr`,
    sites: ['ameli.fr'],
    color: 'bg-red-500',
    textColor: 'text-red-600'
  },
  logement: {
    name: 'Logement',
    searchQuery: (message: string) => `"${message}" service-public.fr logement`,
    sites: ['service-public.fr', 'caf.fr'],
    color: 'bg-blue-500',
    textColor: 'text-blue-600'
  },
  emploi: {
    name: 'Emploi',
    searchQuery: (message: string) => `"${message}" pole-emploi.fr`,
    sites: ['pole-emploi.fr', 'service-public.fr'],
    color: 'bg-green-500',
    textColor: 'text-green-600'
  },
  formation: {
    name: 'Formation',
    searchQuery: (message: string) => `"${message}" service-public.fr formation`,
    sites: ['service-public.fr', 'education.gouv.fr'],
    color: 'bg-purple-500',
    textColor: 'text-purple-600'
  },
  administratif: {
    name: 'Administratif',
    searchQuery: (message: string) => `"${message}" service-public.fr`,
    sites: ['service-public.fr', 'gouvernement.fr'],
    color: 'bg-gray-500',
    textColor: 'text-gray-600'
  },
  transport: {
    name: 'Transport',
    searchQuery: (message: string) => `"${message}" service-public.fr transport`,
    sites: ['service-public.fr', 'immatriculation.ants.gouv.fr'],
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600'
  },
  finances: {
    name: 'Finances',
    searchQuery: (message: string) => `"${message}" service-public.fr aides`,
    sites: ['service-public.fr', 'caf.fr'],
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600'
  },
  general: {
    name: 'Général',
    searchQuery: (message: string) => `"${message}" service-public.fr`,
    sites: ['service-public.fr', 'gouvernement.fr'],
    color: 'bg-gray-500',
    textColor: 'text-gray-600'
  }
};