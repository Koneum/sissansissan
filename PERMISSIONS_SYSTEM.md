# Système de Permissions - Documentation Complète

## 📋 Vue d'ensemble

Le système de permissions permet de contrôler l'accès aux différentes fonctionnalités de l'application en fonction du rôle et des permissions spécifiques de chaque utilisateur.

### Hiérarchie des Rôles

1. **SUPER_ADMIN** - Accès complet à toutes les fonctionnalités
2. **ADMIN** - Accès complet à toutes les fonctionnalités
3. **MANAGER** - Accès basé sur les permissions assignées
4. **PERSONNEL** - Accès basé sur les permissions assignées
5. **CUSTOMER** - Accès uniquement au front-end

> **Note**: Les rôles ADMIN et SUPER_ADMIN ont automatiquement toutes les permissions, sans besoin de les assigner individuellement.

## 🗂️ Catégories de Permissions

Le système utilise les catégories suivantes :

- **dashboard** - Tableau de bord
- **products** - Gestion des produits
- **orders** - Gestion des commandes
- **customers** - Gestion des clients
- **categories** - Gestion des catégories
- **reviews** - Gestion des avis
- **coupons** - Gestion des coupons
- **settings** - Paramètres généraux
- **staff** - Gestion du personnel
- **customization** - Personnalisation du site

### Actions Disponibles

Pour chaque catégorie, 4 actions sont disponibles :

- **view** (voir) - Consulter les données
- **create** (créer) - Créer de nouvelles entrées
- **edit** (modifier) - Modifier des entrées existantes
- **delete** (supprimer) - Supprimer des entrées

## 🔧 Composants Disponibles

### 1. PagePermissionGuard

Protège une page entière. Affiche un message d'accès refusé si l'utilisateur n'a pas la permission.

```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"

export default function ProductsPage() {
  return (
    <PagePermissionGuard category="products" action="view">
      {/* Contenu de la page */}
    </PagePermissionGuard>
  )
}
```

**Props:**
- `category` (string) - La catégorie de permission
- `action` ('view' | 'create' | 'edit' | 'delete') - L'action requise (défaut: 'view')
- `requireAny` (boolean) - Si true, vérifie seulement si l'utilisateur a une permission dans la catégorie
- `children` (ReactNode) - Le contenu à protéger

### 2. PermissionButton

Bouton qui se désactive automatiquement si l'utilisateur n'a pas la permission.

```tsx
import { PermissionButton } from "@/components/permission-button"

<PermissionButton 
  category="products" 
  action="create"
  onClick={() => router.push('/admin/products/add')}
>
  Ajouter un Produit
</PermissionButton>
```

**Props:**
- `category` (string) - La catégorie de permission
- `action` ('view' | 'create' | 'edit' | 'delete') - L'action requise
- `showTooltip` (boolean) - Afficher un tooltip explicatif (défaut: true)
- Toutes les props de Button (variant, size, className, etc.)

### 3. PermissionGuard

Affiche ou cache conditionnellement du contenu basé sur les permissions.

```tsx
import { PermissionGuard } from "@/components/permission-guard"

<PermissionGuard category="products" action="delete">
  <Button onClick={handleDelete}>Supprimer</Button>
</PermissionGuard>
```

**Props:**
- `category` (string) - La catégorie de permission
- `action` ('view' | 'create' | 'edit' | 'delete') - L'action requise
- `children` (ReactNode) - Le contenu à afficher si autorisé
- `fallback` (ReactNode) - Contenu alternatif si non autorisé

### 4. CategoryGuard

Vérifie si l'utilisateur a au moins une permission dans une catégorie.

```tsx
import { CategoryGuard } from "@/components/permission-guard"

<CategoryGuard category="products">
  {/* Affiché si l'utilisateur a n'importe quelle permission products */}
</CategoryGuard>
```

### 5. PermissionLink & CategoryLink

Liens qui ne s'affichent que si l'utilisateur a la permission.

```tsx
import { PermissionLink, CategoryLink } from "@/components/permission-link"

<PermissionLink category="products" action="create" href="/admin/products/add">
  Ajouter un produit
</PermissionLink>

<CategoryLink category="settings" href="/admin/settings">
  Paramètres
</CategoryLink>
```

## 🎯 Hook usePermissions

Le hook `usePermissions` permet de vérifier les permissions dans votre code.

