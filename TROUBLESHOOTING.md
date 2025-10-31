# 🔧 Dépannage - Authentification

## Erreur: POST /api/auth/sign-up/email 422

### Cause
L'erreur 422 (Unprocessable Entity) lors du sign-up signifie généralement que:
- ✅ **L'email existe déjà** dans la base de données
- ❌ Vous essayez de créer un compte qui existe déjà

### Solution

#### Si vous voulez utiliser un compte existant (du seed):
**Utilisez la CONNEXION, pas l'inscription!**

1. Sur `/signin`, restez en mode **"Se connecter"**
2. Entrez les identifiants:
   - Email: `admin@sissan.com`
   - Password: `admin123`
3. Cliquez sur **"Se connecter"** (pas "S'inscrire")

#### Si vous voulez créer un NOUVEAU compte:
Utilisez un email qui n'existe pas encore:

1. Cliquez sur **"Pas de compte? S'inscrire"**
2. Utilisez un nouvel email:
   - Email: `nouveauuser@example.com` (pas admin@sissan.com!)
   - Password: `password123`
   - Nom: `Nouveau User`
3. Cliquez sur **"S'inscrire"**

## Comptes Pré-créés (Seed)

Ces comptes existent déjà et doivent utiliser **CONNEXION**:

| Email | Password | Action |
|-------|----------|--------|
| `admin@sissan.com` | `admin123` | **SE CONNECTER** |
| `customer1@example.com` | `customer123` | **SE CONNECTER** |
| `customer2@example.com` | `customer123` | **SE CONNECTER** |
| ... | ... | ... |
| `customer10@example.com` | `customer123` | **SE CONNECTER** |

## Autres Erreurs Courantes

### Erreur: "Invalid password hash"
**Cause**: Le compte Account n'a pas été créé correctement

**Solution**:
```bash
npx prisma migrate reset --force
```

### Erreur: "Credential account not found"
**Cause**: Le compte User existe mais pas le Account

**Solution**:
```bash
npx prisma migrate reset --force
```

### Erreur: "Email already exists"
**Cause**: Vous essayez de créer un compte avec un email déjà utilisé

**Solution**: Utilisez la connexion au lieu de l'inscription

### Erreur: "Invalid email or password"
**Cause**: Mauvais email ou mauvais mot de passe

**Solution**: Vérifiez les identifiants dans `LOGINS.md`

## Vérifier l'État de la Base

### Vérifier les comptes
```bash
npx tsx scripts/check-accounts.ts
```

Résultat attendu:
```
Total accounts in database: 11
```

### Tester l'authentification
```bash
npx tsx scripts/test-auth.ts
```

Résultat attendu:
```
✅ User found: admin@sissan.com
   Role: ADMIN
   Accounts: 1
🔐 Password test (admin123): ✅ Valid
```

## Réinitialiser Complètement

Si rien ne fonctionne:

```bash
# 1. Réinitialiser la base
npx prisma migrate reset --force

# 2. Vérifier les comptes
npx tsx scripts/check-accounts.ts

# 3. Tester
npx tsx scripts/test-auth.ts

# 4. Démarrer le serveur
npm run dev

# 5. Se connecter (pas s'inscrire!) avec admin@sissan.com / admin123
```

## Différence Sign-In vs Sign-Up

### Sign-In (Connexion) ✅
- **Utiliser pour**: Comptes qui existent déjà
- **Comptes du seed**: admin@sissan.com, customer1-10@example.com
- **Action**: Vérifie email + password dans la base

### Sign-Up (Inscription) ✅
- **Utiliser pour**: Créer un NOUVEAU compte
- **Email**: Doit être unique (pas déjà dans la base)
- **Action**: Crée User + Account + Session

## Workflow Correct

### Première Utilisation
```
1. npx prisma migrate reset --force
   → Crée 11 comptes (admin + 10 clients)

2. Aller sur /signin
   → Mode "Se connecter" (pas "S'inscrire")

3. Email: admin@sissan.com
   Password: admin123
   → Cliquer "Se connecter"

4. ✅ Connecté en tant qu'admin!
```

### Créer un Nouveau Compte
```
1. Aller sur /signin
   → Cliquer "Pas de compte? S'inscrire"

2. Email: monnouvelemail@example.com (NOUVEAU!)
   Password: monpassword
   Nom: Mon Nom
   → Cliquer "S'inscrire"

3. ✅ Compte créé et connecté!
```

## Logs Utiles

Si vous voyez ces erreurs dans la console:

### `422 Unprocessable Entity`
→ Email existe déjà, utilisez la connexion

### `401 Unauthorized`
→ Mauvais email ou password

### `500 Internal Server Error`
→ Problème de configuration, vérifiez les logs serveur

### `404 Not Found`
→ Route API incorrecte, vérifiez `/api/auth/[...all]/route.ts`

## Commandes de Debug

```bash
# Voir tous les users
npx prisma studio
# → Ouvrir la table "user" et "account"

# Logs du serveur
# → Regarder la console où tourne `npm run dev`

# Vérifier la config Prisma
npx prisma validate

# Régénérer le client Prisma
npx prisma generate
```

## Support

Si le problème persiste:

1. Vérifiez les logs du serveur (console npm run dev)
2. Vérifiez la base de données (npx prisma studio)
3. Réinitialisez complètement (npx prisma migrate reset --force)
4. Vérifiez que vous utilisez bien CONNEXION pour les comptes du seed

## Résumé

- ✅ **Comptes du seed** → Utilisez **CONNEXION**
- ✅ **Nouveaux comptes** → Utilisez **INSCRIPTION**
- ✅ **Erreur 422** → Email existe déjà, utilisez connexion
- ✅ **En cas de doute** → Réinitialisez avec `npx prisma migrate reset --force`
