# Assistant Triptik - Application Next.js

Cette application Next.js utilise une architecture moderne suivant les standards recommandés.

## 🏗️ Structure du projet

```
├── app/                          # Next.js App Router
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Page d'accueil
├── components/                   # Composants réutilisables
│   ├── pages/                   # Composants de pages
│   │   ├── index.ts            # Exports centralisés
│   │   ├── emmaus-assistant.tsx # Page principale
│   │   ├── accompagnant-page.tsx # Page accompagnant
│   │   ├── accompagne-page.tsx  # Page accompagné
│   │   └── ...                  # Autres pages
│   ├── ui/                      # Composants UI (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── ui-custom/               # Composants UI personnalisés
│       ├── index.ts            # Exports centralisés
│       ├── side-menu.tsx       # Menu latéral
│       └── accompagne-side-menu.tsx
├── hooks/                        # Hooks React personnalisés
├── lib/                         # Utilitaires et helpers
│   └── utils.ts
├── public/                      # Assets statiques
│   └── images/
└── styles/                      # Styles additionnels
```

## 🛠️ Technologies utilisées

- **Framework** : Next.js 15.2.4 (App Router)
- **Langage** : TypeScript 5
- **Styles** : Tailwind CSS 3.4.17
- **Composants UI** : Radix UI + shadcn/ui
- **Formulaires** : React Hook Form + Zod
- **Thèmes** : next-themes (mode sombre/clair)
- **Gestionnaire de paquets** : pnpm

## 🚀 Démarrage rapide

### Installation des dépendances
```bash
pnpm install
```

### Lancement en développement
```bash
pnpm run dev
```

### Build de production
```bash
pnpm run build
```

### Lancement en production
```bash
pnpm start
```

## 📦 Structure des imports

Grâce aux fichiers d'index, les imports sont simplifiés :

```typescript
// Import des pages
import { EmmausAssistant, AccompagnantPage } from "@/components/pages"

// Import des composants UI personnalisés
import { SideMenu, AccompagneSideMenu } from "@/components/ui-custom"

// Import des composants shadcn/ui
import { Button } from "@/components/ui/button"
```

## 🎯 Pages disponibles

### Pages principales
- **Page d'accueil** : Sélection du rôle (accompagnant/accompagné)
- **Page accompagnant** : Interface pour les accompagnants
- **Page accompagné** : Interface pour les accompagnés

### Pages de qualification
- **Qualification accompagnant** : Questions spécifiques par thématique
- **Qualification catégorie** : Questions par catégorie

### Pages de profil
- **Configuration profil** : Étapes de création de profil
- **Date de naissance** : Saisie de la date de naissance
- **Ville** : Sélection de la ville
- **Nationalité** : Sélection de la nationalité
- **Enfants** : Information sur les enfants
- **Documents** : Gestion des documents

### Pages fonctionnelles
- **Création de compte** : Processus d'inscription
- **Communauté** : Page communautaire
- **Historique** : Historique des recherches
- **Langues** : Sélection de langue
- **Procédures** : Mes procédures
- **Rendez-vous** : Mes rendez-vous

## 🔧 Configuration

L'application utilise :
- **Alias de chemin** : `@/*` pour les imports absolus
- **CSS Variables** : Pour la personnalisation des thèmes
- **Icônes** : Lucide React
- **Configuration Tailwind** : Personnalisée avec les variables CSS

## 📋 Standards suivis

✅ **Structure Next.js App Router**  
✅ **Séparation des responsabilités**  
✅ **Imports absolus avec alias**  
✅ **Exports centralisés avec index.ts**  
✅ **TypeScript strict**  
✅ **Composants réutilisables**  
✅ **Configuration shadcn/ui standard** 