```tsx
import { usePermissions } from "@/lib/use-permissions"

function MyComponent() {
  const { 
    hasPermission, 
    hasAnyPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isLoading 
  } = usePermissions()

  // Vérifier une permission spécifique
  if (hasPermission('products', 'create')) {
    // L'utilisateur peut créer des produits
  }

  // Vérifier si l'utilisateur a au moins une permission dans une catégorie
  if (hasAnyPermission('products')) {
    // L'utilisateur a au moins une permission products
  }

  // Méthodes raccourcies
  if (canCreate('products')) {
    // L'utilisateur peut créer des produits
  }
}
```

## 📝 Exemples d'Implémentation

### Exemple 1: Page Produits Complète

```tsx
"use client"

import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
import { useRouter } from "next/navigation"

export default function ProductsPage() {
  const router = useRouter()

  return (
    <PagePermissionGuard category="products" action="view">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>Produits</h1>
          
          <PermissionButton 
            category="products" 
            action="create"
            onClick={() => router.push('/admin/products/add')}
          >
            Ajouter un Produit
          </PermissionButton>
        </div>

        {/* Liste des produits */}
        <div className="grid gap-4">
          {products.map(product => (
            <div key={product.id} className="flex justify-between">
              <span>{product.name}</span>
              
              <div className="flex gap-2">
                <PermissionButton
                  category="products"
                  action="edit"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                >
                  Modifier
                </PermissionButton>
                
                <PermissionButton
                  category="products"
                  action="delete"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  Supprimer
                </PermissionButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PagePermissionGuard>
  )
}
```

### Exemple 2: Navigation avec Permissions

```tsx
import { CategoryGuard } from "@/components/permission-guard"
import { PermissionLink } from "@/components/permission-link"

function AdminSidebar() {
  return (
    <nav>
      <CategoryGuard category="dashboard">
        <PermissionLink category="dashboard" href="/admin/dashboard">
          Dashboard
        </PermissionLink>
      </CategoryGuard>

      <CategoryGuard category="products">
        <PermissionLink category="products" href="/admin/products">
          Produits
        </PermissionLink>
      </CategoryGuard>

      <CategoryGuard category="orders">
        <PermissionLink category="orders" href="/admin/orders">
          Commandes
        </PermissionLink>
      </CategoryGuard>
    </nav>
  )
}
```

### Exemple 3: Permissions Conditionnelles

```tsx
import { usePermissions } from "@/lib/use-permissions"

function ProductCard({ product }) {
  const { canEdit, canDelete } = usePermissions()

  return (
    <div>
      <h3>{product.name}</h3>
      
      {canEdit('products') && (
        <button onClick={() => handleEdit(product.id)}>
          Modifier
        </button>
      )}
      
      {canDelete('products') && (
        <button onClick={() => handleDelete(product.id)}>
          Supprimer
        </button>
      )}
    </div>
  )
}
```

## 🔐 Gestion des Permissions Utilisateur

### Créer un Utilisateur avec Permissions

Lors de la création d'un utilisateur dans `/admin/settings/users`, vous pouvez :

1. Sélectionner le rôle (PERSONNEL, MANAGER, ADMIN)
2. Cocher les permissions spécifiques pour chaque catégorie
3. Pour chaque permission, définir les actions autorisées (Voir, Créer, Modifier, Supprimer)

**Exemple de configuration:**

**Personnel de Vente:**
- ✅ Products: Voir, Créer, Modifier
- ✅ Orders: Voir, Créer, Modifier
- ✅ Customers: Voir
- ❌ Settings: Aucun accès
- ❌ Staff: Aucun accès

**Manager:**
- ✅ Products: Toutes les actions
- ✅ Orders: Toutes les actions
- ✅ Customers: Toutes les actions
- ✅ Reviews: Voir, Modifier
- ✅ Settings: Voir
- ❌ Staff: Aucun accès

### Modifier les Permissions

1. Aller dans **Settings > Gestion du Personnel**
2. Cliquer sur **Modifier** pour un utilisateur
3. Aller dans l'onglet **Permissions**
4. Cocher/décocher les permissions souhaitées
5. Sauvegarder

## 🌱 Initialisation des Permissions

### Seeder les Permissions

Pour initialiser toutes les permissions dans la base de données :

```bash
# Compiler le script TypeScript
npx tsx prisma/seed-permissions.ts
```

Cela créera automatiquement toutes les permissions pour toutes les catégories.

### Permissions Créées

Le script crée 4 permissions pour chaque catégorie :
- `{category}.view`
- `{category}.create`
- `{category}.edit`
- `{category}.delete`

## 🎨 Comportement Visuel

### Boutons Désactivés

Quand un utilisateur n'a pas la permission :
- Le bouton est désactivé (grisé)
- Un tooltip s'affiche au survol expliquant pourquoi
- Le curseur devient `not-allowed`

