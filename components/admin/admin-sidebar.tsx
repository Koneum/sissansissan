"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  FolderTree,
  Settings,
  ChevronDown,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { usePermissions } from "@/lib/use-permissions"

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { t } = useLocale()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { hasAnyPermission } = usePermissions()

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const allMenuItems = [
    { icon: LayoutDashboard, label: t.admin.dashboard, href: "/admin/dashboard", permission: "dashboard" },
    { icon: ShoppingBag, label: t.admin.orders, href: "/admin/orders", permission: "orders" },
    { icon: Users, label: t.admin.customers, href: "/admin/customers", permission: "customers" },
    {
      icon: Package,
      label: t.admin.products,
      href: "/admin/products",
      permission: "products",
      submenu: [
        { label: t.admin.allProducts, href: "/admin/products" },
        { label: t.admin.addProduct, href: "/admin/products/add" },
      ],
    },
    {
      icon: FolderTree,
      label: t.admin.categories,
      href: "/admin/categories",
      permission: "categories",
      submenu: [
        { label: t.admin.allCategories, href: "/admin/categories" },
        { label: t.admin.addCategory, href: "/admin/categories/add" },
      ],
    },
    // { icon: Ticket, label: t.admin.coupons, href: "/admin/coupons", permission: "coupons" },
    // { icon: Star, label: t.admin.reviews, href: "/admin/reviews", permission: "reviews" },
    {
      icon: Settings,
      label: t.admin.settings,
      href: "/admin/settings",
      permission: "settings",
      submenu: [
        { label: t.admin.settings, href: "/admin/settings" },
        { label: t.admin.manager, href: "/admin/settings/users", permission: "staff" },
      ],
    },
    {
      icon: Palette,
      label: t.admin.customization,
      href: "/admin/customization",
      permission: "customization",
      submenu: [
        { label: t.admin.seo, href: "/admin/customization/seo" },
        { label: t.admin.header, href: "/admin/customization/header" },
        { label: t.admin.footer, href: "/admin/customization/footer" },
        // { label: "Hero Banner", href: "/admin/customization/hero-banner" },
        { label: t.admin.mainSlider, href: "/admin/customization/hero-slider" },
        { label: t.admin.countdown, href: "/admin/customization/countdown" },
        { label: t.footer.privacyPolicy, href: "/admin/customization/privacy" },
        { label: t.footer.termsConditions, href: "/admin/customization/terms" },
      ],
    },
  ]

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => {
    // If no permission specified, show to everyone
    if (!item.permission) return true
    // Check if user has any permission for this category
    return hasAnyPermission(item.permission)
  }).map(item => {
    // Filter submenu items if they have permissions
    if (item.submenu) {
      const filteredSubmenu = item.submenu.filter((subitem: any) => {
        if (!subitem.permission) return true
        return hasAnyPermission(subitem.permission)
      })
      return { ...item, submenu: filteredSubmenu }
    }
    return item
  })

  const sidebarContent = (
    <>
      <Link href="/" className="flex items-center gap-2 mb-6 sm:mb-8 px-2">
        <img src="/Sissan-logo-150-150.png" alt="Zissan-Sissan" className="h-10 sm:h-12 w-auto" />
      </Link>

      <div className="mb-4 px-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.nav.menu || "MENU"}</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const isExpanded = expandedItems.includes(item.label)
          const hasSubmenu = item.submenu && item.submenu.length > 0

          return (
            <div key={item.label}>
              {hasSubmenu ? (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-10 sm:h-auto",
                    isActive && "bg-orange-50 dark:bg-orange-950 text-[#F97316] dark:text-[#FB923C]",
                  )}
                  onClick={() => toggleExpand(item.label)}
                >
                  <div className="flex items-center">
                    <Icon className="icon-responsive mr-2 sm:mr-3" />
                    <span className="text-responsive-sm">{item.label}</span>
                  </div>
                  <ChevronDown className={cn("icon-responsive transition-transform", isExpanded && "rotate-180")} />
                </Button>
              ) : (
                <Link href={item.href} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-10 sm:h-auto",
                      isActive && "bg-orange-50 dark:bg-orange-950 text-[#F97316] dark:text-[#FB923C]",
                    )}
                  >
                    <Icon className="icon-responsive mr-2 sm:mr-3" />
                    <span className="text-responsive-sm">{item.label}</span>
                  </Button>
                </Link>
              )}

              {hasSubmenu && isExpanded && (
                <div className="ml-3 sm:ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3 sm:pl-4">
                  {item.submenu?.map((subitem) => (
                    <Link key={subitem.href} href={subitem.href} onClick={onClose}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-responsive-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 h-9",
                          pathname === subitem.href && "bg-orange-50 dark:bg-orange-950 text-[#F97316] dark:text-[#FB923C]",
                        )}
                      >
                        {subitem.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-background border-r min-h-screen p-4 overflow-y-auto sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar - Sheet Drawer */}
      <Sheet open={open} onOpenChange={onClose} modal>
        <SheetContent 
          side="left" 
          className="w-[280px] sm:w-[320px] p-0 flex flex-col h-full z-[100]"
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h2 className="heading-responsive-h3 text-slate-900 dark:text-white">Menu Admin</h2>
          </div>
          
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarContent}
          </div>
          
          {/* Footer info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs text-muted-foreground text-center">
              Admin Panel v1.0
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
