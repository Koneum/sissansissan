# Guide de Seed et Better Auth

## 🎯 Vue d'ensemble

Ce guide explique comment le seed fonctionne avec Better Auth pour créer les données initiales de la base de données, incluant le compte admin.

## 🔑 Point Important : Better Auth utilise Scrypt

**Better Auth utilise l'algorithme `scrypt` pour hasher les mots de passe**, pas bcrypt. C'est pourquoi il faut **toujours utiliser l'API Better Auth** pour créer des comptes, jamais créer manuellement dans la base de données.

## 📦 Commandes Disponibles

```bash
# Réinitialiser la base de données (supprime tout et réexécute les migrations + seed)
npm run prisma:reset

# Exécuter uniquement le seed
npm run prisma:seed

# Créer une nouvelle migration
npm run prisma:migrate

# Ouvrir Prisma Studio
npm run prisma:studio

# Tester les identifiants admin
npm run test-admin

# Créer manuellement un admin (si besoin)
npm run create-admin
```

## 🌱 Ce que le Seed Crée

Le fichier `prisma/seed.ts` crée automatiquement :

1. **4 Catégories de produits**
   - Laptops & PC
   - Mobile & Tablets
   - Games & Videos
   - Health & Sports

2. **1 Compte Admin** (via Better Auth API)
   - Email: `admin@sissan.com`
   - Mot de passe: `admin123`
   - Rôle: `ADMIN`
   - Email vérifié: `true`

3. **12 Produits** avec images et prix

4. **20 Commandes de test** avec différents statuts

## 💡 Comment le Seed Crée l'Admin

### ❌ Mauvaise Approche (Ne fonctionne pas)

```typescript
// NE PAS FAIRE ÇA - Le hash ne sera pas compatible
const hashedPassword = await bcrypt.hash('admin123', 10)
await prisma.account.create({
  data: {
    userId: adminUser.id,
    password: hashedPassword // ❌ Hash incompatible
  }
})
```

### ✅ Bonne Approche (Utiliser l'API Better Auth)

```typescript
import { auth } from '../lib/auth'

// Utiliser l'API Better Auth pour créer le compte
const signUpResult = await auth.api.signUpEmail({
  body: {
    name: 'Admin',
    email: 'admin@sissan.com',
    password: 'admin123'
  }
})

// Mettre à jour le rôle (Better Auth crée CUSTOMER par défaut)
await prisma.user.update({
  where: { id: adminUser.id },
  data: { 
    role: 'ADMIN',
    emailVerified: true
  }
})
```

## 🔐 Identifiants par Défaut

### Admin
```
Email: admin@sissan.com
Mot de passe: admin123
Rôle: ADMIN
```

**⚠️ Important : Changez ce mot de passe en production !**

## 🛠️ Résolution des Problèmes

### Erreur : "Invalid password hash"

**Cause** : Le compte a été créé manuellement au lieu d'utiliser l'API Better Auth.

**Solution** :
```bash
npm run prisma:reset
```

### Erreur : "Drift detected"

**Cause** : Le schéma Prisma n'est pas synchronisé avec les migrations.

**Solution** :
```bash
# Créer la migration initiale
npx prisma migrate dev --name init

# Puis exécuter le seed
npm run prisma:seed
```

### Erreur : "Table does not exist"

**Cause** : Les migrations n'ont pas été appliquées.

**Solution** :
```bash
npx prisma migrate dev
```

### Vérifier que l'admin fonctionne

```bash
npm run test-admin
```

Vous devriez voir :
```
✅ User found
✅ Account found
✅ Password verification: SUCCESS
🎉 Admin login should work!
```

## 📝 Code Complet du Seed

```typescript
import { PrismaClient } from '../app/generated/prisma'
import { auth } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Créer les catégories
  console.log('📦 Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'laptops-pc' },
      update: {},
      create: {
        name: 'Laptops & PC',
        slug: 'laptops-pc',
        description: 'High-performance laptops and desktop computers',
        image: '/modern-laptop-workspace.png'
      }
    }),
    // ... autres catégories
  ])

  // 2. Créer l'admin via Better Auth API
  console.log('👤 Creating admin user with Better Auth API...')
  
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@sissan.com' }
  })
  
  if (!adminUser) {
    // Utiliser l'API Better Auth (gère le hash scrypt correctement)
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: 'Admin',
        email: 'admin@sissan.com',
        password: 'admin123'
      }
    })
    
    // Récupérer l'utilisateur créé
    adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sissan.com' }
    })
    
    // Mettre à jour le rôle en ADMIN
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { 
        role: 'ADMIN',
        emailVerified: true
      }
    })
    
    console.log('✅ Admin user created via Better Auth API')
  }

  // 3. Créer les produits
  console.log('🛍️ Creating products...')
  const products = await Promise.all([
    // ... création des produits
  ])

  // 4. Créer les commandes
  console.log('📦 Creating orders...')
  // ... création des commandes

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 🔒 Sécurité : Pourquoi Better Auth utilise Scrypt

Better Auth utilise **scrypt** car c'est un algorithme :
- **Memory-hard** : Résistant aux attaques GPU
- **CPU-intensive** : Lent à calculer (protège contre le brute-force)
- **Recommandé** : Standard moderne pour le hashing de mots de passe

Le hash scrypt a ce format : `salt:derivedKey` (environ 161 caractères)

## 📚 Références

- [Better Auth - Email & Password](https://www.better-auth.com/docs/authentication/email-password)
- [Better Auth - Security](https://www.better-auth.com/docs/reference/security)
- [Prisma - Seeding](https://www.prisma.io/docs/guides/database/seed-database)

## 🚀 Workflow Complet

1. **Première installation**
   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

2. **Reset complet de la DB**
   ```bash
   npm run prisma:reset
   ```

3. **Vérifier que tout fonctionne**
   ```bash
   npm run test-admin
   npm run prisma:studio
   ```

4. **Se connecter à l'application**
   - Aller sur `/sign-in`
   - Email: `admin@sissan.com`
   - Mot de passe: `admin123`
   - Vous serez redirigé vers `/dashboard`

---

**Note** : Ce guide est à jour avec Better Auth v1.3.34 et Prisma v6.19.0
