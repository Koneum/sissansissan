# Guide Boutons avec Permissions

## Composant PermissionButton

Le composant `PermissionButton` desactive automatiquement les boutons selon les permissions de l'utilisateur.

## Utilisation

### Import

```typescript
import { PermissionButton } from "@/components/permission-button"
```

### Exemple Simple

```typescript
// Bouton Creer Produit
<PermissionButton category="products" action="create">
  <Plus className="w-4 h-4 mr-2" />
  Creer Produit
</PermissionButton>

// Bouton Modifier
<PermissionButton category="products" action="edit">
  <Edit className="w-4 h-4" />
</PermissionButton>

// Bouton Supprimer
<PermissionButton 
  category="products" 
  action="delete"
  variant="destructive"
>
  <Trash2 className="w-4 h-4" />
</PermissionButton>
```

## Comportement

### Avec Permission
- Bouton actif et cliquable
- Style normal

### Sans Permission
- Bouton desactive (opacity 50%)
- Curseur not-allowed
- Tooltip au survol: "Vous n'avez pas la permission de [action] [categorie]"

## Exemples par Page

### Page Produits

```typescript
// Bouton Creer
<PermissionButton category="products" action="create">
  Creer Produit
</PermissionButton>

// Bouton Modifier dans tableau
<PermissionButton 
  category="products" 
  action="edit"
  variant="ghost"
  size="sm"
>
  <Edit className="w-4 h-4" />
</PermissionButton>

// Bouton Supprimer
<PermissionButton 
  category="products" 
  action="delete"
  variant="ghost"
  size="sm"
>
  <Trash2 className="w-4 h-4" />
</PermissionButton>
```

### Page Commandes

```typescript
<PermissionButton category="orders" action="create">
  Nouvelle Commande
</PermissionButton>

<PermissionButton category="orders" action="edit">
  Modifier
</PermissionButton>
```

### Page Categories

```typescript
<PermissionButton category="categories" action="create">
  Creer Categorie
</PermissionButton>

<PermissionButton category="categories" action="edit">
  Modifier
</PermissionButton>

<PermissionButton category="categories" action="delete">
  Supprimer
</PermissionButton>
```

## Props

- `category`: string - Categorie de permission (products, orders, etc.)
- `action`: 'view' | 'create' | 'edit' | 'delete' - Action requise
- `showTooltip`: boolean - Afficher tooltip (default: true)
- `disabled`: boolean - Desactiver manuellement
- Toutes les props de Button (variant, size, className, etc.)

## Cas Particuliers

### ADMIN et SUPER_ADMIN
- Ont automatiquement acces a tout
- Tous les boutons sont actifs

### MANAGER et PERSONNEL
- Boutons actifs selon permissions assignees
- Boutons desactives si pas de permission

### Exemple Complet

```typescript
function ProductsPage() {
  return (
    <div>
      <div className="flex justify-between">
        <h1>Produits</h1>
        <PermissionButton category="products" action="create">
          <Plus className="w-4 h-4 mr-2" />
          Creer Produit
        </PermissionButton>
      </div>
      
      <table>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>
                <PermissionButton 
                  category="products" 
                  action="edit"
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PermissionButton>
                
                <PermissionButton 
                  category="products" 
                  action="delete"
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </PermissionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Messages Tooltip

- "Vous n'avez pas la permission de creer les produits"
- "Vous n'avez pas la permission de modifier les commandes"
- "Vous n'avez pas la permission de supprimer les categories"
- etc.

## Integration dans Pages Existantes

Remplacer tous les Button par PermissionButton:

Avant:
```typescript
<Button onClick={handleCreate}>Creer</Button>
```

Apres:
```typescript
<PermissionButton category="products" action="create" onClick={handleCreate}>
  Creer
</PermissionButton>
```
