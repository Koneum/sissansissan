# Problème de Customization - Analyse et Solution

## Problème identifié

Les pages de customization (SEO, Footer, Header, etc.) utilisent **localStorage** pour sauvegarder les données au lieu de la base de données PostgreSQL.

### Fichiers concernés :
- `lib/seo-context.tsx` - Utilise localStorage
- `app/admin/customization/seo/page.tsx`
- `app/admin/customization/footer/page.tsx`
- `app/admin/customization/header/page.tsx`
- etc.

## Solution

### 1. Modifier le contexte SEO pour utiliser l'API

Au lieu de `localStorage.setItem()`, faire un appel API vers `/api/settings/seo`

### 2. Créer les routes API manquantes

- `POST /api/settings/seo` - Sauvegarder les paramètres SEO
- `GET /api/settings/seo` - Récupérer les paramètres SEO
- `POST /api/settings/footer` - Sauvegarder le footer
- `GET /api/settings/footer` - Récupérer le footer
- etc.

### 3. Utiliser la table SiteSettings

```prisma
model SiteSettings {
  id        String   @id @default(cuid())
  key       String   @unique // "seo", "footer", "header", etc.
  value     Json     // Stocke la configuration
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Implémentation recommandée

1. Créer un hook générique `useSettings(key)` qui :
   - Récupère les données depuis l'API au chargement
   - Sauvegarde dans la DB via l'API
   - Utilise localStorage comme cache temporaire

2. Remplacer tous les contextes par ce hook générique

3. Créer une route API générique `/api/settings/[key]`
