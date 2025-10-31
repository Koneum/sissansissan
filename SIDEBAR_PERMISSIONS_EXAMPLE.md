# Exemple Sidebar avec Permissions

## Modification de admin-sidebar.tsx

Ajouter le hook usePermissions et filtrer les menus:

```typescript
import { usePermissions } from "@/lib/use-permissions"

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { hasAnyPermission } = usePermissions()
  
  // Definir les permissions requises pour chaque menu
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      href: "/admin/dashboard",
      permission: "dashboard" 
    },
    { 
      icon: ShoppingBag, 
      label: "Commandes", 
      href: "/admin/orders",
      permission: "orders"
    },
    { 
      icon: Users, 
      label: "Clients", 
      href: "/admin/customers",
      permission: "customers"
    },
    {
      icon: Package,
      label: "Produits",
      href: "/admin/products",
      permission: "products",
      submenu: [
        { label: "Tous les produits", href: "/admin/products" },
        { label: "Ajouter produit", href: "/admin/products/add" },
      ],
    },
    {
      icon: FolderTree,
      label: "Categories",
      href: "/admin/categories",
      permission: "categories",
      submenu: [
        { label: "Toutes les categories", href: "/admin/categories" },
        { label: "Ajouter categorie", href: "/admin/categories/add" },
      ],
    },
    {
      icon: Settings,
      label: "Parametres",
      href: "/admin/settings",
      permission: "settings",
      submenu: [
        { label: "Parametres", href: "/admin/settings" },
        { label: "Personnel", href: "/admin/settings/users", permission: "staff" },
      ],
    },
  ]
  
  // Filtrer les menus selon permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (!item.permission) return true // Pas de permission requise
    return hasAnyPermission(item.permission) // Verifier permission
  })
  
  return (
    <nav>
      {visibleMenuItems.map(item => (
        // Render menu item
      ))}
    </nav>
  )
}
```

## Resultat

### Utilisateur avec toutes permissions
- Dashboard
- Commandes
- Clients
- Produits
- Categories
- Parametres

### Utilisateur avec permissions limitees (perso@sissan.com)
- Dashboard (si permission)
- Commandes (voir uniquement)
- Clients (voir uniquement)
- Produits (tout)
- Categories (tout)
- Parametres (masque si pas permission staff)

### Menus masques
Les menus sans permission ne s'affichent pas du tout dans la sidebar.
