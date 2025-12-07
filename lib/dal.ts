/**
 * Data Access Layer (DAL) - Couche d'accès aux données sécurisée
 * 
 * Ce fichier centralise l'accès aux données avec des vérifications
 * d'authentification et d'autorisation intégrées.
 * 
 * IMPORTANT: Ce fichier ne peut être importé que côté serveur grâce à "server-only"
 * Toute tentative d'import côté client génèrera une erreur de build.
 * 
 * @see https://nextjs.org/docs/app/guides/data-security
 */
import "server-only"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cache } from "react"

// ============================================
// TYPES
// ============================================
export type DALResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'ERROR'
}

// ============================================
// SESSION HELPER (avec cache React)
// ============================================
/**
 * Récupère la session courante avec mise en cache
 * Évite les appels multiples à getSession dans le même render
 */
export const getCurrentSession = cache(async () => {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })
  return session
})

/**
 * Récupère l'utilisateur courant avec son rôle
 */
export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession()
  
  if (!session?.user) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      image: true,
    }
  })

  return user
})

// ============================================
// HELPER D'AUTORISATION
// ============================================
/**
 * Vérifie si l'utilisateur a un rôle admin/staff
 */
export async function isStaff(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return ['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)
}

/**
 * Vérifie si l'utilisateur est admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
}

// ============================================
// PRODUITS - DATA ACCESS
// ============================================
/**
 * Récupère un produit par son slug (public)
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      variants: true,
      reviews: {
        where: { status: 'APPROVED' },
        include: {
          user: {
            select: { name: true, image: true }
          }
        }
      }
    }
  })
}

/**
 * Récupère un produit par ID (admin only)
 */
export async function getProductById(id: string): Promise<DALResult<any>> {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "Non authentifié", code: 'UNAUTHENTICATED' }
  }

  if (!['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { success: false, error: "Accès refusé", code: 'UNAUTHORIZED' }
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
    }
  })

  if (!product) {
    return { success: false, error: "Produit non trouvé", code: 'NOT_FOUND' }
  }

  return { success: true, data: product }
}

// ============================================
// COMMANDES - DATA ACCESS
// ============================================
/**
 * Récupère les commandes de l'utilisateur courant
 */
export async function getUserOrders(): Promise<DALResult<any[]>> {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "Non authentifié", code: 'UNAUTHENTICATED' }
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, thumbnail: true, slug: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { success: true, data: orders }
}

/**
 * Récupère une commande par ID (propriétaire ou admin)
 */
export async function getOrderById(orderId: string): Promise<DALResult<any>> {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "Non authentifié", code: 'UNAUTHENTICATED' }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true }
      },
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, thumbnail: true }
          }
        }
      },
      coupon: true
    }
  })

  if (!order) {
    return { success: false, error: "Commande non trouvée", code: 'NOT_FOUND' }
  }

  // Vérifier l'accès: propriétaire ou admin
  const isOwner = order.userId === user.id
  const hasAccess = isOwner || ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'PERSONNEL'].includes(user.role)

  if (!hasAccess) {
    return { success: false, error: "Accès refusé à cette commande", code: 'UNAUTHORIZED' }
  }

  return { success: true, data: order }
}

// ============================================
// CLIENTS - DATA ACCESS (Admin Only)
// ============================================
/**
 * Récupère la liste des clients (admin/staff only)
 */
export async function getCustomers(): Promise<DALResult<any[]>> {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "Non authentifié", code: 'UNAUTHENTICATED' }
  }

  if (!['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { success: false, error: "Accès réservé au personnel", code: 'UNAUTHORIZED' }
  }

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { success: true, data: customers }
}

/**
 * Récupère un client par ID (admin/staff only)
 */
export async function getCustomerById(customerId: string): Promise<DALResult<any>> {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "Non authentifié", code: 'UNAUTHENTICATED' }
  }

  if (!['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { success: false, error: "Accès réservé au personnel", code: 'UNAUTHORIZED' }
  }

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      addresses: true,
      _count: { select: { orders: true } }
    }
  })

  if (!customer) {
    return { success: false, error: "Client non trouvé", code: 'NOT_FOUND' }
  }

  return { success: true, data: customer }
}

// ============================================
// PROFIL UTILISATEUR - DATA ACCESS
// ============================================
/**
 * Récupère le profil de l'utilisateur courant
 */
export async function getCurrentUserProfile(): Promise<DALResult<any>> {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "Non authentifié", code: 'UNAUTHENTICATED' }
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
      addresses: true,
      _count: {
        select: { orders: true, wishlistItems: true }
      }
    }
  })

  if (!profile) {
    return { success: false, error: "Profil non trouvé", code: 'NOT_FOUND' }
  }

  return { success: true, data: profile }
}

// ============================================
// DASHBOARD STATS - DATA ACCESS (Admin Only)
// ============================================
/**
 * Récupère les statistiques du dashboard (admin/staff only)
 */
export async function getDashboardStats(): Promise<DALResult<any>> {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "Non authentifié", code: 'UNAUTHENTICATED' }
  }

  if (!['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { success: false, error: "Accès réservé au personnel", code: 'UNAUTHORIZED' }
  }

  const [totalOrders, totalCustomers, totalProducts, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    })
  ])

  return {
    success: true,
    data: {
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders
    }
  }
}
