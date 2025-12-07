# 🔒 Rapport d'Audit de Sécurité - Sissan-Sissan

**Date**: 7 Décembre 2025  
**Version**: 1.0  
**Analysé selon**: [Next.js Data Security Guide](https://nextjs.org/docs/app/guides/data-security), OWASP, Google/Apple Security Guidelines

---

## 📊 Résumé Exécutif

| Catégorie | Statut | Sévérité |
|-----------|--------|----------|
| Authentification | ⚠️ Partiel | Moyenne |
| Autorisation API | 🔴 Critique | Haute |
| Validation des entrées | 🔴 Critique | Haute |
| Protection CSRF | ✅ Correct | - |
| Cookies de session | ✅ Correct | - |
| Data Access Layer | 🔴 Absent | Haute |
| Middleware | 🔴 Absent | Haute |
| CSP Headers | 🔴 Absent | Moyenne |
| Exposition de données | ⚠️ Partiel | Moyenne |

---

## 🚨 VULNÉRABILITÉS CRITIQUES

### 1. Routes API Sans Authentification ni Autorisation

**Sévérité**: 🔴 CRITIQUE

De nombreuses routes API n'ont **AUCUNE** vérification d'authentification ou d'autorisation côté serveur.

#### Routes Vulnérables Identifiées:

| Route | Méthodes | Risque |
|-------|----------|--------|
| `/api/products` | POST | N'importe qui peut créer des produits |
| `/api/orders` | GET, POST | Accès à toutes les commandes, création frauduleuse |
| `/api/orders/[id]` | GET, PATCH, DELETE | Accès/modification de n'importe quelle commande |
| `/api/customers` | GET | Liste de tous les clients exposée |
| `/api/customers/[id]` | GET, PATCH, DELETE | Accès/modification/suppression de n'importe quel client |
| `/api/dashboard/stats` | GET | Statistiques business exposées publiquement |
| `/api/upload` | POST | Upload de fichiers sans authentification |
| `/api/admin/permissions` | GET | Liste des permissions exposée |
| `/api/categories` | POST, PATCH, DELETE | Modification des catégories sans auth |

**Exemple de code vulnérable** (`app/api/products/route.ts`):
```typescript
// ❌ AUCUNE VÉRIFICATION D'AUTHENTIFICATION
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // ... création directe sans vérification
    const product = await prisma.product.create({ data: {...} })
  }
}
```

**Exemple de code vulnérable** (`app/api/orders/route.ts`):
```typescript
// ❌ AUCUNE VÉRIFICATION - Accès à TOUTES les commandes
export async function GET(request: NextRequest) {
  const orders = await prisma.order.findMany({...})
  return NextResponse.json({ data: orders })
}
```

---

### 2. Absence de Middleware de Protection Globale

**Sévérité**: 🔴 CRITIQUE

Il n'existe **AUCUN** fichier `middleware.ts` à la racine du projet pour protéger les routes `/admin` et `/api`.

**Recommandation Next.js**: Utiliser un middleware pour intercepter les requêtes avant qu'elles n'atteignent les routes.

---

### 3. Absence de Validation des Entrées (Input Validation)

**Sévérité**: 🔴 CRITIQUE

- **Pas de bibliothèque de validation** (Zod, Yup, etc.) dans le projet
- Les entrées utilisateur ne sont pas validées contre un schéma strict
- Risque d'injection et de données malformées

**Exemple** (`app/api/orders/route.ts`):
```typescript
// ❌ Pas de validation de schéma
const body = await request.json()
const { userId, items, shippingAddress } = body
// Les données sont utilisées directement sans validation
```

---

### 4. IDOR (Insecure Direct Object Reference)

**Sévérité**: 🔴 CRITIQUE

Les routes avec `[id]` n'ont pas de vérification de propriété.

**Exemple** (`app/api/orders/[id]/route.ts`):
```typescript
// ❌ N'importe qui peut accéder à n'importe quelle commande
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const order = await prisma.order.findUnique({ where: { id } })
  // Pas de vérification: order.userId === currentUser.id
}
```

---

### 5. Authentification Basée sur Header Non-Sécurisée

**Sévérité**: 🔴 HAUTE

**Fichier**: `app/api/user/profile/route.ts`

```typescript
// ❌ EXTRÊMEMENT DANGEREUX - Header peut être falsifié
export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id")
  // Un attaquant peut envoyer n'importe quel userId
}
```

---

## ⚠️ VULNÉRABILITÉS MOYENNES

### 6. Absence de Data Access Layer (DAL)

**Recommandation Next.js**: Créer une couche d'accès aux données centralisée qui:
- Exécute uniquement côté serveur avec `'server-only'`
- Effectue les vérifications d'autorisation
- Retourne des DTOs (Data Transfer Objects) sécurisés

**Actuellement**: Les routes API accèdent directement à Prisma sans couche intermédiaire.

---

### 7. Absence de Package `server-only`

Le package `server-only` n'est pas utilisé dans le projet. Cela empêcherait l'exécution accidentelle de code serveur côté client.

```typescript
// ✅ Devrait être ajouté aux fichiers sensibles
import 'server-only'
```

---

### 8. Absence de Content Security Policy (CSP)

Pas de headers CSP configurés dans `next.config.ts`. Cela expose l'application aux attaques XSS.

---

### 9. Configuration Next.js Permissive

**Fichier**: `next.config.ts`

```typescript
// ❌ Ignore les erreurs ESLint et TypeScript
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true },

// ❌ Images de n'importe quel domaine
images: {
  remotePatterns: [{ protocol: 'https', hostname: '**' }],
}
```

---

### 10. Protection Admin Uniquement Côté Client

**Fichier**: `app/admin/layout.tsx`

```typescript
"use client"
// ⚠️ Protection uniquement côté client - peut être contournée
const hasAdminAccess = user && ['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes((user as any).role)
```

La protection côté client est pour l'UX seulement et **NE PROTÈGE PAS** les routes API.

---

## ✅ POINTS POSITIFS

### 1. Configuration de Session Sécurisée
```typescript
// lib/auth.ts
advanced: {
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookiePrefix: 'sissan',
}
```

### 2. Trusted Origins Configurées
```typescript
trustedOrigins: [
  'http://localhost:3000',
  'https://sissan-sissan.net',
  // ...
]
```

### 3. Système de Permissions Existant
Le fichier `lib/check-permission.ts` existe avec des fonctions de vérification, mais **n'est pas utilisé** dans la majorité des routes API.

### 4. Validation de Type de Fichier Upload
```typescript
// app/api/upload/route.ts
const allowedTypes = ["image/jpeg", "image/png", ...]
```

### 5. Hashage des Mots de Passe
Utilisation de `scrypt` pour le hashage dans `reset-password`.

---

## 🛠️ RECOMMANDATIONS PRIORITAIRES

### PRIORITÉ 1 - CRITIQUE (À faire immédiatement)

#### 1.1 Créer un Middleware Global

```typescript
// middleware.ts (racine du projet)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Protéger les routes admin et API sensibles
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Vérifier le cookie de session
    const sessionToken = request.cookies.get('sissan.session_token')
    
    if (!sessionToken) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/products/:path*', '/api/orders/:path*', '/api/customers/:path*']
}
```

#### 1.2 Ajouter Authentification à TOUTES les Routes API Sensibles

```typescript
// Exemple pour app/api/products/route.ts
import { auth } from "@/lib/auth"
import { checkPermission } from "@/lib/check-permission"

export async function POST(request: NextRequest) {
  // ✅ Vérifier l'authentification
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // ✅ Vérifier les permissions
  const { authorized, error } = await checkPermission(request, 'products', 'canCreate')
  if (!authorized) {
    return NextResponse.json({ error }, { status: 403 })
  }
  
  // ... reste du code
}
```

#### 1.3 Installer et Utiliser Zod pour la Validation

```bash
npm install zod
```

```typescript
// lib/validations/product.ts
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  price: z.number().positive(),
  categoryId: z.string().cuid(),
  // ...
})

// Dans la route API
const result = createProductSchema.safeParse(body)
if (!result.success) {
  return NextResponse.json({ error: result.error.issues }, { status: 400 })
}
```

#### 1.4 Corriger la Route Profile

```typescript
// app/api/user/profile/route.ts
export async function GET(request: NextRequest) {
  // ✅ Utiliser la session au lieu du header
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  // ...
}
```

---

### PRIORITÉ 2 - HAUTE (Cette semaine)

#### 2.1 Créer un Data Access Layer

```typescript
// lib/dal/orders.ts
import 'server-only'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function getOrderById(orderId: string, request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return null
  
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })
  
  // Vérifier la propriété
  if (order?.userId !== session.user.id) {
    // Vérifier si admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
      return null
    }
  }
  
  return order
}
```

#### 2.2 Installer `server-only`

```bash
npm install server-only
```

#### 2.3 Ajouter les Headers de Sécurité

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  // ...
}
```

---

### PRIORITÉ 3 - MOYENNE (Ce mois)

#### 3.1 Activer ESLint et TypeScript

```typescript
// next.config.ts
eslint: { ignoreDuringBuilds: false },
typescript: { ignoreBuildErrors: false },
```

#### 3.2 Restreindre les Domaines d'Images

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'sissan-sissan.net' },
    // Ajouter uniquement les domaines nécessaires
  ],
}
```

