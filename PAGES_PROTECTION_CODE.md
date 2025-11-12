# 📋 Code Prêt à Copier pour Protéger Chaque Page

## Instructions

Pour chaque page ci-dessous:
1. Ouvrir le fichier
2. Ajouter les imports en haut
3. Envelopper le return avec PagePermissionGuard
4. Remplacer les Button par PermissionButton

---

## ✅ 1. Dashboard - `/app/admin/dashboard/page.tsx`

### Ajouter en haut (après les autres imports):
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
```

### Modifier le return final (chercher `return (` à la fin de la fonction):
**AVANT:**
```tsx
  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-8">
```

**APRÈS:**
```tsx
  return (
    <PagePermissionGuard category="dashboard" action="view">
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-8">
```

### Fermer avant le dernier `)`  de la fonction:
**AVANT:**
```tsx
      </div>
    </div>
  )
}
```

**APRÈS:**
```tsx
      </div>
    </div>
    </PagePermissionGuard>
  )
}
```

---

## ✅ 2. Orders - `/app/admin/orders/page.tsx`

### Imports à ajouter:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper le return:
```tsx
return (
  <PagePermissionGuard category="orders" action="view">
    {/* Contenu existant */}
  </PagePermissionGuard>
)
```

### Si vous avez un bouton "Voir détails" ou "Modifier":
**AVANT:**
```tsx
<Button onClick={() => handleView(order)}>
  <Eye className="w-4 h-4" />
</Button>
```

**APRÈS:**
```tsx
<PermissionButton 
  category="orders" 
  action="edit"
  variant="ghost"
  size="icon"
  onClick={() => handleView(order)}
>
  <Eye className="w-4 h-4" />
</PermissionButton>
```

---

## ✅ 3. Customers - `/app/admin/customers/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="customers" action="view">
    {/* Contenu */}
  </PagePermissionGuard>
)
```

### Boutons d'action:
```tsx
// Modifier
<PermissionButton 
  category="customers" 
  action="edit"
  onClick={handleEdit}
>
  Modifier
</PermissionButton>

// Supprimer
<PermissionButton 
  category="customers" 
  action="delete"
  onClick={handleDelete}
>
  Supprimer
</PermissionButton>
```

---

## ✅ 4. Categories - `/app/admin/categories/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="categories" action="view">
    {/* Contenu */}
  </PagePermissionGuard>
)
```

### Bouton "Ajouter":
**AVANT:**
```tsx
<Link href="/admin/categories/add">
  <Button>Ajouter une Catégorie</Button>
</Link>
```

**APRÈS:**
```tsx
<PermissionButton 
  category="categories" 
  action="create"
  onClick={() => router.push('/admin/categories/add')}
>
  Ajouter une Catégorie
</PermissionButton>
```

### Boutons Modifier/Supprimer:
```tsx
<PermissionButton category="categories" action="edit">
  <Edit className="w-4 h-4" />
</PermissionButton>

<PermissionButton category="categories" action="delete">
  <Trash2 className="w-4 h-4" />
</PermissionButton>
```

---

## ✅ 5. Categories Add - `/app/admin/categories/add/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="categories" action="create">
    {/* Formulaire */}
  </PagePermissionGuard>
)
```

### Bouton Submit:
**AVANT:**
```tsx
<Button type="submit">Créer</Button>
```

**APRÈS:**
```tsx
<PermissionButton category="categories" action="create" type="submit">
  Créer
</PermissionButton>
```

---

## ✅ 6. Reviews - `/app/admin/reviews/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="reviews" action="view">
    {/* Contenu */}
  </PagePermissionGuard>
)
```

### Boutons:
```tsx
<PermissionButton category="reviews" action="edit">
  Approuver
</PermissionButton>

<PermissionButton category="reviews" action="delete">
  Rejeter
</PermissionButton>
```

---

## ✅ 7. Coupons - `/app/admin/coupons/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="coupons" action="view">
    {/* Contenu */}
  </PagePermissionGuard>
)
```

### Boutons:
```tsx
<PermissionButton category="coupons" action="create">
  Ajouter un Coupon
