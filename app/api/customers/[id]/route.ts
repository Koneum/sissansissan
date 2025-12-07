import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkPermission } from "@/lib/check-permission"
import { updateCustomerRoleSchema, validateData } from "@/lib/validations"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/customers/[id] - Get a single customer (PROTECTED)
// Requiert la permission customers.canView
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. AUTORISATION (permission customers.canView)
    // ========================================
    const { authorized, error: permError } = await checkPermission(request, 'customers', 'canView')
    
    if (!authorized) {
      return NextResponse.json(
        { error: permError || "Permission refusée" },
        { status: 403 }
      )
    }

    // ========================================
    // 3. RÉCUPÉRER LE CLIENT
    // ========================================
    const { id } = await context.params
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    thumbnail: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        addresses: true,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    )
  }
}

// PATCH /api/customers/[id] - Update customer role (PROTECTED)
// Requiert la permission customers.canEdit
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. AUTORISATION (permission customers.canEdit)
    // ========================================
    const { authorized, error: permError } = await checkPermission(request, 'customers', 'canEdit')
    
    if (!authorized) {
      return NextResponse.json(
        { error: permError || "Permission refusée" },
        { status: 403 }
      )
    }

    // ========================================
    // 3. VALIDATION DES DONNÉES
    // ========================================
    const { id } = await context.params
    const body = await request.json()
    const validation = validateData(updateCustomerRoleSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, issues: validation.issues },
        { status: 400 }
      )
    }

    const { role } = validation.data!

    // ========================================
    // 4. VÉRIFICATION DE SÉCURITÉ SUPPLÉMENTAIRE
    // ========================================
    // Empêcher un non-SUPER_ADMIN de créer un SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: "Seul un SUPER_ADMIN peut attribuer le rôle SUPER_ADMIN" },
        { status: 403 }
      )
    }

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete a customer (PROTECTED)
// Requiert la permission customers.canDelete
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. AUTORISATION (permission customers.canDelete)
    // ========================================
    const { authorized, error: permError } = await checkPermission(request, 'customers', 'canDelete')
    
    if (!authorized) {
      return NextResponse.json(
        { error: permError || "Permission refusée" },
        { status: 403 }
      )
    }

    // ========================================
    // 3. VÉRIFIER ET SUPPRIMER
    // ========================================
    const { id } = await context.params
    
    // Empêcher la suppression de soi-même
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      )
    }

    // Check if customer has orders
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    if (customer._count.orders > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with existing orders" },
        { status: 400 }
      )
    }

    // Empêcher la suppression d'un SUPER_ADMIN par un non-SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (customer.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: "Seul un SUPER_ADMIN peut supprimer un autre SUPER_ADMIN" },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    )
  }
}