#### 3.3 Implémenter Rate Limiting

```typescript
// Utiliser une solution comme @upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit'
```

#### 3.4 Ajouter des Logs d'Audit

Pour les actions sensibles (suppression, modification de rôle, etc.).

---

## 📋 CHECKLIST DE CONFORMITÉ

### Next.js Data Security Guidelines

| Règle | Statut | Action |
|-------|--------|--------|
| Data Access Layer isolé | ❌ | Créer `/lib/dal/` |
| `server-only` sur code sensible | ❌ | Installer et utiliser |
| Validation des entrées | ❌ | Implémenter Zod |
| Vérification auth dans Server Actions | ⚠️ | Renforcer |
| Params dynamiques validés | ❌ | Ajouter validation |
| Éviter données sensibles dans props | ⚠️ | Auditer composants |

### OWASP Top 10

| Vulnérabilité | Statut |
|---------------|--------|
| A01 - Broken Access Control | 🔴 Vulnérable |
| A02 - Cryptographic Failures | ✅ OK |
| A03 - Injection | ⚠️ Risque (Prisma aide) |
| A04 - Insecure Design | 🔴 Vulnérable |
| A05 - Security Misconfiguration | ⚠️ Partiel |
| A06 - Vulnerable Components | À vérifier |
| A07 - Auth Failures | 🔴 Vulnérable |
| A08 - Data Integrity | ⚠️ Partiel |
| A09 - Logging & Monitoring | ❌ Absent |
| A10 - SSRF | ⚠️ À vérifier |

---

## 🔐 ROUTES À SÉCURISER EN PRIORITÉ

1. `POST /api/products` - Création produit
2. `GET/POST /api/orders` - Commandes
3. `PATCH/DELETE /api/orders/[id]` - Modification commandes
4. `GET /api/customers` - Liste clients
5. `PATCH/DELETE /api/customers/[id]` - Modification clients
6. `GET /api/dashboard/stats` - Statistiques
7. `POST /api/upload` - Upload fichiers
8. `PUT/DELETE /api/admin/staff/[id]` - Gestion staff

---

## 📚 Ressources

- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication)
- [OWASP Top 10](https://owasp.org/Top10/)
- [Google Security Guidelines](https://developers.google.com/identity/protocols/oauth2/policies)
- [Apple Security Guidelines](https://developer.apple.com/security/)

---

**Rapport généré par**: Cascade AI  
**Pour**: Moussa Kone & Aboubakar Sidibe (Kris Beat)  
**Projet**: Sissan-Sissan E-commerce
