# Guide d'Implémentation du Responsive Design

## Classes Utilitaires Disponibles

Toutes les classes sont définies dans `app/globals.css` sous `@layer utilities`.

### 1. Text Responsive

```tsx
// Avant
<h1 className="text-3xl">Titre</h1>

// Après
<h1 className="heading-responsive-h1">Titre</h1>
```

| Classe | Tailles | Usage |
|--------|---------|-------|
| `text-responsive-xs` | 10px → xs → sm | Très petit texte |
| `text-responsive-sm` | xs → sm → base | Petit texte |
| `text-responsive-base` | sm → base → lg | Texte normal |
| `text-responsive-lg` | base → lg → xl | Grand texte |
| `text-responsive-xl` | lg → xl → 2xl | Très grand texte |
| `text-responsive-2xl` | xl → 2xl → 3xl | Énorme texte |
| `text-responsive-3xl` | 2xl → 3xl → 4xl | Titre principal |

### 2. Headings Responsive

```tsx
<h1 className="heading-responsive-h1">Titre Principal</h1>
<h2 className="heading-responsive-h2">Sous-titre</h2>
<h3 className="heading-responsive-h3">Section</h3>
<h4 className="heading-responsive-h4">Sous-section</h4>
```

### 3. Spacing Responsive

```tsx
// Padding
<div className="p-responsive">Contenu</div>
<div className="px-responsive">Padding horizontal</div>
<div className="py-responsive">Padding vertical</div>

// Margin
<div className="m-responsive">Contenu</div>
<div className="mx-responsive">Margin horizontal</div>
<div className="my-responsive">Margin vertical</div>

// Gap (pour flex/grid)
<div className="flex gap-responsive">Items</div>
```

### 4. Grid Responsive

```tsx
// 2 colonnes sur mobile, 2 sur tablet
<div className="grid-responsive-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// 1 col mobile, 2 tablet, 3 desktop
<div className="grid-responsive-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// 1 col mobile, 2 tablet, 3 desktop, 4 xl
<div className="grid-responsive-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### 5. Container Responsive

```tsx
// Container avec padding adaptatif
<div className="container-responsive">
  Contenu centré avec padding responsive
</div>
```

### 6. Components Responsive

```tsx
// Button
<button className="btn-responsive">Cliquez-moi</button>

// Card
<div className="card-responsive">Contenu de la carte</div>

// Icon
<Icon className="icon-responsive" />
<Icon className="icon-responsive-lg" />
```

---

## Exemples de Conversion

### Exemple 1: Page Admin

```tsx
// ❌ AVANT
<div className="space-y-6 pb-8">
  <div className="border-b pb-4">
    <h1 className="text-2xl font-semibold">Edit Product</h1>
  </div>
  <Card className="p-6">
    <div className="grid grid-cols-2 gap-4">
      <Input />
      <Input />
    </div>
  </Card>
</div>

// ✅ APRÈS
<div className="space-y-6 pb-8">
  <div className="border-b pb-4">
    <h1 className="heading-responsive-h2">Edit Product</h1>
  </div>
  <Card className="card-responsive">
    <div className="grid-responsive-2">
      <Input />
      <Input />
    </div>
  </Card>
</div>
```

### Exemple 2: Product Card

```tsx
// ❌ AVANT
<div className="p-4">
  <h3 className="text-lg font-semibold">Product Name</h3>
  <p className="text-sm text-gray-600">Description</p>
  <div className="flex gap-2 mt-4">
    <button className="px-4 py-2">Buy</button>
  </div>
</div>

// ✅ APRÈS
<div className="card-responsive">
  <h3 className="heading-responsive-h4">Product Name</h3>
  <p className="text-responsive-sm text-gray-600">Description</p>
  <div className="flex gap-responsive mt-4">
    <button className="btn-responsive">Buy</button>
  </div>
</div>
```

### Exemple 3: Dashboard Stats

```tsx
// ❌ AVANT
<div className="grid grid-cols-4 gap-6">
  <div className="bg-white p-6 rounded-lg">
    <h3 className="text-3xl font-bold">1,234</h3>
    <p className="text-sm">Total Orders</p>
  </div>
</div>

// ✅ APRÈS
<div className="grid-responsive-4">
  <div className="card-responsive bg-white">
    <h3 className="heading-responsive-h2">1,234</h3>
    <p className="text-responsive-sm">Total Orders</p>
  </div>
</div>
```

---

## Pages Prioritaires à Rendre Responsive

### 1. Pages Publiques (Haute priorité)
- [ ] `app/page.tsx` - Homepage
- [ ] `app/shop/page.tsx` - Shop
- [ ] `app/products/[id]/page.tsx` - Product Details
- [ ] `app/cart/page.tsx` - Cart
- [ ] `app/checkout/page.tsx` - Checkout
- [ ] `components/header.tsx` - Header
- [ ] `components/footer.tsx` - Footer
- [ ] `components/product-card.tsx` - Product Card

### 2. Pages Admin (Moyenne priorité)
- [ ] `app/admin/dashboard/page.tsx` - Dashboard
- [ ] `app/admin/products/page.tsx` - Products List
- [ ] `app/admin/products/add/page.tsx` - Add Product
- [ ] `app/admin/products/edit/[id]/page.tsx` - Edit Product
- [ ] `app/admin/orders/page.tsx` - Orders
- [ ] `app/admin/categories/page.tsx` - Categories

### 3. Pages Customization (Basse priorité)
- [ ] `app/admin/customization/*` - Toutes les pages

---

## Checklist de Test

Pour chaque page responsive, tester sur :

- [ ] Mobile (320px - 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (1024px - 1280px)
- [ ] Large Desktop (1280px+)

### Points à vérifier
- [ ] Texte lisible sur tous les écrans
- [ ] Boutons cliquables (min 44x44px sur mobile)
- [ ] Images adaptées (pas de débordement)
- [ ] Navigation accessible
- [ ] Formulaires utilisables
- [ ] Grilles qui s'adaptent
- [ ] Pas de scroll horizontal

---

## Outils de Test

### Chrome DevTools
1. F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Tester différentes tailles :
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

### Breakpoints Tailwind
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## Conseils

1. **Commencer par le mobile** (Mobile-first)
2. **Tester régulièrement** sur différents écrans
3. **Utiliser les classes utilitaires** au lieu de créer du CSS custom
4. **Penser à l'accessibilité** (tailles de boutons, contraste)
5. **Optimiser les images** pour mobile (tailles différentes)
