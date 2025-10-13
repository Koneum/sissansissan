import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Helper function to generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// GET /api/orders - Get all orders (with filters for admin or user)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Filters
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const paymentStatus = searchParams.get("paymentStatus")
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (userId) {
      where.userId = userId
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
              phone: true
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

// POST /api/orders - Create a new order (checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      items, // [{ productId, quantity, variantId? }]
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      customerNotes
    } = body

    // Validate required fields
    if (!userId || !items || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
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
              phone: true
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

