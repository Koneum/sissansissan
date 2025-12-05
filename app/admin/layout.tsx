"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Loader2 } from "lucide-react"
import { useAdminInactivity } from "@/lib/use-admin-inactivity"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Hook pour déconnecter après 30 min d'inactivité
  useAdminInactivity()

  // Check if user has admin access (PERSONNEL, MANAGER, ADMIN, SUPER_ADMIN)
  const hasAdminAccess = user && ['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes((user as any).role)

  useEffect(() => {
    // Ne rediriger que si le chargement est terminé et l'utilisateur n'a pas accès
    if (!isLoading && (!user || !hasAdminAccess)) {
      router.push("/signin")
    }
  }, [user, hasAdminAccess, router, isLoading])

  // Afficher un loader pendant le chargement de la session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si pas d'accès après le chargement, ne rien afficher (la redirection est en cours)
  if (!user || !hasAdminAccess) return null

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 w-full min-w-0 p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