</PermissionButton>

<PermissionButton category="coupons" action="edit">
  <Edit className="w-4 h-4" />
</PermissionButton>

<PermissionButton category="coupons" action="delete">
  <Trash2 className="w-4 h-4" />
</PermissionButton>
```

---

## ✅ 8. Settings - `/app/admin/settings/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="settings" action="view">
    {/* Contenu */}
  </PagePermissionGuard>
)
```

### Bouton Enregistrer:
**AVANT:**
```tsx
<Button type="submit">Enregistrer</Button>
```

**APRÈS:**
```tsx
<PermissionButton category="settings" action="edit" type="submit">
  Enregistrer
</PermissionButton>
```

---

## ✅ 9. Products Add - `/app/admin/products/add/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="products" action="create">
    {/* Formulaire */}
  </PagePermissionGuard>
)
```

### Bouton Submit:
**AVANT:**
```tsx
<Button type="submit">Créer le Produit</Button>
```

**APRÈS:**
```tsx
<PermissionButton category="products" action="create" type="submit">
  Créer le Produit
</PermissionButton>
```

---

## ✅ 10. Products Edit - `/app/admin/products/edit/[id]/page.tsx`

### Imports:
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper:
```tsx
return (
  <PagePermissionGuard category="products" action="edit">
    {/* Formulaire */}
  </PagePermissionGuard>
)
```

### Bouton Submit:
**AVANT:**
```tsx
<Button type="submit">Enregistrer</Button>
```

**APRÈS:**
```tsx
<PermissionButton category="products" action="edit" type="submit">
  Enregistrer
</PermissionButton>
```

---

## ✅ 11-17. Pages Customization

Pour TOUTES les pages dans `/app/admin/customization/`:

### Imports (même pour toutes):
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"
```

### Envelopper (même pour toutes):
```tsx
return (
  <PagePermissionGuard category="customization" action="view">
    {/* Contenu */}
  </PagePermissionGuard>
)
```

### Boutons Enregistrer (si présents):
**AVANT:**
```tsx
<Button type="submit">Enregistrer</Button>
```

**APRÈS:**
```tsx
<PermissionButton category="customization" action="edit" type="submit">
  Enregistrer
</PermissionButton>
```

### Liste des fichiers à modifier:
- `/app/admin/customization/seo/page.tsx`
- `/app/admin/customization/header/page.tsx`
- `/app/admin/customization/footer/page.tsx`
- `/app/admin/customization/hero-slider/page.tsx`
- `/app/admin/customization/hero-slider/add/page.tsx`
- `/app/admin/customization/countdown/page.tsx`
- `/app/admin/customization/countdown/add/page.tsx`
- `/app/admin/customization/privacy/page.tsx`
- `/app/admin/customization/terms/page.tsx`

---

## 📝 Checklist Finale

Après avoir modifié chaque page, vérifier:

- [ ] Imports ajoutés en haut du fichier
- [ ] `PagePermissionGuard` enveloppe tout le return
- [ ] Catégorie correcte utilisée
- [ ] Action correcte utilisée (view pour les pages principales)
- [ ] Boutons remplacés par `PermissionButton` où nécessaire
- [ ] Pas d'erreurs TypeScript
- [ ] Page se compile sans erreur

## 🧪 Test Rapide

Après protection, tester avec:

1. **Utilisateur ADMIN** - Tout doit fonctionner normalement
2. **Utilisateur PERSONNEL sans permissions** - Message "Accès Refusé"
3. **Utilisateur avec permission "view" uniquement** - Page visible, boutons désactivés

---

## 🚀 Ordre Recommandé

Protéger dans cet ordre pour tester progressivement:

1. ✅ Dashboard (déjà fait)
2. ✅ Products (déjà fait)
3. Orders
4. Customers
5. Categories
6. Settings
7. Customization (toutes les pages en une fois)
8. Reviews
9. Coupons

---

**Temps estimé**: 5-10 minutes par page = ~1-2 heures pour tout protéger
