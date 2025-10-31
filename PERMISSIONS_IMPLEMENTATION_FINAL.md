# Implementation Complete des Permissions

## Systeme Cree

### 1. Hook usePermissions
**Fichier**: `lib/use-permissions.tsx`

Fonctions disponibles:
- `hasPermission(category, action)` - Verifie une permission specifique
- `canView(category)` - Peut voir
- `canCreate(category)` - Peut creer
- `canEdit(category)` - Peut modifier
- `canDelete(category)` - Peut supprimer
- `hasAnyPermission(category)` - A au moins une permission

### 2. Composant PermissionButton
**Fichier**: `components/permission-button.tsx`

Bouton qui se desactive automatiquement sans permission.

**Utilisation**:
```typescript
<PermissionButton category="products" action="create">
  Creer Produit
</PermissionButton>
```

**Comportement**:
- Avec permission: Bouton actif
- Sans permission: Bouton desactive + tooltip

### 3. Composant PermissionGuard
**Fichier**: `components/permission-guard.tsx`

Masque completement un element sans permission.

**Utilisation**:
```typescript
<PermissionGuard category="products" action="create">
  <Button>Creer Produit</Button>
</PermissionGuard>
```

### 4. Hook useCan
**Fichier**: `components/use-can.tsx`

Syntaxe simplifiee pour verifier permissions.

**Utilisation**:
```typescript
const can = useCan()

if (can.create('products')) {
  // Afficher bouton creer
}
```

## Exemple Utilisateur: perso@sissan.com

### Permissions Assignees
- Categories: Voir, Creer, Modifier, Supprimer (TOUT)
- Customers: Voir uniquement
- Orders: Voir uniquement
- Products: Voir, Creer, Modifier, Supprimer (TOUT)

### Comportement Attendu

#### Page Produits
- Bouton "Creer Produit": ACTIF
- Bouton "Modifier": ACTIF
- Bouton "Supprimer": ACTIF

#### Page Commandes
- Bouton "Creer Commande": DESACTIVE
- Bouton "Modifier": DESACTIVE
- Bouton "Supprimer": DESACTIVE
- Liste visible (permission voir)

#### Page Clients
- Bouton "Creer Client": DESACTIVE
- Bouton "Modifier": DESACTIVE
- Bouton "Supprimer": DESACTIVE
- Liste visible (permission voir)

#### Page Categories
- Bouton "Creer Categorie": ACTIF
- Bouton "Modifier": ACTIF
- Bouton "Supprimer": ACTIF

#### Sidebar
- Dashboard: Visible si permission
- Commandes: Visible (a permission voir)
- Clients: Visible (a permission voir)
- Produits: Visible (a permissions)
- Categories: Visible (a permissions)
- Parametres: Masque si pas permission staff

## Integration dans Pages

### Etape 1: Importer le composant
```typescript
import { PermissionButton } from "@/components/permission-button"
```

### Etape 2: Remplacer les Button
```typescript
// Avant
<Button onClick={handleCreate}>
  <Plus className="w-4 h-4 mr-2" />
  Creer Produit
</Button>

// Apres
<PermissionButton 
  category="products" 
  action="create"
  onClick={handleCreate}
>
  <Plus className="w-4 h-4 mr-2" />
  Creer Produit
</PermissionButton>
```

### Etape 3: Boutons dans Tableaux
```typescript
<PermissionButton 
  category="products" 
  action="edit"
  variant="ghost"
  size="sm"
  onClick={() => handleEdit(product)}
>
  <Edit className="w-4 h-4" />
</PermissionButton>

<PermissionButton 
  category="products" 
  action="delete"
  variant="ghost"
  size="sm"
  onClick={() => handleDelete(product)}
>
  <Trash2 className="w-4 h-4" />
</PermissionButton>
```

## Pages a Modifier

### Priorite Haute
1. `/admin/products` - Page produits
2. `/admin/categories` - Page categories
3. `/admin/orders` - Page commandes
4. `/admin/customers` - Page clients

### Priorite Moyenne
5. `/admin/coupons` - Page coupons
6. `/admin/reviews` - Page avis
7. `/admin/settings` - Page parametres

### Priorite Basse
8. `/admin/customization/*` - Pages personnalisation

## Mapping Permissions

| Page | Category | Actions |
|------|----------|---------|
| /admin/products | products | view, create, edit, delete |
| /admin/categories | categories | view, create, edit, delete |
| /admin/orders | orders | view, create, edit, delete |
| /admin/customers | customers | view, create, edit, delete |
| /admin/coupons | coupons | view, create, edit, delete |
| /admin/reviews | reviews | view, edit, delete |
| /admin/settings | settings | view, edit |
| /admin/settings/users | staff | view, create, edit, delete |
| /admin/customization/* | customization | view, edit |

## Test Complet

### 1. Creer utilisateur test
Email: perso@sissan.com
Role: PERSONNEL
Permissions:
- Categories: Tout
- Customers: Voir
- Orders: Voir
- Products: Tout

### 2. Se connecter
Login avec perso@sissan.com

### 3. Verifier chaque page

**Products**:
- Bouton Creer: ACTIF
- Bouton Modifier: ACTIF
- Bouton Supprimer: ACTIF

**Categories**:
- Bouton Creer: ACTIF
- Bouton Modifier: ACTIF
- Bouton Supprimer: ACTIF

**Orders**:
- Bouton Creer: DESACTIVE + tooltip
- Bouton Modifier: DESACTIVE + tooltip
- Bouton Supprimer: DESACTIVE + tooltip

**Customers**:
- Bouton Creer: DESACTIVE + tooltip
- Bouton Modifier: DESACTIVE + tooltip
- Bouton Supprimer: DESACTIVE + tooltip

## Tooltip Messages

Quand bouton desactive, tooltip affiche:
- "Vous n'avez pas la permission de creer les produits"
- "Vous n'avez pas la permission de modifier les commandes"
- "Vous n'avez pas la permission de supprimer les clients"

## Prochaines Etapes

1. Installer tooltip: `npx shadcn@latest add tooltip`
2. Integrer PermissionButton dans pages existantes
3. Tester avec perso@sissan.com
4. Ajuster selon besoins

## Notes Importantes

- ADMIN et SUPER_ADMIN ont TOUTES les permissions automatiquement
- Boutons desactives ont opacity 50% et cursor not-allowed
- Tooltip s'affiche au survol des boutons desactives
- Menus sidebar peuvent etre masques si pas de permission
