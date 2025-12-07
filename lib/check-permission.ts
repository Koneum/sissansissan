import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * Vérifie si l'utilisateur a une permission spécifique
 * Utilisé côté serveur dans les API routes
 */
export async function checkPermission(
  request: Request,
  category: string,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return { authorized: false, error: 'Non authentifié' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        permissions: { 
          include: { permission: true } 
        } 
      }
    })

    if (!user) {
      return { authorized: false, error: 'Utilisateur non trouvé' }
    }

    // ADMIN et SUPER_ADMIN ont tous les droits
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return { authorized: true, user }
    }

    // Vérifier la permission spécifique
    const hasPermission = user.permissions.some(
      up => up.permission.category === category && up[action]
    )

    if (!hasPermission) {
      return { 
        authorized: false, 
        user,
        error: `Permission refusée: ${category}.${action}` 
      }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error('Error checking permission:', error)
    return { 
      authorized: false, 
      error: 'Erreur lors de la vérification des permissions' 
    }
  }
}

/**
 * Vérifie si l'utilisateur a au moins une permission dans une catégorie
 */
export async function checkCategoryAccess(
  request: Request,
  category: string
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return { authorized: false, error: 'Non authentifié' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        permissions: { 
          include: { permission: true } 
        } 
      }
    })

    if (!user) {
      return { authorized: false, error: 'Utilisateur non trouvé' }
    }

    // ADMIN et SUPER_ADMIN ont tous les droits
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return { authorized: true, user }
    }

    // Vérifier si l'utilisateur a au moins une permission dans la catégorie
    const hasAccess = user.permissions.some(
      up => up.permission.category === category && 
            (up.canView || up.canCreate || up.canEdit || up.canDelete)
    )

    if (!hasAccess) {
      return { 
        authorized: false, 
        user,
        error: `Accès refusé à la catégorie: ${category}` 
      }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error('Error checking category access:', error)
    return { 
      authorized: false, 
      error: 'Erreur lors de la vérification des permissions' 
    }
  }
}

/**
 * Middleware pour protéger les routes API
 * Retourne une Response d'erreur si non autorisé
 */
export async function requirePermission(
  request: Request,
  category: string,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete'
): Promise<{ user: any } | Response> {
  const { authorized, user, error } = await checkPermission(request, category, action)
  
  if (!authorized) {
    return new Response(
      JSON.stringify({ error: error || 'Non autorisé' }), 
      { 
        status: user ? 403 : 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return { user }
}

/**
 * Vérifie si l'utilisateur est ADMIN ou SUPER_ADMIN
 */
export async function isAdmin(request: Request): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}



