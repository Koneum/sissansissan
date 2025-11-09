# Configuration de la Base de Données

## Problème de Drift Détecté

Le schéma Prisma n'est pas synchronisé avec l'historique des migrations. Suivez ces étapes pour résoudre le problème.

## Étapes de Résolution

### 1. Réinitialiser la base de données

Cette commande va :
- Supprimer toutes les données
- Supprimer toutes les tables
- Réappliquer toutes les migrations
- Exécuter le seed automatiquement (qui crée l'admin)

```bash
npm run prisma:reset
```

**⚠️ ATTENTION : Cette commande supprime TOUTES les données de la base de données !**

Le seed créera automatiquement :
- ✅ Compte admin avec Better Auth
- ✅ **Email** : admin@sissan.com
- ✅ **Mot de passe** : admin123

### 2. Vérifier la base de données

Ouvrez Prisma Studio pour vérifier que tout est correct :

```bash
npm run prisma:studio
```

## Alternative : Migration sans perte de données

Si vous avez des données importantes et ne voulez pas les perdre :

### Option 1 : Créer une nouvelle migration

```bash
npx prisma migrate dev --name sync_schema
```

### Option 2 : Push direct (développement uniquement)

```bash
npm run prisma:push
```

Puis exécutez le seed manuellement :

```bash
npm run prisma:seed
```

Le seed créera automatiquement le compte admin.

## Scripts Disponibles

- `npm run prisma:reset` - Réinitialise la base de données et exécute le seed
- `npm run prisma:seed` - Exécute uniquement le seed
- `npm run create-admin` - Crée le compte admin avec Better Auth
- `npm run prisma:studio` - Ouvre l'interface Prisma Studio
- `npm run prisma:migrate` - Crée une nouvelle migration
- `npm run prisma:push` - Pousse le schéma vers la base de données

## Compte Admin par Défaut

Le seed crée automatiquement le compte admin :

```
Email: admin@sissan.com
Mot de passe: admin123
Rôle: ADMIN
```

**🔒 N'oubliez pas de changer le mot de passe en production !**

## Données de Test

Le seed crée automatiquement :
- ✅ 1 utilisateur admin (avec compte Better Auth)
- ✅ 4 catégories de produits
- ✅ 12 produits avec images
- ✅ 20 commandes de test

## Résolution des Problèmes

### Erreur : "Drift detected"

Exécutez `npm run prisma:reset` pour réinitialiser complètement.

### Erreur : "Account already exists"

Le compte admin existe déjà. Vous pouvez :
- Utiliser les identifiants existants
- Supprimer manuellement le compte dans Prisma Studio
- Réinitialiser la base de données

### Erreur de connexion à la base de données

Vérifiez votre fichier `.env` :

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```
