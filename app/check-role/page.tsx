"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function CheckRolePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [permissions, setPermissions] = useState<any[]>([])
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      fetchUserPermissions()
    }
  }, [user, isLoading])

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch(`/api/admin/staff/${(user as any).id}`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || [])
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
    } finally {
      setPermissionsLoaded(true)
    }
  }

  useEffect(() => {
    if (!isLoading && permissionsLoaded) {
      if (!user) {
        // Pas connecté, retour à la page de connexion
        router.replace("/signin")
      } else {
        // Vérifier le rôle et rediriger
        const userRole = (user as any).role
        
        console.log('CheckRole - User:', user)
        console.log('CheckRole - Role:', userRole)
        console.log('CheckRole - Permissions:', permissions)
        
        // CUSTOMER -> compte client
        if (userRole === "CUSTOMER") {
          console.log('Redirecting to /account')
          router.replace("/account")
          return
        }
        
        // ADMIN et SUPER_ADMIN -> dashboard
        if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
          console.log('Redirecting to /admin/dashboard')
          router.replace("/admin/dashboard")
          return
        }
        
        // PERSONNEL et MANAGER -> rediriger selon permissions
        if (userRole === "PERSONNEL" || userRole === "MANAGER") {
          // Vérifier si a permission dashboard
          const hasDashboardPermission = permissions.some(
            p => p.permission.category === 'dashboard' && p.canView
          )
          
          if (hasDashboardPermission) {
            console.log('Redirecting to /admin/dashboard')
            router.replace("/admin/dashboard")
            return
          }
          
          // Sinon, rediriger vers la première page accessible
          // Ordre de priorité: orders > customers > products > categories > staff
          const priorityOrder = ['orders', 'customers', 'products', 'categories', 'staff']
          
          for (const category of priorityOrder) {
            const hasPermission = permissions.some(
              p => p.permission.category === category && p.canView
            )
            if (hasPermission) {
              const routes: { [key: string]: string } = {
                'orders': '/admin/orders',
                'customers': '/admin/customers',
                'products': '/admin/products',
                'categories': '/admin/categories',
                'staff': '/admin/settings/users',
              }
              console.log(`Redirecting to ${routes[category]}`)
              router.replace(routes[category])
              return
            }
          }
          
          // Si aucune permission, rediriger vers signin
          console.log('No permissions found, redirecting to /signin')
          router.replace("/signin")
        }
      }
    }
  }, [user, isLoading, permissions, permissionsLoaded, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Vérification de votre rôle...</p>
        <p className="text-xs text-muted-foreground mt-2">
          {isLoading ? 'Chargement...' : user ? `Connecté: ${user.email}` : 'Non connecté'}
        </p>
      </div>
    </div>
  )
}
