"use client"

import { usePermissions } from "@/lib/use-permissions"

/**
 * Hook simplifie pour verifier les permissions
 * Usage: const can = useCan()
 * if (can.create('products')) { ... }
 */
export function useCan() {
  const { canView, canCreate, canEdit, canDelete, hasAnyPermission } = usePermissions()

  return {
    view: canView,
    create: canCreate,
    edit: canEdit,
    delete: canDelete,
    access: hasAnyPermission,
  }
}
