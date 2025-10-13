import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

// PUT /api/cart/[id] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Valid quantity is required" },
        { status: 400 }
      )
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: true
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 }
      )
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedItem
    })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update cart item" },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Cart item not found" },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Item removed from cart"
    })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to remove cart item" },
      { status: 500 }
    )
  }
}

