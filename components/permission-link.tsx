"use client"

import { usePermissions } from "@/lib/use-permissions"
import Link from "next/link"
import { ReactNode } from "react"

interface PermissionLinkProps {
  category: string
  action?: 'view' | 'create' | 'edit' | 'delete'
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function PermissionLink({ 
  category, 
  action = 'view',
  href, 
  children, 
  className,
  onClick 
}: PermissionLinkProps) {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  const hasAccess = hasPermission(category, action)

  if (!hasAccess) {
    return null
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

// Component pour les liens qui nécessitent seulement une permission dans la catégorie
interface CategoryLinkProps {
  category: string
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function CategoryLink({ 
  category, 
  href, 
  children, 
  className,
  onClick 
}: CategoryLinkProps) {
  const { hasAnyPermission, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  const hasAccess = hasAnyPermission(category)

  if (!hasAccess) {
    return null
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}




