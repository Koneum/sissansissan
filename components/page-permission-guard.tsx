"use client"

import { usePermissions } from "@/lib/use-permissions"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PagePermissionGuardProps {
  category: string
  action?: 'view' | 'create' | 'edit' | 'delete'
  children: ReactNode
  requireAny?: boolean // Si true, vérifie seulement si l'utilisateur a une permission dans la catégorie
}

export function PagePermissionGuard({ 
  category, 
  action = 'view',
  children,
  requireAny = false
}: PagePermissionGuardProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions()
  const router = useRouter()

  const hasAccess = requireAny 
    ? hasAnyPermission(category) 
    : hasPermission(category, action)

  useEffect(() => {
    // Redirect to dashboard if no access after loading
    if (!isLoading && !hasAccess) {
      // Optional: You can redirect or just show the no access message
      // router.push('/admin/dashboard')
    }
  }, [isLoading, hasAccess, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <CardTitle>Accès Refusé</CardTitle>
            </div>
            <CardDescription>
              Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Veuillez contacter votre administrateur si vous pensez que vous devriez avoir accès à cette fonctionnalité.
            </p>
            <Button onClick={() => router.push('/admin/dashboard')} className="w-full">
              Retour au Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}




