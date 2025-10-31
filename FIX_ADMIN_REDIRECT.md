# 🔧 Fix: Redirection Admin

## ❌ Problème

Lors de la connexion avec un compte admin, la redirection allait toujours vers `/account` au lieu de `/admin`.

## 🔍 Cause

La fonction `signIn` de Better Auth ne retourne pas directement les données de l'utilisateur avec le rôle. Il faut récupérer la session après la connexion.

## ✅ Solution

### Avant (Ne fonctionnait pas)

```typescript
const result = await signIn(email, password)
const userRole = (result.data?.user as any)?.role  // ❌ Toujours undefined
if (userRole === "ADMIN") {
  router.push("/admin")
} else {
  router.push("/account")
}
```

### Après (Fonctionne)

```typescript
const result = await signIn(email, password)

// Attendre que la session se mette à jour
await new Promise(resolve => setTimeout(resolve, 500))

// Récupérer le rôle depuis l'API
const response = await fetch('/api/auth/get-session')
const sessionData = await response.json()
const userRole = sessionData?.user?.role  // ✅ Récupère le bon rôle

if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
  router.push("/admin")
} else {
  router.push("/account")
}
```

## 📋 Changements Effectués

### 1. Fonction `handleSubmit` (Connexion normale)

```typescript
// signin/page.tsx ligne 41-58
if (result.error) {
  // Erreur...
} else {
  toast({ title: "Connexion réussie" })
  
  // ✅ Attendre que la session se mette à jour
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // ✅ Récupérer le rôle depuis l'API
  try {
    const response = await fetch('/api/auth/get-session')
    const sessionData = await response.json()
    const userRole = sessionData?.user?.role
    
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      router.push("/admin")
    } else {
      router.push("/account")
    }
  } catch (error) {
    router.push("/account")  // Fallback
  }
}
```

### 2. Fonction `handleQuickLogin` (Connexion rapide)

```typescript
// signin/page.tsx ligne 109-125
if (result.error) {
  // Erreur...
} else {
  // ✅ Attendre que la session se mette à jour
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // ✅ Récupérer le rôle depuis l'API
  try {
    const response = await fetch('/api/auth/get-session')
    const sessionData = await response.json()
    const userRole = sessionData?.user?.role
    
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      router.push("/admin")
    } else {
      router.push("/")
    }
  } catch (error) {
    router.push(role === "admin" ? "/admin" : "/")
  }
}
```

## 🔄 Flux Complet

```
1. User entre credentials
   └── signIn(email, password)

2. Better Auth authentifie
   └── Crée la session

3. ⏱️ Attendre 500ms
   └── Laisser le temps à la session de se propager

4. 🔍 Récupérer la session
   └── fetch('/api/auth/get-session')

5. 📊 Analyser le rôle
   └── sessionData.user.role

6. 🔀 Rediriger selon le rôle
   ├── ADMIN/SUPER_ADMIN → /admin
   └── CUSTOMER → /account
```

## 🚀 Test

### Test Admin

```bash
# 1. Se connecter
Email: admin@sissan.com
Password: admin123

# 2. Observer
→ Toast "Connexion réussie"
→ Attente 500ms
→ Récupération du rôle
→ Redirection vers /admin ✅
→ Puis vers /admin/dashboard ✅
```

### Test Customer

```bash
# 1. Se connecter
Email: customer1@example.com
Password: customer123

# 2. Observer
→ Toast "Connexion réussie"
→ Attente 500ms
→ Récupération du rôle
→ Redirection vers /account ✅
```

### Test Quick Login Admin

```bash
# 1. Cliquer sur "Quick Admin Login"

# 2. Observer
→ Connexion automatique
→ Attente 500ms
→ Récupération du rôle
→ Redirection vers /admin ✅
```

## 📊 API Better Auth

### Endpoint: `/api/auth/get-session`

**Réponse**:
```json
{
  "user": {
    "id": "clx123...",
    "email": "admin@sissan.com",
    "name": "Admin User",
    "role": "ADMIN",
    "emailVerified": true
  },
  "session": {
    "token": "...",
    "expiresAt": "..."
  }
}
```

## ⚠️ Points Importants

### 1. Délai de 500ms

Le délai est nécessaire car Better Auth met à jour la session de manière asynchrone. Sans ce délai, la session pourrait ne pas être encore disponible.

### 2. Gestion des Erreurs

Un fallback est prévu en cas d'erreur lors de la récupération de la session:
- Admin → `/admin`
- Customer → `/account`

### 3. Fallback Sécurisé

Si l'API ne répond pas ou retourne une erreur, on redirige vers `/account` par défaut pour éviter les erreurs.

## ✅ Résultat

- ✅ **Admin** → Redirigé vers `/admin` puis `/admin/dashboard`
- ✅ **Customer** → Redirigé vers `/account`
- ✅ **Quick Login** → Fonctionne correctement
- ✅ **Gestion d'erreurs** → Fallback en place

## 🎊 Conclusion

La redirection basée sur le rôle fonctionne maintenant correctement en récupérant la session après la connexion au lieu de se fier au résultat direct de `signIn`.

**Le problème est résolu!** 🎉
