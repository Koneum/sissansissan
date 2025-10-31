"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check if user has admin access (PERSONNEL, MANAGER, ADMIN, SUPER_ADMIN)
  const hasAdminAccess = user && ['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes((user as any).role)

  useEffect(() => {
    if (!user || !hasAdminAccess) {
      router.push("/signin")
    }
  }, [user, hasAdminAccess, router])

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
