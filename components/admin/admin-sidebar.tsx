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

export function AdminSidebar() {
  const { t } = useLocale()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const menuItems = [
    { icon: LayoutDashboard, label: t.admin.dashboard, href: "/admin/dashboard" },
    { icon: ShoppingBag, label: t.admin.orders, href: "/admin/orders" },
    { icon: Users, label: t.admin.customers, href: "/admin/customers" },
    {
      icon: Package,
      label: t.admin.products,
      href: "/admin/products",
      submenu: [
        { label: t.admin.allProducts, href: "/admin/products" },
        { label: t.admin.addProduct, href: "/admin/products/add" },
      ],
    },
    {
      icon: FolderTree,
      label: t.admin.categories,
      href: "/admin/categories",
      submenu: [
        { label: t.admin.allCategories, href: "/admin/categories" },
        { label: t.admin.addCategory, href: "/admin/categories/add" },
      ],
    },
    // { icon: Ticket, label: t.admin.coupons, href: "/admin/coupons" },
    // { icon: Star, label: t.admin.reviews, href: "/admin/reviews" },
    {
      icon: Settings,
      label: t.admin.settings,
      href: "/admin/settings",
      submenu: [
        { label: t.admin.settings, href: "/admin/settings" },
        { label: t.admin.manager, href: "/admin/settings/users" },
      ],
    },
    {
      icon: Palette,
      label: t.admin.customization,
      href: "/admin/customization",
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

  return (
    <aside className="w-64 bg-background border-r min-h-screen p-4 overflow-y-auto">
      <Link href="/" className="flex items-center gap-2 mb-8 px-2">
        <img src="/logo.png" alt="Zissan-Sissan" className="h-12 w-auto" />
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
                    "w-full justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                    isActive && "bg-blue-50 dark:bg-blue-950 text-[#2E5BA8] dark:text-[#4F7FD5]",
                  )}
                  onClick={() => toggleExpand(item.label)}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                </Button>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                      isActive && "bg-blue-50 dark:bg-blue-950 text-[#2E5BA8] dark:text-[#4F7FD5]",
                    )}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                </Link>
              )}

              {hasSubmenu && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                  {item.submenu?.map((subitem) => (
                    <Link key={subitem.href} href={subitem.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                          pathname === subitem.href && "bg-blue-50 dark:bg-blue-950 text-[#2E5BA8] dark:text-[#4F7FD5]",
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
    </aside>
  )
}
