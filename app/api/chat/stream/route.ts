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

Tu dois analyser la question de l'utilisateur et déterminer la catégorie principale, puis chercher exclusivement sur les sites correspondants :

**SITE DE RÉFÉRENCE GÉNÉRAL :**
- https://watizat.org/ - Site de référence contenant des informations essentielles dans des PDFs pour toutes les catégories. Consulte TOUJOURS ce site en premier pour des informations de base et des guides pratiques.

**CATÉGORIES ET SITES À UTILISER :**

1. **LOGEMENT** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur le logement)
   - https://mobilijeune.actionlogement.fr/connexion?loginRedirect=%2F
   - https://www.actionlogement.fr/
   - https://www.demande-logement-social.gouv.fr/index

2. **SANTÉ** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur la santé)
   - https://www.assurance-maladie.ameli.fr/

3. **EMPLOI** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur l'emploi)
   - https://www.francetravail.fr/accueil/
   - https://travail-emploi.gouv.fr/les-missions-locales
   - https://travail-emploi.gouv.fr/
   - https://polaris14.org/

4. **ÉDUCATION** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur l'éducation)
   - https://www.uni-r.org/
   - https://www.parcoursup.gouv.fr/
   - https://www.paris.fr/pages/cours-municipaux-d-adultes-205
   - https://www.france-education-international.fr/expertises/enic-naric

5. **TRANSPORT** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur le transport)
   - https://www.solidaritetransport.fr/

6. **HANDICAP** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur le handicap)
   - https://mdphenligne.cnsa.fr/

7. **DÉMARCHES** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur les démarches administratives)
   - https://demarchesadministratives.fr/
   - https://<nom-du-département>.gouv.fr
   - https://lannuaire.service-public.fr/
   - https://www.service-public.fr/

8. **DROITS** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur les droits)
   - https://www.lacimade.org/etre-aide-par-la-cimade/
   - https://www.forumrefugies.org/s-informer/publications/articles-d-actualites/en-france/1595-acces-aux-droits-deux-rapports-alertent-sur-les-defaillances-du-dispositif-dematerialise-pour-les-demandes-de-titres-de-sejour
   - https://ofpra.gouv.fr/
   - https://www.cnda.fr/
   - https://administration-etrangers-en-france.interieur.gouv.fr/particuliers/#/
   - https://www.france-terre-asile.org/
   - https://accueil-integration-refugies.fr/
   - https://www.info-droits-etrangers.org/sejourner-en-france/les-statuts-particuliers/les-ressortissants-dafrique-afrique-subsaharienne-et-maghreb/
   - https://accueil-integration-refugies.fr/wp-content/uploads/2024/07/Manuel-dinsertion-professionnelle-des-personnes-refugiees-L-entree-dans-le-parcours-17-37.pdf
   - https://asile-en-france.com/
   - https://accueil-integration-refugies.fr/les-refugies-dans-les-territoires-ruraux-guide-2024/
   - https://www.legifrance.gouv.fr/
   - https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070158/

9. **APPRENTISSAGE FRANÇAIS** - Utilise uniquement :
   - https://watizat.org/ (PDFs sur l'apprentissage du français)
   - https://www.reseau-alpha.org/
   - https://www.reseau-eiffel.fr/presentation-du-reseau-eiffel

10. **AIDES FINANCIÈRES** - Utilise uniquement :
    - https://watizat.org/ (PDFs sur les aides financières)
    - https://www.caf.fr/
    - https://www.msa.fr/

11. **FORMATION** - Utilise uniquement :
    - https://watizat.org/ (PDFs sur la formation)
    - https://www.paris.fr/pages/cours-municipaux-d-adultes-205
    - https://oriane.info/
    - https://www.lesbonsclics.fr/fr/media/sujet/wtc/e-demarches/

12. **ADMINISTRATIF** - Utilise uniquement :
    - https://watizat.org/ (PDFs sur les démarches administratives)
    - https://www.service-public.fr/
    - https://www.gouvernement.fr/
    - https://www.ofii.fr/
    - https://administration-etrangers-en-france.interieur.gouv.fr/particuliers/#/

**RÈGLES IMPORTANTES :**
- Commence TOUJOURS par consulter https://watizat.org/ pour des informations de base et des guides pratiques
- Les informations de Watizat sont souvent dans des PDFs, mentionne-les dans tes sources
- Analyse d'abord la question pour déterminer la catégorie principale
- Utilise UNIQUEMENT les sites listés pour la catégorie identifiée
- Ne jamais utiliser d'autres sources
- Si la question concerne plusieurs catégories, choisis la plus pertinente
- Fournis des informations précises et actualisées depuis ces sites officiels

