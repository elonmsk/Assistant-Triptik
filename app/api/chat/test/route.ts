import { NextResponse } from "next/server"
import OpenAI from "openai"

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Contexte comportemental
const contextBehavior = `
Tu es un assistant spécialisé dans l'orientation des personnes réfugiées ou en situation de précarité.

Tu dois analyser la question de l'utilisateur et déterminer la catégorie principale, puis chercher exclusivement sur les sites correspondants :

**CATÉGORIES ET SITES À UTILISER :**

1. **LOGEMENT** - Utilise uniquement :
   - https://mobilijeune.actionlogement.fr/connexion?loginRedirect=%2F
   - https://www.actionlogement.fr/
   - https://www.demande-logement-social.gouv.fr/index
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

2. **SANTÉ** - Utilise uniquement :
   - https://www.assurance-maladie.ameli.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

3. **EMPLOI** - Utilise uniquement :
   - https://www.francetravail.fr/accueil/
   - https://travail-emploi.gouv.fr/les-missions-locales
   - https://travail-emploi.gouv.fr/
   - https://polaris14.org/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

4. **ÉDUCATION** - Utilise uniquement :
   - https://www.uni-r.org/
   - https://www.parcoursup.gouv.fr/
   - https://www.paris.fr/pages/cours-municipaux-d-adultes-205
   - https://www.france-education-international.fr/expertises/enic-naric
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

5. **TRANSPORT** - Utilise uniquement :
   - https://www.solidaritetransport.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

6. **HANDICAP** - Utilise uniquement :
   - https://mdphenligne.cnsa.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

7. **DÉMARCHES** - Utilise uniquement :
   - https://demarchesadministratives.fr/
   - https://<nom-du-département>.gouv.fr
   - https://lannuaire.service-public.fr/
   - https://www.service-public.fr/
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

8. **DROITS** - Utilise uniquement :
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
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

9. **APPRENTISSAGE FRANÇAIS** - Utilise uniquement :
   - https://www.reseau-alpha.org/
   - https://www.reseau-eiffel.fr/presentation-du-reseau-eiffel
   - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

10. **AIDES FINANCIÈRES** - Utilise uniquement :
    - https://www.caf.fr/
    - https://www.msa.fr/
    - https://watizat.org/wp-content/uploads/2025/06/WatizatParisFR-Juin-juillet-2025-CONSULT.pdf

**RÈGLES IMPORTANTES :**
- Analyse d'abord la question pour déterminer la catégorie principale
- Utilise UNIQUEMENT les sites listés pour la catégorie identifiée
- Ne jamais utiliser d'autres sources
- Si la question concerne plusieurs catégories, choisis la plus pertinente
- Fournis des informations précises et actualisées depuis ces sites officiels
- Consulte TOUJOURS le document Watizat en complément des autres sources

**FORMATAGE MARKDOWN OBLIGATOIRE :**
Structure ta réponse avec ce formatage :

# 🏠 [Catégorie] - [Titre de la réponse]

## 📋 Informations principales
[Informations essentielles trouvées sur les sites officiels]

## 🔗 Sites consultés
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
- **Service** : [Nom du service] — **Adresse** : [Adresse complète] — **Horaires** : [Jours + heures] — **Contact** : [Téléphone / Email]
- **Service** : [Nom du service] — **Adresse** : [Adresse complète] — **Horaires** : [Jours + heures] — **Contact** : [Téléphone / Email]

**IMPORTANT : Tous les liens doivent être formatés en Markdown [Nom](URL) pour être cliquables. Utilise des émojis appropriés selon la catégorie et structure clairement l'information.**
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

  const ensureCerfaLinks = (md: string): string => {
    if (/^##\s+.*formulaires?/im.test(md)) return md.trim()

    const cerfaRegex = /\bcerfa\b(?:\s*(?:n[°ºo]\.?\s*)?)?(\d{4}\*?\d{2}|\d{5}|\d{6})?/gi
    const numbers = new Set<string>()
    let sawCerfa = false

    for (const m of md.matchAll(cerfaRegex)) {
      sawCerfa = true
      const num = m[1]
      if (num) numbers.add(num)
    }

    if (!sawCerfa) return md.trim()

    const base = "https://www.service-public.fr/particuliers/recherche?query="
    const links =
      numbers.size > 0
        ? Array.from(numbers).map(
            (n) => `- [Formulaire CERFA ${n} (Service-Public)](${base}${encodeURIComponent(`cerfa ${n}`)})`
          )
        : [`- [Rechercher un formulaire CERFA (Service-Public)](${base}${encodeURIComponent("cerfa")})`]

    return `${md.trim()}\n\n## 🧾 Formulaires (CERFA)\n${links.join("\n")}`.trim()
  }

  const ensureSitesConsultesAtEnd = (md: string): string => {
    const lines = md.replace(/\r\n/g, "\n").split("\n")
    const isSitesHeading = (line: string) => {
      const t = line.trim()
      if (!/^##\s+/i.test(t)) return false
      const rest = t.replace(/^##\s+/i, "").trim()
      return /^(?:🔗\s*)?(?:sites?\s+consult[ée]s|sources?(?:\s+consult[ée]es)?|références?)\b/i.test(rest)
    }

    const sections: { start: number; end: number }[] = []
    for (let i = 0; i < lines.length; i++) {
      if (!isSitesHeading(lines[i])) continue
      let end = lines.length
      for (let j = i + 1; j < lines.length; j++) {
        const l = lines[j].trim()
        if (/^#{1,2}\s+/.test(l)) {
          end = j
          break
        }
      }
      sections.push({ start: i, end })
      i = end - 1
    }

    if (sections.length === 0) return md.trim()

    const collected: string[] = []
    const toRemove = new Set<number>()
    for (const s of sections) {
      for (let i = s.start; i < s.end; i++) {
        toRemove.add(i)
        if (i === s.start) continue
        collected.push(lines[i])
      }
      collected.push("")
    }

    const remaining = lines.filter((_, idx) => !toRemove.has(idx)).join("\n").trim()
    const sitesContent = collected.join("\n").trim()
    const normalizedSites = `## 🔗 Sites consultés\n${sitesContent}`.trim()

    if (!remaining) return normalizedSites
    return `${remaining}\n\n${normalizedSites}`.trim()
  }

  const seemsMarkdown = formatted.includes('# ') || formatted.includes('## ') || formatted.includes('### ')

  // Formatage basique
  if (!seemsMarkdown) {
    formatted = formatted.replace(/([🏥🖥️📱💻])\s*([^:\n]+)\s*:\s*([^\n]*)/g, '\n\n# $1 $2\n\n$3\n\n');
    formatted = formatted.replace(/([📋📝⚠️🆘💡📚⏱️])\s*([^:\n]+)\s*:/g, '\n\n## $1 $2\n\n');
  }

  formatted = ensureCerfaLinks(formatted);
  formatted = ensureSitesConsultesAtEnd(formatted);

  return formatted.trim();
} 