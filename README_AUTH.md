# 🔐 Authentification - Guide Rapide

## 🎯 Solution au Problème "Invalid password hash"

### Cause du Problème
Better Auth utilise **scrypt** pour hasher les mots de passe, pas bcrypt. Nos hashes bcrypt dans le seed ne fonctionnent pas!

### Solution en 3 Commandes

```bash
# Terminal 1
npx prisma migrate reset --force
npm run dev

# Terminal 2 (attendre que le serveur démarre)
npx tsx scripts/create-auth-accounts.ts
```

Puis se connecter sur `/signin` avec:
- Email: `admin@sissan.com`
- Password: `admin123`

## 📊 Comparaison

| Méthode | Hash | Fonctionne? |
|---------|------|-------------|
| Seed avec bcrypt | `$2b$10$...` | ❌ Non |
| Seed avec scrypt | `$scrypt$...` | ❌ Difficile |
| API Better Auth | scrypt (auto) | ✅ Oui! |

## 🔄 Workflow

```
1. Seed (prisma/seed.ts)
   └── Crée User (sans Account)
       └── password: '' (vide)

2. Script (create-auth-accounts.ts)
   └── POST /api/auth/sign-up/email
       └── Better Auth crée Account
           └── password: scrypt hash ✅

3. Login
   └── POST /api/auth/sign-in/email
       └── Better Auth vérifie scrypt hash ✅
```

## ✅ Vérification

Après `create-auth-accounts.ts`:

```bash
npx tsx scripts/check-accounts.ts
```

Résultat:
```
Total accounts in database: 11 ✅
```

## 🚀 Démarrage Rapide

```bash
# 1. Reset
npx prisma migrate reset --force

# 2. Dev server (terminal 1)
npm run dev

# 3. Create accounts (terminal 2)
npx tsx scripts/create-auth-accounts.ts

# 4. Login
# → http://localhost:3000/signin
# → admin@sissan.com / admin123
```

## 📝 Fichiers Importants

- `SETUP_GUIDE.md` - Guide complet
- `LOGINS.md` - Liste des comptes
- `TROUBLESHOOTING.md` - Dépannage
- `scripts/create-auth-accounts.ts` - Script de création

## 🎊 C'est Tout!

Better Auth + scrypt = Comptes fonctionnels! 🎉