**FORMATAGE MARKDOWN OBLIGATOIRE :**
Structure ta réponse avec ce formatage :

# 🏠 [Catégorie] - [Titre de la réponse]

## 📋 Informations principales
[Informations essentielles trouvées sur les sites officiels]

## 🔗 Sites consultés
- [Watizat - Guides PDF](https://watizat.org/) - Site de référence avec guides pratiques
- [Nom du site](URL) - Format obligatoire pour tous les liens
- [Nom du site](URL) - Tous les liens doivent être cliquables

## 📝 Étapes à suivre
1. **Première étape** : [Description]
2. **Deuxième étape** : [Description]
3. **Troisième étape** : [Description]

## ⚠️ Points importants
> **Attention** : [Informations importantes à retenir]

## 💡 Conseils pratiques
- [Conseil 1]
- [Conseil 2]
- [Conseil 3]

## 📞 Contacts utiles
- **Service** : [Nom du service] - [Téléphone/Email]
- **Service** : [Nom du service] - [Téléphone/Email]

**IMPORTANT : Tous les liens doivent être formatés en Markdown [Nom](URL) pour être cliquables. Utilise des émojis appropriés selon la catégorie et structure clairement l'information.**
`

interface ChatRequest {
  message: string
  conversationId?: string
  userNumero: string
  userType: 'accompagne' | 'accompagnant'
  theme?: string
  qualificationData?: {
    category: string
    answers: string[]
    timestamp: number
    userType?: 'accompagne' | 'accompagnant'
  }
}

export async function POST(req: Request) {
  try {
    const { message, conversationId, userNumero, userType, theme, qualificationData }: ChatRequest = await req.json()

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

          // Préparer le contexte avec les données de qualification
          let systemContext = `${contextBehavior}\n\nTu es un assistant pour ${userType === 'accompagne' ? 'une personne accompagnée' : 'un accompagnant'} dans le domaine social.`

          if (theme) {
            systemContext += ` La conversation concerne le thème: ${theme}.`
          }

          // Ajouter les données de qualification au prompt si disponibles
          if (qualificationData && qualificationData.answers && qualificationData.answers.length > 0) {
            console.log('🎯 Données de qualification reçues:', qualificationData)
            const qualificationProfile = formatQualificationForPrompt(qualificationData, theme || 'Général')
            console.log('📋 Profil formaté:', qualificationProfile)
            systemContext += qualificationProfile
            
            systemContext += `\n\n🎯 INSTRUCTIONS DE PERSONNALISATION OBLIGATOIRES:\n`
            systemContext += `Tu DOIS absolument adapter ta réponse en fonction du profil ci-dessus:\n\n`
            
            // Instructions spécifiques selon les réponses
            const answers = qualificationData.answers
            console.log('📝 Réponses de qualification:', answers)
            
            // Niveau de français
            if (answers[4]) { // Niveau de français (index 4)
              const frenchLevel = answers[4]
              console.log('🇫🇷 Niveau de français détecté:', frenchLevel)
              if (frenchLevel === 'a1' || frenchLevel === 'a2') {
                systemContext += `• Langage: Utilise un français SIMPLE et CLAIR. Évite les mots complexes. Explique chaque étape en détail.\n`
              } else if (frenchLevel === 'b1') {
                systemContext += `• Langage: Utilise un français INTERMÉDIAIRE. Tu peux utiliser des termes techniques mais explique-les.\n`
              } else {
                systemContext += `• Langage: Tu peux utiliser un français AVANCÉ avec des termes techniques.\n`
              }
            }
            
            // Documents possédés
            if (answers[1]) { // Documents (index 1)
              const documents = answers[1]
              console.log('📄 Documents détectés:', documents)
              if (documents === 'aucun') {
                systemContext += `• Situation: La personne n'a AUCUN document officiel. Propose des solutions pour obtenir des papiers d'abord.\n`
              } else if (documents === 'ada' || documents === 'api') {
                systemContext += `• Situation: La personne a une attestation de demande d'asile. Ses droits sont LIMITÉS mais elle peut accéder à certains services.\n`
              } else if (documents === 'carte_sejour' || documents === 'titre_sejour') {
                systemContext += `• Situation: La personne a un titre de séjour VALIDE. Elle a accès à la plupart des services français.\n`
              }
            }
            
            // Démarches antérieures
            if (answers[0]) { // Démarches antérieures (index 0)
              console.log('🔄 Expérience démarches:', answers[0])
              if (answers[0] === 'yes') {
                systemContext += `• Expérience: La personne a déjà fait des démarches. Tu peux être plus direct et technique.\n`
              } else {
                systemContext += `• Expérience: La personne n'a JAMAIS fait de démarches. Explique TOUT depuis le début, étape par étape.\n`
              }
            }
            
            // Couverture sociale (pour la santé)
            if (theme === 'Santé' && answers[10]) { // Couverture sociale (index 10)
              console.log('🏥 Couverture sociale:', answers[10])
              if (answers[10] === 'yes') {
                systemContext += `• Santé: La personne a une couverture sociale. Elle peut accéder aux remboursements et au tiers payant.\n`
              } else {
                systemContext += `• Santé: La personne N'A PAS de couverture sociale. Propose d'abord comment l'obtenir (AME, CMU, etc.).\n`
              }
            }
            
            // Âge
            if (answers[3]) { // Âge (index 3)
              const age = parseInt(answers[3])
              console.log('👤 Âge détecté:', age)
              if (age < 18) {
                systemContext += `• Âge: La personne est MINEURE. Ses démarches doivent être faites par ses parents/tuteurs.\n`
              } else if (age < 25) {
                systemContext += `• Âge: La personne est jeune adulte. Mentionne les aides spécifiques aux jeunes.\n`
              }
            }
            
            // Enfants
            if (answers[9] && answers[9] !== '0') { // Enfants (index 9)
              console.log('👶 Enfants détectés:', answers[9])
              systemContext += `• Famille: La personne a des enfants. Mentionne les aides familiales et les droits des enfants.\n`
            }
            
            // Ville/Département
            if (answers[6] && answers[7]) { // Ville et département (index 6 et 7)
              console.log('📍 Localisation:', answers[6], answers[7])
              systemContext += `• Localisation: La personne habite à ${answers[6]} (${answers[7]}). Propose des contacts et services LOCAUX.\n`
            }
            
            systemContext += `\n💡 RÈGLES GÉNÉRALES:\n`
            systemContext += `- Commence TOUJOURS par analyser la situation spécifique de la personne\n`
            systemContext += `- Propose des solutions ADAPTÉES à son profil exact\n`
            systemContext += `- Mentionne les obstacles potentiels selon sa situation\n`
            systemContext += `- Donne des conseils PRATIQUES et CONCRETS\n`
            systemContext += `- Si la personne n'a pas les bons documents, explique d'abord comment les obtenir\n`
            
            console.log('✅ Instructions de personnalisation ajoutées au prompt')
          } else {
            console.log('ℹ️ Aucune donnée de qualification disponible')
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
            conversationId: conversationId || `temp-${Math.random().toString(36).slice(2, 11)}`
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
  
  // Logement
  if (lowerMessage.includes('logement') || lowerMessage.includes('hébergement') || lowerMessage.includes('appartement') || lowerMessage.includes('maison')) {
    return `# 🏠 Logement - Demande de logement social

## 📋 Informations principales
Pour faire une demande de logement social, vous devez vous adresser aux services officiels de l'État.

## 🔗 Sites consultés
- [Mobilijeune Action Logement](https://mobilijeune.actionlogement.fr/connexion?loginRedirect=%2F)
- [Action Logement](https://www.actionlogement.fr/)
- [Demande Logement Social](https://www.demande-logement-social.gouv.fr/index)

## 📝 Étapes à suivre
1. **Créer un compte** : Inscrivez-vous sur le site officiel
2. **Rassembler les documents** : Justificatifs de revenus, situation familiale
3. **Déposer votre dossier** : En ligne ou en agence

## ⚠️ Points importants
> **Attention** : Les délais d'attente peuvent être longs selon votre situation

## 💡 Conseils pratiques
- Préparez tous vos justificatifs à l'avance
- Gardez une copie de votre dossier
- Suivez régulièrement l'avancement de votre demande

## 📞 Contacts utiles
- **Action Logement** : 01 40 05 50 50
- **Service Public** : 3939 (numéro gratuit)`;
  }
  
  // Santé
  if (lowerMessage.includes('santé') || lowerMessage.includes('sante') || lowerMessage.includes('médecin') || lowerMessage.includes('soins') || lowerMessage.includes('assurance')) {
    return `# 🏥 Santé - Couverture maladie

## 📋 Informations principales
L'Assurance Maladie gère la couverture santé de tous les résidents en France.

## 🔗 Sites consultés
- [Assurance Maladie](https://www.assurance-maladie.ameli.fr/)

## 📝 Étapes à suivre
1. **Demander une carte vitale** : Rendez-vous en agence CPAM
2. **Fournir les justificatifs** : Titre de séjour, justificatif de domicile
3. **Attendre la réception** : La carte arrive par courrier

## ⚠️ Points importants
> **Attention** : Conservez toujours votre carte vitale sur vous

## 💡 Conseils pratiques
- Faites une photocopie de votre carte vitale
- Gardez tous vos justificatifs médicaux
- Consultez votre médecin traitant régulièrement

## 📞 Contacts utiles
- **CPAM** : 3646 (numéro gratuit)
- **Urgences** : 15 (SAMU)`;
  }
  
  // Emploi
  if (lowerMessage.includes('emploi') || lowerMessage.includes('travail') || lowerMessage.includes('chômage') || lowerMessage.includes('chomage') || lowerMessage.includes('formation')) {
    return `# 💼 Emploi - Recherche d'emploi et formation

## 📋 Informations principales
France Travail et les missions locales accompagnent les demandeurs d'emploi et les formations.

## 🔗 Sites consultés
- [France Travail](https://www.francetravail.fr/accueil/)
- [Missions Locales](https://travail-emploi.gouv.fr/les-missions-locales)
- [Ministère du Travail](https://travail-emploi.gouv.fr/)
- [Polaris](https://polaris14.org/)

## 📝 Étapes à suivre
1. **S'inscrire à France Travail** : Créer un compte sur le site
2. **Rencontrer un conseiller** : Rendez-vous en agence
3. **Établir un projet** : Définir vos objectifs professionnels

## ⚠️ Points importants
> **Attention** : Gardez votre dossier à jour pour maintenir vos droits

## 💡 Conseils pratiques
- Préparez un CV et une lettre de motivation
- Suivez les formations proposées
- Maintenez une recherche active

## 📞 Contacts utiles
- **France Travail** : 3949 (numéro gratuit)
- **Mission Locale** : Consultez l'annuaire en ligne`;
  }
  
  // Éducation
  if (lowerMessage.includes('éducation') || lowerMessage.includes('education') || lowerMessage.includes('école') || lowerMessage.includes('ecole') || lowerMessage.includes('étudier') || lowerMessage.includes('université')) {
    return `# 🎓 Éducation - Inscription et formation

## 📋 Informations principales
Plusieurs organismes gèrent l'éducation et la reconnaissance des diplômes en France.

## 🔗 Sites consultés
- [Uni-R](https://www.uni-r.org/)
- [Parcoursup](https://www.parcoursup.gouv.fr/)
- [Cours Municipaux Paris](https://www.paris.fr/pages/cours-municipaux-d-adultes-205)
- [ENIC-NARIC](https://www.france-education-international.fr/expertises/enic-naric)

## 📝 Étapes à suivre
1. **Faire reconnaître vos diplômes** : Contactez ENIC-NARIC
2. **S'inscrire sur Parcoursup** : Pour les études supérieures
3. **Contacter l'établissement** : Pour l'inscription définitive

## ⚠️ Points importants
> **Attention** : Les délais de reconnaissance peuvent être longs

## 💡 Conseils pratiques
- Traduisez vos diplômes en français
- Gardez tous vos justificatifs
- Renseignez-vous sur les équivalences

## 📞 Contacts utiles
- **ENIC-NARIC** : 01 45 07 60 00
- **Parcoursup** : Support en ligne`;
  }
  
  // Transport
  if (lowerMessage.includes('transport') || lowerMessage.includes('bus') || lowerMessage.includes('métro') || lowerMessage.includes('metro') || lowerMessage.includes('train')) {
    return `# 🚌 Transport - Aides et réductions

## 📋 Informations principales
Des aides existent pour faciliter l'accès aux transports en commun.

## 🔗 Sites consultés
- [Solidarité Transport](https://www.solidaritetransport.fr/)

## 📝 Étapes à suivre
1. **Vérifier votre éligibilité** : Consultez les critères
2. **Rassembler les justificatifs** : Revenus, situation familiale
3. **Faire la demande** : En ligne ou en agence

## ⚠️ Points importants
> **Attention** : Les conditions varient selon votre lieu de résidence

## 💡 Conseils pratiques
- Comparez les offres disponibles
- Gardez vos justificatifs à jour
- Renouvelez votre demande à temps

## 📞 Contacts utiles
- **Solidarité Transport** : Consultez le site officiel
- **Transports locaux** : Contactez votre région`;
  }
  
  // Handicap
  if (lowerMessage.includes('handicap') || lowerMessage.includes('handicapé') || lowerMessage.includes('handicape')) {
    return `# ♿ Handicap - Reconnaissance et accompagnement

## 📋 Informations principales
La CNSA accompagne les personnes en situation de handicap.

## 🔗 Sites consultés
- [MDPH en ligne](https://mdphenligne.cnsa.fr/)

## 📝 Étapes à suivre
1. **Demander une évaluation** : Contactez la MDPH
2. **Fournir un certificat médical** : Du médecin traitant
3. **Attendre la décision** : De la commission

## ⚠️ Points importants
> **Attention** : Les délais de traitement peuvent être longs

## 💡 Conseils pratiques
- Rassemblez tous les documents médicaux
- Faites-vous accompagner si nécessaire
- Gardez une copie de votre dossier

## 📞 Contacts utiles
- **MDPH** : Consultez votre département
- **CNSA** : 01 53 35 50 00`;
  }
  
  // Démarches
  if (lowerMessage.includes('démarche') || lowerMessage.includes('demarche') || lowerMessage.includes('administratif') || lowerMessage.includes('papier')) {
    return `# 📋 Démarches administratives - Accompagnement

## 📋 Informations principales
Le service public accompagne les démarches administratives.

## 🔗 Sites consultés
- [Démarches Administratives](https://demarchesadministratives.fr/)
- [Annuaire Service Public](https://lannuaire.service-public.fr/)
- [Service Public](https://www.service-public.fr/)

## 📝 Étapes à suivre
1. **Identifier la démarche** : Consultez le guide en ligne
2. **Rassembler les documents** : Liste fournie sur le site
3. **Faire la demande** : En ligne ou en agence

## ⚠️ Points importants
> **Attention** : Gardez toujours une copie de vos documents

## 💡 Conseils pratiques
- Préparez vos documents à l'avance
- Faites des photocopies
- Suivez les instructions étape par étape

## 📞 Contacts utiles
- **Service Public** : 3939 (numéro gratuit)
- **Urssaf** : 3646 (numéro gratuit)`;
  }
  
  // Droits
  if (lowerMessage.includes('droit') || lowerMessage.includes('asile') || lowerMessage.includes('réfugié') || lowerMessage.includes('refugie') || lowerMessage.includes('titre de séjour')) {
    return `# ⚖️ Droits et asile - Accompagnement juridique

## 📋 Informations principales
Plusieurs associations accompagnent les demandeurs d'asile et réfugiés.

## 🔗 Sites consultés
- [La Cimade](https://www.lacimade.org/etre-aide-par-la-cimade/)
- [OFPRA](https://ofpra.gouv.fr/)
- [Administration Étrangers](https://administration-etrangers-en-france.interieur.gouv.fr/particuliers/#/)
- [France Terre d'Asile](https://www.france-terre-asile.org/)
- [Accueil Intégration Réfugiés](https://accueil-integration-refugies.fr/)

## 📝 Étapes à suivre
1. **Contacter une association** : Pour un accompagnement
2. **Préparer votre dossier** : Avec l'aide d'un juriste
3. **Suivre la procédure** : Respecter les délais

## ⚠️ Points importants
> **Attention** : Les délais sont stricts, ne tardez pas

## 💡 Conseils pratiques
- Faites-vous accompagner par une association
- Gardez tous vos justificatifs
- Respectez les rendez-vous

## 📞 Contacts utiles
- **La Cimade** : Consultez le site officiel
- **OFPRA** : 01 58 68 20 00`;
  }
  
  // Apprentissage français
  if (lowerMessage.includes('français') || lowerMessage.includes('francais') || lowerMessage.includes('langue') || lowerMessage.includes('apprendre')) {
    return `# 📚 Apprentissage du français - Cours et formations

## 📋 Informations principales
Des réseaux d'associations proposent des cours de français gratuits.

## 🔗 Sites consultés
- [Réseau Alpha](https://www.reseau-alpha.org/)
- [Réseau Eiffel](https://www.reseau-eiffel.fr/presentation-du-reseau-eiffel)

## 📝 Étapes à suivre
1. **Contacter une association** : Proche de chez vous
2. **Évaluer votre niveau** : Test de positionnement
3. **Intégrer un groupe** : Selon votre niveau

## ⚠️ Points importants
> **Attention** : L'assiduité est importante pour progresser

## 💡 Conseils pratiques
- Pratiquez régulièrement
- Participez aux activités culturelles
- Gardez un carnet de vocabulaire

## 📞 Contacts utiles
- **Réseau Alpha** : Consultez le site officiel
- **Réseau Eiffel** : Consultez le site officiel`;
  }
  
  // Aides financières
  if (lowerMessage.includes('aide') || lowerMessage.includes('argent') || lowerMessage.includes('allocation') || lowerMessage.includes('caf') || lowerMessage.includes('msa')) {
    return `# 💰 Aides financières - Calcul et demande

## 📋 Informations principales
La CAF et la MSA gèrent les aides sociales et familiales.

## 🔗 Sites consultés
- [CAF](https://www.caf.fr/)
- [MSA](https://www.msa.fr/)

## 📝 Étapes à suivre
1. **Créer un compte** : Sur le site officiel
2. **Simuler vos droits** : Calculateur en ligne
3. **Faire la demande** : En ligne ou en agence

## ⚠️ Points importants
> **Attention** : Déclarez tous vos changements de situation

## 💡 Conseils pratiques
- Gardez vos justificatifs à jour
- Consultez régulièrement votre compte
- Signalez les changements rapidement

## 📞 Contacts utiles
- **CAF** : 3230 (numéro gratuit)
- **MSA** : 01 41 63 72 72`;
  }
  
  // Formation
  if (lowerMessage.includes('formation') || lowerMessage.includes('cours') || lowerMessage.includes('formation') || lowerMessage.includes('formation')) {
    return `# 📚 Formation - Cours et formations

## 📋 Informations principales
Plusieurs organismes proposent des cours de formation.

## 🔗 Sites consultés
- [Service Public](https://www.service-public.fr/)
- [Education Nationale](https://www.education.gouv.fr/)
- [France Travail](https://www.francetravail.fr/accueil/formation)

## 📝 Étapes à suivre
1. **Identifier le cours** : Consultez le site officiel
2. **S'inscrire** : Suivre les instructions
3. **Participer** : Assister aux cours

## ⚠️ Points importants
> **Attention** : Les délais de début de formation peuvent être stricts

## 💡 Conseils pratiques
- Préparez vos justificatifs
- Gardez votre dossier à jour
- Suivez les instructions

## 📞 Contacts utiles
- **Service Public** : 3939 (numéro gratuit)
- **Education Nationale** : 01 40 05 50 50`;
  }
  
  // Administratif
  if (lowerMessage.includes('administratif') || lowerMessage.includes('démarche') || lowerMessage.includes('papier') || lowerMessage.includes('gouvernement') || lowerMessage.includes('administration')) {
    return `# 📋 Démarches administratives - Accompagnement

## 📋 Informations principales
Le service public accompagne les démarches administratives.

## 🔗 Sites consultés
- [Service Public](https://www.service-public.fr/)
- [Gouvernement](https://www.gouvernement.fr/)
- [Administration Étrangers](https://administration-etrangers-en-france.interieur.gouv.fr/particuliers/#/)

## 📝 Étapes à suivre
1. **Identifier la démarche** : Consultez le guide en ligne
2. **Rassembler les documents** : Liste fournie sur le site
3. **Faire la demande** : En ligne ou en agence

## ⚠️ Points importants
> **Attention** : Gardez toujours une copie de vos documents

## 💡 Conseils pratiques
- Préparez vos documents à l'avance
- Faites des photocopies
- Suivez les instructions étape par étape

## 📞 Contacts utiles
- **Service Public** : 3939 (numéro gratuit)
- **Urssaf** : 3646 (numéro gratuit)`;
  }
  
  // Réponse par défaut
  return `# 📋 Informations générales - Orientation

## 📋 Informations principales
Je peux vous aider avec différentes catégories de questions.

## 🔗 Catégories disponibles
- 🏠 **Logement** : Demande de logement social
- 🏥 **Santé** : Couverture maladie
- 💼 **Emploi** : Recherche d'emploi et formation
- 🎓 **Éducation** : Inscription et formation
- 🚌 **Transport** : Aides et réductions
- ♿ **Handicap** : Reconnaissance et accompagnement
- 📋 **Démarches** : Accompagnement administratif
- ⚖️ **Droits** : Accompagnement juridique
- 📚 **Apprentissage français** : Cours et formations
- 💰 **Aides financières** : Calcul et demande
- 📚 **Formation** : Cours et formations
- 📋 **Administratif** : Accompagnement administratif

## 💡 Conseils pratiques
- Précisez votre question pour une réponse plus adaptée
- Rassemblez vos documents à l'avance
- N'hésitez pas à demander de l'aide

## 📞 Contacts utiles
- **Service Public** : 3939 (numéro gratuit)
- **Urgences** : 15 (SAMU)`;
}

