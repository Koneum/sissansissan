# 🔄 Redirections Authentification

## ✅ Implémentation Complète

### 📋 Redirections Configurées

#### Après Connexion (Sign In)

```typescript
// signin/page.tsx
const userRole = (result.data?.user as any)?.role

if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
  router.push("/admin")  // ✅ Admin → Page Admin
} else {
  router.push("/account")           // ✅ User → Compte
}
```

| Rôle | Redirection |
|------|-------------|
| ADMIN | `/admin` |
| SUPER_ADMIN | `/admin` |
| CUSTOMER | `/account` |

#### Après Inscription (Sign Up)

```typescript
// Tous les nouveaux utilisateurs → /account
router.push("/account")
```

Tous les nouveaux utilisateurs sont créés avec le rôle `CUSTOMER` par défaut et sont redirigés vers leur page de compte.

## 📄 Pages Créées

### 1. Page "Forgot Password" ✅

**Route**: `/forgot-password`

**Fonctionnalités**:
- ✅ Formulaire d'envoi d'email
- ✅ Confirmation visuelle après envoi
- ✅ Lien de retour vers la connexion
- ✅ Option de renvoi d'email
- ✅ Design cohérent avec la page de connexion

**État actuel**: Interface complète (backend à implémenter avec Better Auth)

### 2. Page Account ✅

**Route**: `/account`

**Fonctionnalités**:
- ✅ Profil utilisateur
- ✅ Historique des commandes
- ✅ Paramètres
- ✅ Déconnexion

## 🔐 Flux d'Authentification Complet

### Connexion

```
1. User entre email + password
   └── POST /api/auth/sign-in/email

2. Better Auth vérifie les credentials
   └── Retourne user avec role

3. Redirection basée sur le rôle:
   ├── ADMIN/SUPER_ADMIN → /admin
   └── CUSTOMER → /account
```

### Inscription

```
1. User entre name + email + password
   └── POST /api/auth/sign-up/email

2. Better Auth crée:
   ├── User (role: CUSTOMER par défaut)
   ├── Account (password scrypt)
   └── Session

3. Redirection:
   └── /account (tous les nouveaux users)
```

### Mot de Passe Oublié

```
1. User entre email
   └── /forgot-password

2. Envoi email de réinitialisation
   └── (À implémenter avec Better Auth)

3. User clique sur le lien dans l'email
   └── /reset-password?token=xxx

4. User entre nouveau password
   └── Redirection vers /signin
```

## 🎯 Workflow Utilisateur

### Nouveau Client

```
1. /signin → Cliquer "S'inscrire"
2. Remplir formulaire
3. ✅ Compte créé (role: CUSTOMER)
4. → Redirection /account
5. Accès à:
   - Profil
   - Commandes
   - Wishlist
   - Panier
```

### Admin

```
1. S'inscrire normalement
2. Exécuter: npx tsx scripts/set-admin-role.ts admin@sissan.com
3. Se reconnecter
4. → Redirection /admin
5. Accès à:
   - Dashboard
   - Produits
   - Commandes
   - Clients
   - Statistiques
```

## 📝 Fichiers Modifiés

### 1. `app/signin/page.tsx`
- ✅ Ajout redirection basée sur le rôle après connexion
- ✅ Redirection vers /account après inscription

### 2. `app/forgot-password/page.tsx` (NOUVEAU)
- ✅ Page complète de récupération de mot de passe
- ✅ Interface utilisateur
- ✅ Gestion des états (formulaire/confirmation)

### 3. `lib/auth-context.tsx`
- ✅ Ajout du champ `data` dans le type de retour
- ✅ Support de la récupération du rôle utilisateur

## 🚀 Utilisation

### Test des Redirections

#### Test Admin
```bash
# 1. S'inscrire
Email: admin@sissan.com
Password: admin123

# 2. Définir comme admin
npx tsx scripts/set-admin-role.ts admin@sissan.com

# 3. Se reconnecter
→ Redirection vers /admin ✅
```

#### Test Customer
```bash
# 1. S'inscrire
Email: user@example.com
Password: user123

# 2. Connexion automatique
→ Redirection vers /account ✅
```

#### Test Forgot Password
```bash
# 1. Aller sur /signin
# 2. Cliquer "Forgot Password?"
# 3. Entrer email
# 4. Voir confirmation
→ Page /forgot-password ✅
```

## 🔄 Prochaines Étapes (Optionnel)

### 1. Implémenter Reset Password avec Better Auth
```typescript
// À ajouter dans lib/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  // ... config existante
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
  },
  // Ajouter reset password
})
```

### 2. Créer la page Reset Password
```
/app/reset-password/page.tsx
- Formulaire nouveau mot de passe
- Validation du token
- Confirmation
```

### 3. Configurer l'envoi d'emails
```
- Utiliser un service SMTP (SendGrid, Mailgun, etc.)
- Configurer Better Auth pour l'envoi d'emails
- Templates d'emails personnalisés
```

## ✅ Résumé

- ✅ Redirections basées sur le rôle après connexion
- ✅ Redirection vers /account après inscription
- ✅ Page "Forgot Password" créée et stylisée
- ✅ Page Account existante et fonctionnelle
- ✅ Flux d'authentification complet

**Tout est prêt pour l'utilisation!** 🎉
