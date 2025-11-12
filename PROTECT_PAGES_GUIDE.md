# 🛡️ Guide pour Protéger les Pages Restantes

## Pages à Protéger

Voici la liste complète des pages à protéger avec le code exact à utiliser pour chacune.

### ✅ Déjà Protégé

- `/app/admin/products/page.tsx` - ✅ Fait
- `/app/admin/settings/users/page.tsx` - ✅ Fait

### 🔄 À Protéger

## 1. Dashboard (`/app/admin/dashboard/page.tsx`)

**Importer:**
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
```

**Envelopper le return principal:**
```tsx
return (
  <PagePermissionGuard category="dashboard" action="view">
    {/* Tout le contenu existant */}
  </PagePermissionGuard>
)
```

## 2. Orders (`/app/admin/orders/page.tsx`)

**Importer:**
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

**Envelopper le return:**
```tsx
return (
  <PagePermissionGuard category="orders" action="view">
    {/* Contenu */}
  </PagePermissionGuard>
)
```

**Remplacer les boutons d'action:**
```tsx
// Bouton Voir/Modifier
<PermissionButton 
  category="orders" 
  action="edit"
  variant="ghost"
  size="icon"
  onClick={() => handleViewOrder(order)}
>
  <Eye className="w-4 h-4" />
</PermissionButton>
```

## 3. Customers (`/app/admin/customers/page.tsx`)

**Protection:**
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"

export default function CustomersPage() {
  return (
    <PagePermissionGuard category="customers" action="view">
      {/* Contenu */}
    </PagePermissionGuard>
  )
}
```

**Boutons:**
```tsx
// Modifier
<PermissionButton category="customers" action="edit">
  Modifier
</PermissionButton>

// Supprimer
<PermissionButton category="customers" action="delete">
  Supprimer
</PermissionButton>
```

## 4. Categories (`/app/admin/categories/page.tsx`)

**Protection:**
```tsx
<PagePermissionGuard category="categories" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

**Bouton Ajouter:**
```tsx
<PermissionButton 
  category="categories" 
  action="create"
  onClick={() => router.push('/admin/categories/add')}
>
  Ajouter une Catégorie
</PermissionButton>
```

## 5. Categories Add (`/app/admin/categories/add/page.tsx`)

**Protection:**
```tsx
<PagePermissionGuard category="categories" action="create">
  {/* Formulaire */}
</PagePermissionGuard>
```

## 6. Reviews (`/app/admin/reviews/page.tsx`)

**Protection:**
```tsx
<PagePermissionGuard category="reviews" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

**Boutons:**
```tsx
<PermissionButton category="reviews" action="edit">
  Approuver
</PermissionButton>

<PermissionButton category="reviews" action="delete">
  Rejeter
</PermissionButton>
```

## 7. Coupons (`/app/admin/coupons/page.tsx`)

**Protection:**
```tsx
<PagePermissionGuard category="coupons" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

**Boutons:**
```tsx
<PermissionButton category="coupons" action="create">
  Ajouter un Coupon
</PermissionButton>

<PermissionButton category="coupons" action="edit">
  Modifier
</PermissionButton>

<PermissionButton category="coupons" action="delete">
  Supprimer
</PermissionButton>
```

## 8. Settings (`/app/admin/settings/page.tsx`)

**Protection:**
```tsx
<PagePermissionGuard category="settings" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

**Boutons:**
```tsx
<PermissionButton category="settings" action="edit" type="submit">
  Enregistrer
</PermissionButton>
```

## 9. Products Add (`/app/admin/products/add/page.tsx`)

**Protection:**
```tsx
<PagePermissionGuard category="products" action="create">
  {/* Formulaire */}
</PagePermissionGuard>
```

**Bouton Submit:**
```tsx
<PermissionButton category="products" action="create" type="submit">
  Créer le Produit
</PermissionButton>
```

## 10. Products Edit (`/app/admin/products/edit/[id]/page.tsx`)

**Protection:**
```tsx
<PagePermissionGuard category="products" action="edit">
  {/* Formulaire */}
</PagePermissionGuard>
```

**Bouton Submit:**
```tsx
<PermissionButton category="products" action="edit" type="submit">
  Enregistrer
</PermissionButton>
```

## 11. Customization Pages

### SEO (`/app/admin/customization/seo/page.tsx`)
```tsx
<PagePermissionGuard category="customization" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

### Header (`/app/admin/customization/header/page.tsx`)
```tsx
<PagePermissionGuard category="customization" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

### Footer (`/app/admin/customization/footer/page.tsx`)
```tsx
<PagePermissionGuard category="customization" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

### Hero Slider (`/app/admin/customization/hero-slider/page.tsx`)
```tsx
<PagePermissionGuard category="customization" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

### Countdown (`/app/admin/customization/countdown/page.tsx`)
```tsx
<PagePermissionGuard category="customization" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

### Privacy (`/app/admin/customization/privacy/page.tsx`)
```tsx
<PagePermissionGuard category="customization" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

### Terms (`/app/admin/customization/terms/page.tsx`)
```tsx
<PagePermissionGuard category="customization" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

## Template Général

Pour protéger n'importe quelle page rapidement:

```tsx
"use client"

// 1. Ajouter l'import
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"

export default function YourPage() {
  // Votre logique existante...
  
  return (
    // 2. Envelopper tout le contenu
    <PagePermissionGuard category="YOUR_CATEGORY" action="view">
      <div>
        {/* Votre contenu existant */}
        
        {/* 3. Remplacer les boutons d'action */}
        <PermissionButton 
          category="YOUR_CATEGORY" 
          action="create"
          onClick={handleCreate}
        >
          Ajouter
        </PermissionButton>
        
        <PermissionButton 
          category="YOUR_CATEGORY" 
          action="edit"
          onClick={handleEdit}
        >
          Modifier
        </PermissionButton>
        
        <PermissionButton 
          category="YOUR_CATEGORY" 
          action="delete"
          onClick={handleDelete}
        >
          Supprimer
        </PermissionButton>
      </div>
    </PagePermissionGuard>
  )
}
```

## Checklist de Vérification

Pour chaque page protégée, vérifier:

- [ ] Import de `PagePermissionGuard` ajouté
- [ ] Import de `PermissionButton` ajouté (si nécessaire)
- [ ] Tout le contenu enveloppé dans `<PagePermissionGuard>`
- [ ] Catégorie correcte spécifiée
- [ ] Action correcte spécifiée (view, create, edit, delete)
- [ ] Boutons d'action remplacés par `PermissionButton`
- [ ] Pas d'erreurs de compilation
- [ ] Testé avec un utilisateur sans permission

## Catégories par Page

| Page | Catégorie |
|------|-----------|
| Dashboard | `dashboard` |
| Products | `products` |
| Orders | `orders` |
| Customers | `customers` |
| Categories | `categories` |
| Reviews | `reviews` |
| Coupons | `coupons` |
| Settings | `settings` |
| Staff/Users | `staff` |
| Customization | `customization` |

## Après Protection

1. **Tester** avec un utilisateur sans permissions
2. **Vérifier** que le message "Accès Refusé" s'affiche
3. **Vérifier** que les boutons sont désactivés
4. **Vérifier** que les tooltips s'affichent

---

**Note**: Si vous rencontrez des erreurs, consultez `PERMISSIONS_SYSTEM.md` pour plus de détails.