function detectCategory(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Logement
  if (lowerMessage.includes('logement') || lowerMessage.includes('hébergement') || lowerMessage.includes('appartement') || lowerMessage.includes('maison')) {
    return 'logement';
  }
  
  // Santé
  if (lowerMessage.includes('santé') || lowerMessage.includes('sante') || lowerMessage.includes('médecin') || lowerMessage.includes('soins') || lowerMessage.includes('assurance')) {
    return 'santé';
  }
  
  // Emploi
  if (lowerMessage.includes('emploi') || lowerMessage.includes('travail') || lowerMessage.includes('chômage') || lowerMessage.includes('chomage') || lowerMessage.includes('formation')) {
    return 'emploi';
  }
  
  // Éducation
  if (lowerMessage.includes('éducation') || lowerMessage.includes('education') || lowerMessage.includes('école') || lowerMessage.includes('ecole') || lowerMessage.includes('étudier') || lowerMessage.includes('université')) {
    return 'éducation';
  }
  
  // Transport
  if (lowerMessage.includes('transport') || lowerMessage.includes('bus') || lowerMessage.includes('métro') || lowerMessage.includes('metro') || lowerMessage.includes('train')) {
    return 'transport';
  }
  
  // Handicap
  if (lowerMessage.includes('handicap') || lowerMessage.includes('handicapé') || lowerMessage.includes('handicape')) {
    return 'handicap';
  }
  
  // Démarches
  if (lowerMessage.includes('démarche') || lowerMessage.includes('demarche') || lowerMessage.includes('administratif') || lowerMessage.includes('papier')) {
    return 'démarches';
  }
  
  // Droits
  if (lowerMessage.includes('droit') || lowerMessage.includes('asile') || lowerMessage.includes('réfugié') || lowerMessage.includes('refugie') || lowerMessage.includes('titre de séjour')) {
    return 'droits';
  }
  
  // Apprentissage français
  if (lowerMessage.includes('français') || lowerMessage.includes('francais') || lowerMessage.includes('langue') || lowerMessage.includes('apprendre')) {
    return 'apprentissage français';
  }
  
  // Aides financières
  if (lowerMessage.includes('aide') || lowerMessage.includes('argent') || lowerMessage.includes('allocation') || lowerMessage.includes('caf') || lowerMessage.includes('msa')) {
    return 'aides financières';
  }
  
  // Formation
  if (lowerMessage.includes('formation') || lowerMessage.includes('cours') || lowerMessage.includes('formation') || lowerMessage.includes('formation')) {
    return 'formation';
  }
  
  // Administratif
  if (lowerMessage.includes('administratif') || lowerMessage.includes('démarche') || lowerMessage.includes('papier') || lowerMessage.includes('gouvernement') || lowerMessage.includes('administration')) {
    return 'administratif';
  }
  
  return 'général';
}

