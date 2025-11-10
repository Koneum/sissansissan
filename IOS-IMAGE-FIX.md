# Fix pour les images iOS (iPhone/iPad)

## Problème identifié

Quand vous sélectionnez une image depuis la **galerie Photos** sur iPhone, iOS peut :
- Envoyer un type MIME vide ou incorrect
- Envoyer `application/octet-stream` au lieu de `image/jpeg`
- Ne pas inclure les métadonnées correctes

**Résultat** : Les images depuis "Files" fonctionnent ✅, mais depuis "Photos" échouent ❌

## Solution appliquée

### 1. API Upload (`app/api/upload/route.ts`)
- Détection du type MIME depuis l'extension si le type est vide
- Validation permissive : accepte si l'extension **OU** le type MIME est valide
- Support de `application/octet-stream` (type par défaut iOS)

### 2. Composant Upload (`components/ui/multi-image-upload.tsx`)
- Validation côté client basée sur l'extension en plus du type MIME
- Regex pour détecter les extensions d'images valides
- Meilleure gestion des erreurs

## Formats supportés

✅ JPEG/JPG  
✅ PNG  
✅ WebP  
✅ GIF  
✅ HEIC/HEIF (format natif iOS)  
✅ AVIF  
✅ BMP  
✅ TIFF  

## Test

1. **Depuis la galerie Photos** : Devrait maintenant fonctionner
2. **Depuis Files** : Continue de fonctionner
3. **Depuis WhatsApp** : Fonctionne (images converties en JPEG)

## Déploiement sur VPS

```bash
# 1. Appliquer les changements
npx prisma db push

# 2. Rebuild
npm run build

# 3. Redémarrer
pm2 restart nextjs-a
```

## Limite de taille

- Maximum : **5MB** par image
- Configurable dans `/app/api/upload/route.ts` ligne 70

## Notes techniques

- Les images HEIC d'iOS sont automatiquement converties en JPEG par le navigateur Safari
- PostgreSQL stocke les images en binaire (type `ByteA`)
- Pas de limite théorique, mais recommandé de rester sous 10MB pour les performances
