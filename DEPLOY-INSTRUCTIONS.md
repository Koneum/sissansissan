# Instructions de déploiement - Stockage d'images en base de données

## Modifications effectuées

Les images sont maintenant stockées directement dans PostgreSQL au lieu du système de fichiers.

### 1. Nouveau modèle Image dans Prisma
- Stockage binaire avec le type `Bytes` (PostgreSQL `ByteA`)
- Relations avec Product, Review et Category
- Métadonnées: filename, mimeType, size

### 2. API Upload modifiée
- Endpoint: `POST /api/upload`
- Sauvegarde les images dans la table `Image`
- Retourne l'URL: `/api/images/{id}`

### 3. API pour servir les images
- Endpoint: `GET /api/images/[id]`
- Récupère et sert les images depuis PostgreSQL
- Headers optimisés pour le cache

## Commandes à exécuter sur le VPS

```bash
# 1. Appliquer les changements à la base de données
npx prisma db push

# 2. Rebuild l'application (génère automatiquement Prisma Client)
npm run build

# 3. Redémarrer PM2
pm2 restart nextjs-a

# 4. Vérifier les logs
pm2 logs nextjs-a --lines 50
```

### En cas d'erreur lors du build

Si vous voyez des erreurs TypeScript concernant `prisma.image`, exécutez :

```bash
npx prisma generate
npm run build
```

## Avantages de cette solution

✅ **Pas de gestion de fichiers** - Plus besoin de créer/gérer le dossier `public/uploads/`
✅ **Sauvegarde automatique** - Les images sont sauvegardées avec la base de données
✅ **Scalabilité** - Fonctionne avec plusieurs serveurs sans stockage partagé
✅ **Sécurité** - Contrôle d'accès via l'API
✅ **Simplicité** - Tout est dans PostgreSQL

## Notes importantes

- Les anciennes images dans `images: String[]` restent compatibles (legacy)
- Les nouvelles images utilisent la relation `productImages: Image[]`
- Limite de taille: 5MB par image (configurable dans `/api/upload/route.ts`)
- PostgreSQL gère bien les images jusqu'à 1GB (limite du type ByteA)

## Migration des anciennes images (optionnel)

Si vous avez des images existantes dans `public/uploads/`, vous pouvez créer un script de migration pour les importer dans PostgreSQL.
