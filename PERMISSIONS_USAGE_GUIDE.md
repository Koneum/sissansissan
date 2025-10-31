# Guide Utilisation Permissions

## Systeme Mis a Jour

Le systeme de permissions a ete corrige pour avoir **une seule permission par categorie** avec 4 actions (Voir, Creer, Modifier, Supprimer).

## Permissions Disponibles

- dashboard: Dashboard
- products: Produits
- orders: Commandes  
- customers: Clients
- categories: Categories
- reviews: Avis
- coupons: Coupons
- settings: Parametres
- staff: Personnel
- customization: Personnalisation

## Migration

Executer: npx tsx scripts/seed-permissions-v2.ts

## Utilisation dans le Code

### Hook usePermissions

```typescript
import { usePermissions } from "@/lib/use-permissions"

function MyComponent() {
  const { canView, canCreate, canEdit, canDelete } = usePermissions()
  
  if (canView('products')) {
    // Afficher les produits
  }
  
  if (canCreate('products')) {
    // Afficher bouton creer
  }
}
```

### Composant PermissionGuard

```typescript
import { PermissionGuard } from "@/components/permission-guard"

<PermissionGuard category="products" action="create">
  <Button>Creer Produit</Button>
</PermissionGuard>
```

## Interface Admin

1. Aller sur Settings → Users
2. Cliquer Modifier sur un utilisateur
3. Onglet Permissions
4. Cocher les actions autorisees pour chaque categorie
5. Enregistrer