// Fonction pour formater les données de qualification pour le prompt
function formatQualificationForPrompt(qualificationData: any, category: string): string {
  if (!qualificationData || !qualificationData.answers.length) {
    return ''
  }

  const answers = qualificationData.answers
  const userType = qualificationData.userType || 'accompagne'
  
  let profile = `\n\n📋 PROFIL DÉTAILLÉ DE L'UTILISATEUR:\n`
  profile += `Type: ${userType === 'accompagne' ? 'Personne accompagnée' : 'Accompagnant'}\n`
  profile += `Catégorie: ${category}\n`
  profile += `Date de qualification: ${new Date(qualificationData.timestamp).toLocaleDateString('fr-FR')}\n\n`
  
  // Questions communes avec labels clairs
  const commonQuestions = [
    "Démarches antérieures",
    "Documents possédés", 
    "Genre",
    "Âge",
    "Niveau de français",
    "Langue courante",
    "Ville de domiciliation",
    "Département de domiciliation",
    "Situation de handicap",
    "Enfants"
  ]

  // Questions spécifiques par catégorie
  const specificQuestions: { [key: string]: string[] } = {
    'Santé': ['Couverture sociale'],
    'Emploi': ['Résidence en France', 'Niveau scolaire', 'Inscription France Travail', 'Expérience professionnelle', 'CV à jour'],
    'Logement': ['Nombre de personnes', 'Composition du foyer', 'Logement actuel', 'Demande logement social', 'Connaissance des aides'],
    'Droits': ['Résidence en France', 'Nationalité'],
    'Éducation': ['Niveau scolaire', 'Carte INE', 'Nationalité'],
    'Apprentissage Français': ['Financement formation'],
    'Formation Pro': ['Financement', 'Dates demandées', 'Durée engagement', 'Disponibilité', 'Jours présence'],
    'Démarches': ['Nationalité']
  }

  const allQuestions = [...commonQuestions, ...(specificQuestions[category] || [])]
  
  // Formater les réponses avec des labels plus clairs
  answers.forEach((answer: string, index: number) => {
    if (index < allQuestions.length) {
      let formattedAnswer = answer
      
      // Traduire les valeurs pour plus de clarté
      if (answer === 'yes') formattedAnswer = 'Oui'
      else if (answer === 'no') formattedAnswer = 'Non'
      else if (answer === 'male') formattedAnswer = 'Homme'
      else if (answer === 'female') formattedAnswer = 'Femme'
      else if (answer === 'french') formattedAnswer = 'Français'
      else if (answer === 'english') formattedAnswer = 'Anglais'
      else if (answer === 'arabic') formattedAnswer = 'Arabe'
      else if (answer === 'other') formattedAnswer = 'Autre'
      else if (answer === 'a1') formattedAnswer = 'A1 (Débutant)'
      else if (answer === 'a2') formattedAnswer = 'A2 (Élémentaire)'
      else if (answer === 'b1') formattedAnswer = 'B1 (Intermédiaire)'
      else if (answer === 'b2') formattedAnswer = 'B2 (Intermédiaire supérieur)'
      else if (answer === 'c1') formattedAnswer = 'C1 (Avancé)'
      else if (answer === 'c2') formattedAnswer = 'C2 (Maîtrise)'
      else if (answer === 'ada') formattedAnswer = 'Attestation de demande d\'asile (ADA)'
      else if (answer === 'api') formattedAnswer = 'Attestation prolongation d\'instruction (API)'
      else if (answer === 'carte_sejour') formattedAnswer = 'Carte de séjour'
      else if (answer === 'titre_sejour') formattedAnswer = 'Titre de séjour réfugié'
      else if (answer === 'passeport') formattedAnswer = 'Passeport'
      else if (answer === 'recepisse') formattedAnswer = 'Récépissé de décision favorable'
      else if (answer === 'aucun') formattedAnswer = 'Aucun document officiel'
      
      profile += `• ${allQuestions[index]}: ${formattedAnswer}\n`
    }
  })

  return profile
}

// Fonction pour appeler OpenAI
async function callOpenAI({ systemContext, messages, userMessage }: {
  systemContext: string
  messages: Array<{ role: string; content: string }>
  userMessage: string
}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    console.log('🚀 Requête envoyée à OpenAI:', { userMessage, systemContext });

    const response = await openai.responses.create({
      model: "o4-mini",
      reasoning: { effort: "medium" },
      tools: [{ type: "web_search_preview" }],
      input: [
        {
          role: "system",
          content: systemContext
        },
        ...messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    clearTimeout(timeoutId);

    let content = response.output_text || "Désolé, je n'ai pas pu générer de réponse.";

    // Formatage de la réponse comme avant
    content = formatResponse(content);

    return { success: true, content };

  } catch (error) {
    console.error("Erreur lors de l'appel à OpenAI:", error);
    let fallbackContent = generateFallbackResponse(userMessage, systemContext);
    if ((error as Error).name === 'AbortError') {
      fallbackContent += "\n\n⚠️ *Timeout de l'API - réponse de base fournie.*";
    }
    
    const formattedContent = formatResponse(fallbackContent);
    return { success: true, content: formattedContent };
  }
}