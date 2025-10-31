# Redirection Automatique selon Permissions

## Probleme Resolu

Quand un utilisateur sans permission dashboard se connecte, il etait redirige vers `/admin/dashboard` qui n'etait pas accessible. Maintenant, il est automatiquement redirige vers la premiere page accessible.

## Logique de Redirection

### 1. CUSTOMER
→ `/account` (compte client)

### 2. ADMIN et SUPER_ADMIN
→ `/admin/dashboard` (ont toutes les permissions)

### 3. PERSONNEL et MANAGER

**Si a permission dashboard**:
→ `/admin/dashboard`

**Sinon, ordre de priorite**:
1. `/admin/orders` (si permission orders.view)
2. `/admin/customers` (si permission customers.view)
3. `/admin/products` (si permission products.view)
4. `/admin/categories` (si permission categories.view)
5. `/admin/settings/users` (si permission staff.view)

**Si aucune permission**:
→ `/signin` (deconnexion)

## Exemple: perso@sissan.com

**Permissions**:
- orders: View
- customers: View
- products: View, Create, Edit, Delete
- categories: View, Create, Edit, Delete
- staff: View

**Pas de permission dashboard**

**Resultat**:
→ Redirige vers `/admin/orders` (premiere dans l'ordre de priorite)

## Pourquoi les Permissions ne sont pas Appliquees Automatiquement?

### Probleme
Quand vous creez un utilisateur dans l'interface, vous devez manuellement cocher les permissions. Si vous ne cochez rien, l'utilisateur n'a aucune permission.

### Solution 1: Permissions par Defaut (Recommande)

Modifier l'API de creation pour assigner des permissions par defaut selon le role:

**PERSONNEL** (par defaut):
- orders: View
- customers: View
- products: View

**MANAGER** (par defaut):
- orders: View, Create, Edit
- customers: View, Create, Edit
- products: View, Create, Edit, Delete
- categories: View, Create, Edit, Delete

### Solution 2: Interface Amelioree

Ajouter des presets dans l'interface:
- Bouton "Permissions Personnel Standard"
- Bouton "Permissions Manager Standard"
- Bouton "Tout Selectionner"
- Bouton "Tout Deselectionner"

## Implementation Solution 1

Modifier `/api/admin/staff/route.ts`:

```typescript
// Permissions par defaut selon role
const getDefaultPermissions = (role: string) => {
  const allPermissions = await prisma.permission.findMany()
  
  if (role === 'PERSONNEL') {
    return allPermissions
      .filter(p => ['orders', 'customers', 'products'].includes(p.category))
      .map(p => ({
        permissionId: p.id,
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      }))
  }
  
  if (role === 'MANAGER') {
    return allPermissions
      .filter(p => ['orders', 'customers', 'products', 'categories'].includes(p.category))
      .map(p => ({
        permissionId: p.id,
        canView: true,
        canCreate: p.category !== 'orders',
        canEdit: p.category !== 'orders',
        canDelete: p.category === 'products' || p.category === 'categories',
      }))
  }
  
  return []
}

// Dans la creation
if (!permissions || permissions.length === 0) {
  permissions = await getDefaultPermissions(role)
}
```

## Test

### Avant
1. Creer utilisateur PERSONNEL
2. Ne cocher aucune permission
3. Se connecter
4. Erreur: Aucune page accessible

### Apres
1. Creer utilisateur PERSONNEL
2. Ne cocher aucune permission
3. Permissions par defaut appliquees automatiquement
4. Se connecter
5. Redirige vers /admin/orders

## Ordre de Priorite Explique

**Pourquoi orders en premier?**
- C'est generalement la page la plus consultee
- Permet de voir l'activite du site
- Moins sensible que clients

**Ordre complet**:
1. orders - Voir les commandes
2. customers - Voir les clients
3. products - Gerer les produits
4. categories - Gerer les categories
5. staff - Gerer le personnel

## Notes

- La redirection se fait apres verification des permissions
- Les permissions sont chargees depuis la base de donnees
- Le chargement prend ~500ms
- Un loader est affiche pendant le chargement
