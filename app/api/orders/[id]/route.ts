import { logOrderStatusChange, logUpdate } from "@/lib/audit-log"
import { checkPermission } from "@/lib/check-permission"
import { sendOrderStatusEmail } from "@/lib/email"
import { getSession } from "@/lib/get-session"
import prisma from "@/lib/prisma"
import { sendOrderStatusPush } from "@/lib/push-notifications"
import { sendOrderStatusSMS } from "@/lib/sms"
import { updateOrderSchema, validateData } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/orders/[id] - Get order details (PROTECTED)
// - L'utilisateur peut voir sa propre commande
// - Admin/Staff avec permission orders.canView peut voir toutes les commandes
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // ========================================
    // 2. RÉCUPÉRER LA COMMANDE
    // ========================================
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            pushToken: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                discountPrice: true
              }
            }
          }
        },
        coupon: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // ========================================
    // 3. AUTORISATION - Vérifier l'accès
    // ========================================
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)
    const hasOrderPermission = isAdmin || (await checkPermission(request, 'orders', 'canView')).authorized
    const isOwner = order.userId === currentUser.id

    // L'utilisateur doit être propriétaire OU avoir la permission
    if (!isOwner && !hasOrderPermission) {
      return NextResponse.json(
        { success: false, error: "Accès refusé à cette commande" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Update order (PROTECTED - Admin/Staff only)
// Requiert la permission orders.canEdit
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. AUTORISATION (permission orders.canEdit)
    // ========================================
    const { authorized, error: permError } = await checkPermission(request, 'orders', 'canEdit')
    
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: permError || "Permission refusée" },
        { status: 403 }
      )
    }

    // ========================================
    // 3. VALIDATION DES DONNÉES
    // ========================================
    const { id } = await context.params
    const body = await request.json()
    const validation = validateData(updateOrderSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, issues: validation.issues },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    const validatedData = validation.data!

    if (validatedData.status) {
      updateData.status = validatedData.status
      
      // Update timestamps based on status
      if (validatedData.status === "SHIPPED" && !order.shippedAt) {
        updateData.shippedAt = new Date()
      } else if (validatedData.status === "DELIVERED" && !order.deliveredAt) {
        updateData.deliveredAt = new Date()
      }
    }

    if (validatedData.paymentStatus) {
      updateData.paymentStatus = validatedData.paymentStatus
    }

    if (validatedData.trackingNumber !== undefined) {
      updateData.trackingNumber = validatedData.trackingNumber
    }

    if (validatedData.adminNotes !== undefined) {
      updateData.adminNotes = validatedData.adminNotes
    }

    if (validatedData.paymentId !== undefined) {
      updateData.paymentId = validatedData.paymentId
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            pushToken: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Log du changement de statut
    if (validatedData.status && validatedData.status !== order.status) {
      await logOrderStatusChange(request, id, order.status, validatedData.status)
      
      // Envoyer les notifications de changement de statut
      try {
        const statusForEmail = validatedData.status as 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
        const statusForSMS = validatedData.status as 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
        
        // Email de changement de statut
        if (updatedOrder.user?.email) {
          sendOrderStatusEmail({
            orderNumber: updatedOrder.orderNumber,
            customerName: updatedOrder.user.name,
            email: updatedOrder.user.email,
            status: statusForEmail,
            trackingNumber: updatedOrder.trackingNumber || undefined,
            total: updatedOrder.total
          }).catch(err => console.error('Erreur envoi email statut:', err))
        }
        
        // SMS de changement de statut (seulement pour certains statuts)
        if (['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(validatedData.status)) {
          const phone = updatedOrder.user?.phone || (updatedOrder.shippingAddress as any)?.phone
          if (phone) {
            sendOrderStatusSMS(
              phone, 
              updatedOrder.orderNumber, 
              statusForSMS,
              updatedOrder.trackingNumber || undefined
            ).catch(err => console.error('Erreur envoi SMS statut:', err))
          }
        }
        
        // Push notification de changement de statut
        if (updatedOrder.user?.pushToken) {
          sendOrderStatusPush(
            updatedOrder.user.pushToken,
            updatedOrder.orderNumber,
            updatedOrder.id,
            statusForEmail
          ).catch(err => console.error('Erreur envoi push statut:', err))
        }
      } catch (notifError) {
        console.error('Erreur notifications statut:', notifError)
      }
    } else {
      // Log de mise à jour générale
      await logUpdate(request, 'order', id, {
        orderNumber: order.orderNumber,
        changes: updateData
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully"
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Cancel order (PROTECTED)
// - L'utilisateur peut annuler sa propre commande (si PENDING)
// - Admin/Staff avec permission orders.canDelete peut annuler toute commande
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // ========================================
    // 2. AUTORISATION
    // ========================================
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)
    const hasDeletePermission = isAdmin || (await checkPermission(request, 'orders', 'canDelete')).authorized
    const isOwner = order.userId === currentUser.id

    // L'utilisateur normal ne peut annuler que ses propres commandes en PENDING
    if (!hasDeletePermission) {
      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: "Accès refusé à cette commande" },
          { status: 403 }
        )
      }
      
      // L'utilisateur normal ne peut annuler que les commandes PENDING
      if (order.status !== "PENDING") {
        return NextResponse.json(
          { success: false, error: "Vous ne pouvez annuler que les commandes en attente" },
          { status: 400 }
        )
      }
    } else {
      // Admin peut annuler PENDING ou PROCESSING
      if (!["PENDING", "PROCESSING"].includes(order.status)) {
        return NextResponse.json(
          { success: false, error: "Cannot cancel order in current status" },
          { status: 400 }
        )
      }
    }

    // Cancel order and restore stock in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "FAILED"
        }
      })

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }

      // Restore coupon usage if applicable
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usedCount: {
              decrement: 1
            }
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully"
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    )
  }
}

