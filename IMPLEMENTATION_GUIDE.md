# Guide d'Implémentation Rapide - Système de Permissions

## 🚀 Démarrage Rapide

### Étape 1: Initialiser les Permissions dans la Base de Données

```bash
npx tsx prisma/seed-permissions.ts
```

Cette commande va créer toutes les permissions nécessaires dans votre base de données.

### Étape 2: Créer des Utilisateurs avec Permissions

1. Connectez-vous en tant qu'ADMIN
2. Allez dans **Settings > Gestion du Personnel**
3. Cliquez sur **Ajouter un Membre**
4. Remplissez les informations :
   - Nom complet
   - Email
   - Mot de passe
   - Rôle (PERSONNEL, MANAGER, ou ADMIN)
5. Allez dans l'onglet **Permissions**
6. Cochez les permissions appropriées pour chaque catégorie
7. Cliquez sur **Créer l'Utilisateur**

### Étape 3: Protéger vos Pages

Pour chaque page admin, ajoutez le `PagePermissionGuard` :

```tsx
// Avant
export default function ProductsPage() {
  return (
    <div>
      {/* Contenu */}
    </div>
  )
}

// Après
import { PagePermissionGuard } from "@/components/page-permission-guard"

export default function ProductsPage() {
  return (
    <PagePermissionGuard category="products" action="view">
      <div>
        {/* Contenu */}
      </div>
    </PagePermissionGuard>
  )
}
```

### Étape 4: Protéger les Boutons d'Action

Remplacez les boutons standards par `PermissionButton` :

```tsx
// Avant
import { Button } from "@/components/ui/button"

<Button onClick={handleCreate}>
  Ajouter
</Button>

// Après
import { PermissionButton } from "@/components/permission-button"

<PermissionButton 
  category="products" 
  action="create"
  onClick={handleCreate}
>
  Ajouter
</PermissionButton>
```

## 📋 Pages à Mettre à Jour

Voici la liste des pages admin qui doivent être protégées :

### ✅ Déjà Implémenté

- [x] `/app/admin/settings/users/page.tsx` - Gestion du personnel
- [x] `/app/admin/products/page.tsx` - Liste des produits

### 🔄 À Implémenter

- [ ] `/app/admin/dashboard/page.tsx` - Dashboard
- [ ] `/app/admin/orders/page.tsx` - Commandes
- [ ] `/app/admin/customers/page.tsx` - Clients
- [ ] `/app/admin/categories/page.tsx` - Catégories
- [ ] `/app/admin/reviews/page.tsx` - Avis
- [ ] `/app/admin/coupons/page.tsx` - Coupons
- [ ] `/app/admin/settings/page.tsx` - Paramètres
- [ ] `/app/admin/customization/*` - Pages de personnalisation
- [ ] `/app/admin/products/add/page.tsx` - Ajouter un produit
- [ ] `/app/admin/products/edit/[id]/page.tsx` - Modifier un produit
- [ ] `/app/admin/categories/add/page.tsx` - Ajouter une catégorie

## 🎯 Template de Page Protégée

Utilisez ce template pour protéger rapidement une page :

```tsx
"use client"

import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
import { useRouter } from "next/navigation"

export default function YourPage() {
  const router = useRouter()

  return (
    <PagePermissionGuard category="YOUR_CATEGORY" action="view">
      <div className="space-y-6">
        {/* Header avec bouton d'action */}
        <div className="flex justify-between items-center">
          <h1>Titre de la Page</h1>
          
          <PermissionButton 
            category="YOUR_CATEGORY" 
            action="create"
            onClick={() => router.push('/admin/your-category/add')}
          >
            Ajouter
          </PermissionButton>
        </div>

        {/* Contenu principal */}
        <div>
          {/* Votre contenu ici */}
        </div>

        {/* Actions sur les items */}
        <div className="flex gap-2">
          <PermissionButton
            category="YOUR_CATEGORY"
            action="edit"
            variant="outline"
            onClick={() => handleEdit()}
          >
            Modifier
          </PermissionButton>
          
          <PermissionButton
            category="YOUR_CATEGORY"
            action="delete"
            variant="destructive"
            onClick={() => handleDelete()}
          >
            Supprimer
          </PermissionButton>
        </div>
      </div>
    </PagePermissionGuard>
  )
}
```

## 🔧 Catégories Disponibles

Remplacez `YOUR_CATEGORY` par l'une de ces valeurs :

- `dashboard` - Pour le tableau de bord
- `products` - Pour les produits
- `orders` - Pour les commandes
- `customers` - Pour les clients
- `categories` - Pour les catégories
- `reviews` - Pour les avis
- `coupons` - Pour les coupons
- `settings` - Pour les paramètres
- `staff` - Pour la gestion du personnel
- `customization` - Pour la personnalisation

## 🎨 Exemples par Type de Page

### Page Liste (Index)

```tsx
<PagePermissionGuard category="products" action="view">
  <div>
    <PermissionButton category="products" action="create">
      Ajouter
    </PermissionButton>
    
    {/* Liste avec actions */}
    {items.map(item => (
      <div key={item.id}>
        <PermissionButton category="products" action="edit">
          Modifier
        </PermissionButton>
        <PermissionButton category="products" action="delete">
          Supprimer
        </PermissionButton>
      </div>
    ))}
  </div>
</PagePermissionGuard>
```

