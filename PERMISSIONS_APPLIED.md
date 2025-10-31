# Permissions Appliquees - perso@sissan.com

## Permissions Configurees

### perso@sissan.com (PERSONNEL)

**Peut VOIR uniquement**:
- Staff (Personnel)
- Clients (Customers)
- Commandes (Orders)

**Full Access (Voir, Creer, Modifier, Supprimer)**:
- Categories
- Produits (Products)

**PAS d'acces**:
- Dashboard
- Parametres (Settings)
- Personnalisation (Customization)

## Modifications Appliquees

### 1. Permissions Mises a Jour
**Script**: `scripts/update-perso-permissions.ts`

Permissions dans la base de donnees:
- staff: canView = true
- customers: canView = true
- orders: canView = true
- categories: canView, canCreate, canEdit, canDelete = true
- products: canView, canCreate, canEdit, canDelete = true

### 2. Sidebar Filtree
**Fichier**: `components/admin/admin-sidebar.tsx`

La sidebar masque automatiquement les menus sans permission:

**Visible pour perso@sissan.com**:
- Commandes (permission orders)
- Clients (permission customers)
- Produits (permission products)
  - Tous les produits
  - Ajouter produit
- Categories (permission categories)
  - Toutes les categories
  - Ajouter categorie

**Masque pour perso@sissan.com**:
- Dashboard (pas de permission dashboard)
- Parametres (pas de permission settings)
- Personnalisation (pas de permission customization)

## Test

### 1. Se connecter
```
Email: perso@sissan.com
Password: [votre-mot-de-passe]
```

### 2. Verifier la Sidebar

**Doit voir**:
- Commandes
- Clients
- Produits (avec sous-menu)
- Categories (avec sous-menu)

**Ne doit PAS voir**:
- Dashboard
- Parametres
- Personnalisation

### 3. Verifier les Pages

**Page Produits** (`/admin/products`):
- Liste visible
- Bouton "Ajouter produit": ACTIF
- Boutons Modifier: ACTIFS
- Boutons Supprimer: ACTIFS

**Page Categories** (`/admin/categories`):
- Liste visible
- Bouton "Ajouter categorie": ACTIF
- Boutons Modifier: ACTIFS
- Boutons Supprimer: ACTIFS

**Page Commandes** (`/admin/orders`):
- Liste visible
- Bouton "Creer commande": DESACTIVE (si existe)
- Boutons Modifier: DESACTIVES
- Boutons Supprimer: DESACTIVES

**Page Clients** (`/admin/customers`):
- Liste visible
- Bouton "Creer client": DESACTIVE (si existe)
- Boutons Modifier: DESACTIVES
- Boutons Supprimer: DESACTIVES

## Prochaines Etapes

Pour appliquer completement les permissions, remplacer les Button par PermissionButton dans:

1. `/admin/products/page.tsx`
2. `/admin/categories/page.tsx`
3. `/admin/orders/page.tsx`
4. `/admin/customers/page.tsx`

Exemple:
```typescript
// Avant
<Button onClick={handleCreate}>Creer</Button>

// Apres
<PermissionButton category="products" action="create" onClick={handleCreate}>
  Creer
</PermissionButton>
```

## Verification Rapide

```bash
# Verifier les permissions
npx tsx scripts/check-user-role.ts perso@sissan.com
```

Resultat attendu:
```
Permissions:
- staff: View
- customers: View
- orders: View
- categories: View, Create, Edit, Delete
- products: View, Create, Edit, Delete
```

## Notes

- ADMIN et SUPER_ADMIN voient TOUS les menus (pas de filtrage)
- Les menus sont filtres cote client (sidebar)
- Les boutons doivent etre proteges avec PermissionButton
- Les API routes doivent aussi verifier les permissions (securite serveur)
