# 🚀 Système de Permissions - Référence Rapide

## ⚡ Démarrage en 3 Étapes

### 1️⃣ Initialiser
```bash
npx tsx prisma/seed-permissions.ts
```

### 2️⃣ Créer un Utilisateur
Interface: **Settings > Gestion du Personnel > Ajouter un Membre**

### 3️⃣ Tester
Connectez-vous avec le nouvel utilisateur et vérifiez les permissions

---

## 📝 Composants - Cheat Sheet

### Protéger une Page
```tsx
import { PagePermissionGuard } from "@/components/page-permission-guard"

<PagePermissionGuard category="products" action="view">
  {/* Contenu */}
</PagePermissionGuard>
```

### Bouton avec Permission
```tsx
import { PermissionButton } from "@/components/permission-button"

<PermissionButton category="products" action="create" onClick={handleCreate}>
  Ajouter
</PermissionButton>
```

### Afficher/Cacher du Contenu
```tsx
import { PermissionGuard } from "@/components/permission-guard"

<PermissionGuard category="products" action="delete">
  <Button onClick={handleDelete}>Supprimer</Button>
</PermissionGuard>
```

### Lien avec Permission
```tsx
import { PermissionLink } from "@/components/permission-link"

<PermissionLink category="products" action="create" href="/admin/products/add">
  Ajouter un produit
</PermissionLink>
```

### Hook de Permissions
```tsx
import { usePermissions } from "@/lib/use-permissions"

const { hasPermission, canCreate, canEdit, canDelete } = usePermissions()

if (hasPermission('products', 'create')) {
  // Faire quelque chose
}
```

### Vérification Serveur
```tsx
import { requirePermission } from "@/lib/check-permission"

export async function POST(request: Request) {
  const result = await requirePermission(request, 'products', 'canCreate')
  if (result instanceof Response) return result
  
  const { user } = result
  // Continuer...
}
```

---

## 🎯 Catégories Disponibles

| Catégorie | Description |
|-----------|-------------|
| `dashboard` | Tableau de bord |
| `products` | Produits |
| `orders` | Commandes |
| `customers` | Clients |
| `categories` | Catégories |
| `reviews` | Avis |
| `coupons` | Coupons |
| `settings` | Paramètres |
| `staff` | Personnel |
| `customization` | Personnalisation |

## 🔑 Actions Disponibles

| Action | Description |
|--------|-------------|
| `view` | Voir/Consulter |
| `create` | Créer |
| `edit` | Modifier |
| `delete` | Supprimer |

---

## 👥 Rôles

| Rôle | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Toutes automatiquement |
| `ADMIN` | Toutes automatiquement |
| `MANAGER` | À définir |
| `PERSONNEL` | À définir |
| `CUSTOMER` | Aucune (front-end uniquement) |

---

## 🎨 Exemples de Profils

### Personnel de Vente
```
✅ products: view, create
✅ orders: view, create, edit
✅ customers: view
```

### Manager
```
✅ products: all
✅ orders: all
✅ customers: all
✅ reviews: view, edit
✅ settings: view
```

---

## 🔧 Commandes Utiles

### Seeder les Permissions
```bash
npx tsx prisma/seed-permissions.ts
```

### Vérifier les Permissions (SQL)
```sql
SELECT category, COUNT(*) FROM permission GROUP BY category;
```

### Voir les Permissions d'un Utilisateur (SQL)
```sql
SELECT u.name, p.category, up."canView", up."canCreate", up."canEdit", up."canDelete"
FROM "user" u
JOIN user_permission up ON u.id = up."userId"
JOIN permission p ON up."permissionId" = p.id
WHERE u.email = 'user@example.com';
```

---

## 🐛 Dépannage Rapide

| Problème | Solution |
|----------|----------|
| Permissions ne fonctionnent pas | Vérifier que le seeder a été exécuté |
| Boutons ne se désactivent pas | Utiliser `PermissionButton` au lieu de `Button` |
| ADMIN ne peut pas accéder | Vérifier que le rôle est bien "ADMIN" |
| Page toujours accessible | Ajouter `PagePermissionGuard` |

---

## 📚 Documentation Complète

| Document | Pour |
|----------|------|
| `PERMISSIONS_SYSTEM.md` | Documentation détaillée |
| `IMPLEMENTATION_GUIDE.md` | Guide d'implémentation |
| `PERMISSIONS_README.md` | Vue d'ensemble |
| `PERMISSIONS_SUMMARY.md` | Résumé complet |
| `scripts/setup-permissions.md` | Configuration |

---

## ✅ Checklist

- [ ] Seeder exécuté
- [ ] Utilisateur test créé
- [ ] Permissions assignées
- [ ] Tests effectués
- [ ] Pages protégées
- [ ] Boutons protégés
- [ ] API routes sécurisées

---

**Développé par**: Moussa Kone & Aboubakar Sidibe (Kris Beat)
