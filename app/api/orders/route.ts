import { checkPermission } from "@/lib/check-permission"
import { sendNewOrderNotificationToAdmins, sendOrderConfirmationEmail } from "@/lib/email"
import { getSession } from "@/lib/get-session"
import prisma from "@/lib/prisma"
import { sendOrderConfirmationPush } from "@/lib/push-notifications"
import { sendOrderConfirmationSMS } from "@/lib/sms"
import { createOrderSchema, validateData } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

// Helper function to generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// GET /api/orders - Get orders (PROTECTED)
// - Admins avec permission orders.canView peuvent voir toutes les commandes
// - Les utilisateurs normaux ne voient que leurs propres commandes
export async function GET(request: NextRequest) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION (cookies ou Bearer token)
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié", code: "UNAUTHENTICATED" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. RÉCUPÉRER L'UTILISATEUR ET SON RÔLE
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

    const searchParams = request.nextUrl.searchParams
    
    // Filters
    const requestedUserId = searchParams.get("userId")
    const status = searchParams.get("status")
    const paymentStatus = searchParams.get("paymentStatus")
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    // ========================================
    // 3. AUTORISATION - Vérifier l'accès aux commandes
    // ========================================
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)
    const hasOrderPermission = isAdmin || (await checkPermission(request, 'orders', 'canView')).authorized

    if (hasOrderPermission) {
      // Admin/Staff avec permission: peut filtrer par userId ou voir toutes les commandes
      if (requestedUserId) {
        where.userId = requestedUserId
      }
    } else {
      // Utilisateur normal: ne peut voir que ses propres commandes
      where.userId = currentUser.id
    }
    
    if (status) {
      where.status = status
    }
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
                  price: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create a new order (PROTECTED)
// L'utilisateur doit être authentifié et ne peut créer que pour lui-même
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION (cookies ou Bearer token)
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié", code: "UNAUTHENTICATED" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. VALIDATION DES DONNÉES
    // ========================================
    const body = await request.json()
    const validation = validateData(createOrderSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, issues: validation.issues },
        { status: 400 }
      )
    }

    const {
      userId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      customerNotes
    } = validation.data!

    // ========================================
    // 3. AUTORISATION - Vérifier que l'utilisateur crée pour lui-même
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
    
    // Un utilisateur normal ne peut créer que pour lui-même
    if (!isAdmin && userId !== currentUser.id) {
      return NextResponse.json(
        { success: false, error: "Vous ne pouvez pas créer de commande pour un autre utilisateur" },
        { status: 403 }
      )
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Verify all products exist and calculate totals
    let subtotal = 0
    const orderItems: any[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product ${product.name} is not available` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const price = product.discountPrice || product.price
      subtotal += price * item.quantity

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        variantId: item.variantId || null,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPrice: product.discountPrice
        }
      })
    }

    // Apply coupon if provided
    let discount = 0
    let couponId = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      })

      if (coupon && coupon.status === "ACTIVE") {
        // Verify coupon is valid
        const now = new Date()
        const isValid = 
          (!coupon.validFrom || coupon.validFrom <= now) &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          (!coupon.minPurchase || subtotal >= coupon.minPurchase)

        if (isValid) {
          couponId = coupon.id
          
          if (coupon.discountType === "PERCENTAGE") {
            discount = (subtotal * coupon.discountValue) / 100
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount
            }
          } else if (coupon.discountType === "FIXED") {
            discount = coupon.discountValue
          }
          // FREE_SHIPPING will be handled in shipping calculation
        }
      }
    }

    // Calculate shipping (simplified - can be enhanced)
    const shipping = couponCode && couponId ? 0 : 10 // Free if using free shipping coupon
    
    // Calculate tax (simplified - 10%)
    const tax = (subtotal - discount) * 0.1
    
    // Calculate total
    const total = subtotal - discount + shipping + tax

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          items: {
            create: orderItems
          },
          subtotal,
          tax,
          shipping,
          discount,
          total,
          couponCode,
          couponId,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          customerNotes
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              pushToken: true
            }
          }
        }
      })

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // Update coupon usage if applicable
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: {
              increment: 1
            }
          }
        })
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId }
      })

      return newOrder
    })

    // Envoyer les notifications (en arrière-plan, ne bloque pas la réponse)
    try {
      const shippingAddr = order.shippingAddress as any
      
      // Email de confirmation
      if (order.user?.email) {
        sendOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: order.user.name,
          email: order.user.email,
          items: order.items.map(item => ({
            name: (item.productSnapshot as any)?.name || item.product.name,
            quantity: item.quantity,
            price: item.price * item.quantity
          })),
          subtotal: order.subtotal,
          shipping: order.shipping || 0,
          tax: order.tax || 0,
          discount: order.discount || 0,
          total: order.total,
          shippingAddress: {
            firstName: shippingAddr?.firstName || '',
            lastName: shippingAddr?.lastName || '',
            address: shippingAddr?.address || '',
            city: shippingAddr?.city || '',
            country: shippingAddr?.country || '',
            zipCode: shippingAddr?.zipCode || '',
            phone: shippingAddr?.phone || ''
          }
        }).catch(err => console.error('Erreur envoi email confirmation:', err))
      }
      
      // SMS de confirmation (si numéro de téléphone disponible)
      const phone = order.user?.phone || shippingAddr?.phone
      if (phone) {
        sendOrderConfirmationSMS(phone, order.orderNumber, order.total)
          .catch(err => console.error('Erreur envoi SMS confirmation:', err))
      }
      
      // Push notification (si token disponible)
      if (order.user?.pushToken) {
        sendOrderConfirmationPush(
          order.user.pushToken,
          order.orderNumber,
          order.id,
          order.total
        ).catch(err => console.error('Erreur envoi push confirmation:', err))
      }

      // Notification aux admins pour la nouvelle commande
      sendNewOrderNotificationToAdmins({
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Client',
        customerEmail: order.user?.email || '',
        customerPhone: order.user?.phone || shippingAddr?.phone,
        items: order.items.map((item: any) => ({
          name: (item.productSnapshot as any)?.name || item.product?.name || 'Produit',
          quantity: item.quantity,
          price: item.price * item.quantity
        })),
        total: order.total,
        shippingAddress: {
          firstName: shippingAddr?.firstName || '',
          lastName: shippingAddr?.lastName || '',
          address: shippingAddr?.address || '',
          city: shippingAddr?.city || '',
          country: shippingAddr?.country || '',
          zipCode: shippingAddr?.zipCode || '',
          phone: shippingAddr?.phone || ''
        },
        paymentMethod: order.paymentMethod || undefined
      }).catch(err => console.error('Erreur envoi notification admin:', err))
    } catch (notifError) {
      console.error('Erreur notifications:', notifError)
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    )
  }
}