### Page Création (Add)

```tsx
<PagePermissionGuard category="products" action="create">
  <form onSubmit={handleSubmit}>
    {/* Formulaire */}
    <PermissionButton category="products" action="create" type="submit">
      Créer
    </PermissionButton>
  </form>
</PagePermissionGuard>
```

### Page Modification (Edit)

```tsx
<PagePermissionGuard category="products" action="edit">
  <form onSubmit={handleSubmit}>
    {/* Formulaire */}
    <PermissionButton category="products" action="edit" type="submit">
      Enregistrer
    </PermissionButton>
  </form>
</PagePermissionGuard>
```

## 🧪 Tests

### Tester les Permissions

1. **Créer un utilisateur PERSONNEL** avec permissions limitées :
   - ✅ Products: Voir uniquement
   - ❌ Products: Créer, Modifier, Supprimer

2. **Se connecter avec cet utilisateur**

3. **Vérifier** :
   - ✅ La page produits s'affiche
   - ❌ Le bouton "Ajouter" est désactivé
   - ❌ Les boutons "Modifier" et "Supprimer" sont désactivés
   - ✅ Un tooltip s'affiche au survol des boutons désactivés

4. **Donner la permission "Créer"**

5. **Vérifier** :
   - ✅ Le bouton "Ajouter" est maintenant actif
   - ✅ L'utilisateur peut accéder à la page d'ajout

### Scénarios de Test

#### Scénario 1: Personnel de Vente
```
Rôle: PERSONNEL
Permissions:
  - Products: Voir, Créer
  - Orders: Voir, Créer, Modifier
  - Customers: Voir

Résultat attendu:
  ✅ Peut voir les produits
  ✅ Peut ajouter des produits
  ❌ Ne peut pas modifier/supprimer des produits
  ✅ Peut gérer les commandes
  ✅ Peut voir les clients
  ❌ Ne peut pas accéder aux paramètres
```

#### Scénario 2: Manager
```
Rôle: MANAGER
Permissions:
  - Products: Toutes
  - Orders: Toutes
  - Customers: Toutes
  - Reviews: Voir, Modifier
  - Settings: Voir

Résultat attendu:
  ✅ Accès complet aux produits, commandes, clients
  ✅ Peut modérer les avis
  ✅ Peut voir les paramètres
  ❌ Ne peut pas modifier les paramètres
  ❌ Ne peut pas gérer le personnel
```

## 🔒 Sécurité - Vérifications Côté Serveur

**IMPORTANT**: Toujours vérifier les permissions côté serveur !

### Template pour API Route

```typescript
// app/api/products/route.ts
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  // 1. Vérifier l'authentification
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // 2. Récupérer l'utilisateur avec ses permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { 
      permissions: { 
        include: { permission: true } 
      } 
    }
  })

  // 3. Vérifier si ADMIN/SUPER_ADMIN (accès automatique)
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    // Continuer...
  } else {
    // 4. Vérifier la permission spécifique
    const hasPermission = user.permissions.some(
      up => up.permission.category === 'products' && up.canCreate
    )
    
    if (!hasPermission) {
      return new Response("Forbidden", { status: 403 })
    }
  }

  // 5. Continuer avec la logique métier
  // ...
}
```

### Helper Function pour Vérification

Créez un helper pour simplifier les vérifications :

```typescript
// lib/check-permission.ts
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function checkPermission(
  request: Request,
  category: string,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'
): Promise<{ authorized: boolean; user?: any }> {
  const session = await auth.api.getSession({ headers: request.headers })
  
  if (!session?.user) {
    return { authorized: false }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { permissions: { include: { permission: true } } }
  })

  // ADMIN et SUPER_ADMIN ont tous les droits
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return { authorized: true, user }
  }

  // Vérifier la permission spécifique
  const hasPermission = user.permissions.some(
    up => up.permission.category === category && up[action]
  )

  return { authorized: hasPermission, user }
}

// Utilisation
export async function POST(request: Request) {
  const { authorized, user } = await checkPermission(request, 'products', 'canCreate')
  
  if (!authorized) {
    return new Response("Forbidden", { status: 403 })
  }

  // Continuer...
}
```

## 📝 Checklist Finale

Avant de considérer l'implémentation complète :

- [ ] Permissions seedées dans la DB
- [ ] Au moins un utilisateur test créé avec permissions limitées
- [ ] Toutes les pages admin protégées avec `PagePermissionGuard`
- [ ] Tous les boutons d'action utilisent `PermissionButton`
- [ ] Navigation filtrée selon les permissions (sidebar)
- [ ] Vérifications côté serveur implémentées dans les API routes
- [ ] Tests effectués avec différents rôles
- [ ] Documentation lue et comprise

## 🆘 Support

En cas de problème :

1. Vérifier la console du navigateur pour les erreurs
2. Vérifier que les permissions sont bien dans la DB
3. Vérifier que l'utilisateur a bien les permissions assignées
4. Consulter `PERMISSIONS_SYSTEM.md` pour la documentation complète
5. Vérifier que tous les composants sont bien importés

---

**Bonne implémentation ! 🚀**
