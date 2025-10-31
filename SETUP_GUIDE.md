# 🚀 Guide de Configuration - Authentification

## ⚠️ IMPORTANT: Better Auth utilise SCRYPT, pas BCRYPT!

Better Auth utilise **scrypt** pour hasher les mots de passe, pas bcrypt. C'est pourquoi nous ne pouvons pas pré-hasher les mots de passe dans le seed.

## 📋 Procédure Complète

### Étape 1: Réinitialiser la Base de Données

```bash
npx prisma migrate reset --force
```

Cela crée:
- ✅ Les tables (User, Account, Session)
- ✅ Les utilisateurs de base (sans mot de passe)
- ✅ Les catégories et produits

### Étape 2: Démarrer le Serveur

```bash
npm run dev
```

**Gardez ce terminal ouvert!**

### Étape 3: Créer les Comptes via l'API Better Auth

Dans un **nouveau terminal**, exécutez:

```bash
npx tsx scripts/create-auth-accounts.ts
```

Ce script va:
- ✅ Créer les comptes Account via l'API Better Auth
- ✅ Utiliser le bon hachage (scrypt)
- ✅ Créer 11 comptes (1 admin + 10 clients)

Résultat attendu:
```
🔐 Creating authentication accounts...

✅ admin@sissan.com
✅ customer1@example.com
✅ customer2@example.com
...
✅ customer10@example.com

📊 Summary:
   ✅ Success: 11
   ❌ Failed: 0

🎉 Done! You can now login with these accounts.
```

### Étape 4: Se Connecter

1. Aller sur `http://localhost:3000/signin`
2. Utiliser les identifiants:
   - **Admin**: `admin@sissan.com` / `admin123`
   - **Client**: `customer1@example.com` / `customer123`
3. Cliquer sur **"Se connecter"**
4. ✅ Connecté!

## 🔑 Comptes Disponibles

| Email | Password | Rôle |
|-------|----------|------|
| `admin@sissan.com` | `admin123` | ADMIN |
| `customer1@example.com` | `customer123` | CUSTOMER |
| `customer2@example.com` | `customer123` | CUSTOMER |
| ... | ... | ... |
| `customer10@example.com` | `customer123` | CUSTOMER |

## 🔐 Pourquoi cette approche?

### Problème avec le Seed Direct

```typescript
// ❌ NE FONCTIONNE PAS
await prisma.account.create({
  password: '$2b$10$...' // Hash bcrypt
})
// Better Auth utilise scrypt, pas bcrypt!
```

### Solution: API Better Auth

```typescript
// ✅ FONCTIONNE
await fetch('/api/auth/sign-up/email', {
  method: 'POST',
  body: JSON.stringify({
    email: 'admin@sissan.com',
    password: 'admin123', // Better Auth hashera avec scrypt
    name: 'Admin User'
  })
})
```

## 📊 Architecture

```
Seed (prisma/seed.ts)
├── Crée User (sans Account)
│   ├── email: admin@sissan.com
│   ├── role: ADMIN
│   └── password: '' (vide)
└── Crée catégories, produits, etc.

Script (scripts/create-auth-accounts.ts)
├── Appelle /api/auth/sign-up/email
├── Better Auth crée Account
│   ├── password: scrypt hash
│   └── providerId: 'credential'
└── Lie Account → User
```

## 🛠️ Commandes Utiles

```bash
# Réinitialiser tout
npx prisma migrate reset --force

# Démarrer le serveur
npm run dev

# Créer les comptes (dans un autre terminal)
npx tsx scripts/create-auth-accounts.ts

# Vérifier les comptes
npx tsx scripts/check-accounts.ts
```

## ❓ FAQ

### Q: Pourquoi ne pas utiliser bcrypt?
**R**: Better Auth utilise scrypt par défaut. C'est un choix de la librairie.

### Q: Puis-je pré-hasher les mots de passe?
**R**: Non, Better Auth doit gérer le hachage lui-même avec scrypt.

### Q: Comment créer un nouveau compte?
**R**: Via la page `/signin` → "S'inscrire" avec un nouvel email.

### Q: Les comptes du seed fonctionnent-ils directement?
**R**: Non, vous devez exécuter `create-auth-accounts.ts` après le seed.

## 🎯 Workflow Complet

```bash
# Terminal 1
npx prisma migrate reset --force
npm run dev

# Terminal 2 (attendre que le serveur démarre)
npx tsx scripts/create-auth-accounts.ts

# Navigateur
# → http://localhost:3000/signin
# → Email: admin@sissan.com
# → Password: admin123
# → Se connecter
```

## ✅ Vérification

Après avoir exécuté `create-auth-accounts.ts`:

```bash
npx tsx scripts/check-accounts.ts
```

Résultat attendu:
```
User: admin@sissan.com
  - Accounts: 1
    - Provider: credential, AccountId: admin@sissan.com

Total accounts in database: 11
```

## 🚨 Dépannage

### Erreur: "Invalid password hash"
**Cause**: Vous avez des hashes bcrypt au lieu de scrypt

**Solution**:
```bash
npx prisma migrate reset --force
npm run dev
npx tsx scripts/create-auth-accounts.ts
```

### Erreur: "Email already exists" (422)
**Cause**: Le compte existe déjà

**Solution**: Utilisez la connexion, pas l'inscription

### Erreur: "Connection refused"
**Cause**: Le serveur dev n'est pas démarré

**Solution**: Lancez `npm run dev` d'abord

## 📝 Résumé

1. ✅ Better Auth utilise **scrypt** (pas bcrypt)
2. ✅ Le seed crée les Users (sans Account)
3. ✅ Le script `create-auth-accounts.ts` crée les Accounts via l'API
4. ✅ Better Auth hashe les mots de passe avec scrypt
5. ✅ Les comptes sont prêts à l'emploi

**C'est la seule façon de créer des comptes fonctionnels avec Better Auth!**
