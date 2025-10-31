import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/cart?userId=xxx - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price
      return sum + (price * item.quantity)
    }, 0)

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        subtotal,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity, variantId } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: "User ID and Product ID are required" },
        { status: 400 }
      )
    }

    // Verify user exists or create if needed (for mock auth)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If user doesn't exist, create a temporary one (for development/mock auth)
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `user_${userId}@temp.com`,
            name: `User ${userId}`,
            password: "temp_password", // This should be hashed in production
            role: "CUSTOMER"
          }
        })
      } catch {
        return NextResponse.json(
          { success: false, error: "Failed to create user session" },
          { status: 500 }
        )
      }
    }

    // Verify product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    if (!product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product is not available" },
        { status: 400 }
      )
    }

    const requestedQuantity = quantity || 1

    if (product.stock < requestedQuantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: variantId || null
        }
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + requestedQuantity

      if (product.stock < newQuantity) {
        return NextResponse.json(
          { success: false, error: "Insufficient stock for requested quantity" },
          { status: 400 }
        )
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: requestedQuantity,
          variantId: variantId || null
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: existingCartItem ? "Cart updated" : "Item added to cart"
    }, { status: existingCartItem ? 200 : 201 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    )
  }
}

// DELETE /api/cart?userId=xxx - Clear user's cart
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    await prisma.cartItem.deleteMany({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully"
    })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    )
  }
}

