"use client"

import { usePermissions } from "@/lib/use-permissions"
import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PermissionButtonProps extends ButtonProps {
  category: string
  action: 'view' | 'create' | 'edit' | 'delete'
  children: React.ReactNode
  showTooltip?: boolean
}

export function PermissionButton({ 
  category, 
  action, 
  children, 
  showTooltip = true,
  disabled,
  ...props 
}: PermissionButtonProps) {
  const { hasPermission, isLoading } = usePermissions()

  const hasAccess = hasPermission(category, action)
  const isDisabled = disabled || !hasAccess

  const getActionLabel = () => {
    switch (action) {
      case 'view': return 'voir'
      case 'create': return 'créer'
      case 'edit': return 'modifier'
      case 'delete': return 'supprimer'
      default: return action
    }
  }

  const getCategoryLabel = () => {
    const labels: { [key: string]: string } = {
      dashboard: 'le dashboard',
      products: 'les produits',
      orders: 'les commandes',
      customers: 'les clients',
      categories: 'les catégories',
      reviews: 'les avis',
      coupons: 'les coupons',
      settings: 'les paramètres',
      staff: 'le personnel',
      customization: 'la personnalisation',
    }
    return labels[category] || category
  }

  if (isLoading) {
    return (
      <Button disabled {...props}>
        {children}
      </Button>
    )
  }

  if (!hasAccess && showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button disabled {...props} className={`${props.className || ''} opacity-50 cursor-not-allowed`}>
                {children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Vous n'avez pas la permission de {getActionLabel()} {getCategoryLabel()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button disabled={isDisabled} {...props}>
      {children}
    </Button>
  )
}