### Pages Protégées

Quand un utilisateur accède à une page sans permission :
- Un message d'erreur s'affiche
- Un bouton "Retour au Dashboard" est disponible
- L'utilisateur ne peut pas voir le contenu de la page

### Navigation

Dans la sidebar :
- Les liens vers les pages sans permission ne s'affichent pas
- Les sous-menus sont filtrés selon les permissions
- Si un utilisateur a accès à Settings mais pas à Users, seul Users sera caché

## 🔄 Flux de Vérification

```
Utilisateur tente d'accéder à une fonctionnalité
           ↓
Est-ce un ADMIN ou SUPER_ADMIN ?
    ↓ Oui              ↓ Non
  Accès autorisé    Vérifier les permissions
                           ↓
                    A-t-il la permission ?
                    ↓ Oui        ↓ Non
                Accès autorisé  Accès refusé
```

## 📊 Structure de la Base de Données

### Table Permission

```prisma
model Permission {
  id          String   @id @default(cuid())
  name        String   @unique  // ex: "products.view"
  description String?
  category    String   // ex: "products"
  
  userPermissions UserPermission[]
}
```

### Table UserPermission

```prisma
model UserPermission {
  id           String   @id @default(cuid())
  userId       String
  permissionId String
  canView      Boolean  @default(true)
  canCreate    Boolean  @default(false)
  canEdit      Boolean  @default(false)
  canDelete    Boolean  @default(false)
  
  user       User       @relation(...)
  permission Permission @relation(...)
}
```

## 🚀 Checklist d'Implémentation

Pour ajouter des permissions à une nouvelle page :

- [ ] Importer `PagePermissionGuard`
- [ ] Envelopper le contenu de la page avec `PagePermissionGuard`
- [ ] Remplacer les boutons d'action par `PermissionButton`
- [ ] Utiliser `PermissionGuard` pour le contenu conditionnel
- [ ] Tester avec différents rôles et permissions

## 🐛 Dépannage

### Les permissions ne fonctionnent pas

1. Vérifier que les permissions sont bien seedées dans la DB
2. Vérifier que l'utilisateur a bien les permissions assignées
3. Vérifier que le hook `usePermissions` est appelé dans un composant client
4. Vérifier la console pour les erreurs

### Un ADMIN ne peut pas accéder

Les ADMIN et SUPER_ADMIN ont automatiquement toutes les permissions. Si un ADMIN ne peut pas accéder :
- Vérifier que le rôle est bien "ADMIN" ou "SUPER_ADMIN"
- Vérifier que l'utilisateur est bien authentifié
- Vérifier le contexte d'authentification

### Les boutons ne se désactivent pas

1. Vérifier que vous utilisez `PermissionButton` et non `Button`
2. Vérifier que la catégorie et l'action sont correctes
3. Vérifier que le composant est bien un composant client ("use client")

## 📚 Ressources

- **Composants**: `/components/permission-*.tsx`
- **Hook**: `/lib/use-permissions.tsx`
- **Seeder**: `/prisma/seed-permissions.ts`
- **Page de gestion**: `/app/admin/settings/users/page.tsx`
- **API**: `/app/api/admin/permissions/route.ts`

## 🎯 Bonnes Pratiques

1. **Toujours protéger les pages** avec `PagePermissionGuard`
2. **Utiliser PermissionButton** pour toutes les actions (créer, modifier, supprimer)
3. **Vérifier les permissions côté serveur** dans les API routes
4. **Tester avec différents rôles** avant de déployer
5. **Documenter les permissions** requises pour chaque fonctionnalité
6. **Ne jamais hardcoder** les vérifications de rôle, utiliser le système de permissions

## 🔒 Sécurité

> **IMPORTANT**: Les vérifications de permissions côté client sont pour l'UX uniquement. 
> Toujours vérifier les permissions côté serveur dans vos API routes.

Exemple de vérification côté serveur :

```typescript
// app/api/products/route.ts
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { permissions: { include: { permission: true } } }
  })

  // Vérifier si ADMIN/SUPER_ADMIN
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    // Vérifier la permission spécifique
    const hasPermission = user.permissions.some(
      up => up.permission.category === 'products' && up.canCreate
    )
    
    if (!hasPermission) {
      return new Response("Forbidden", { status: 403 })
    }
  }

  // Continuer avec la logique...
}
```

---

**Développé par**: Moussa Kone & Aboubakar Sidibe (Kris Beat)  
**Version**: 1.0  
**Dernière mise à jour**: 2024
