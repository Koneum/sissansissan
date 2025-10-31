"use client"

import { usePermissions } from "@/lib/use-permissions"
import { ReactNode } from "react"

interface PermissionGuardProps {
  category: string
  action: 'view' | 'create' | 'edit' | 'delete'
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ category, action, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  if (!hasPermission(category, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Component pour vérifier si l'utilisateur a au moins une permission dans une catégorie
interface CategoryGuardProps {
  category: string
  children: ReactNode
  fallback?: ReactNode
}

export function CategoryGuard({ category, children, fallback = null }: CategoryGuardProps) {
  const { hasAnyPermission, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  if (!hasAnyPermission(category)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
