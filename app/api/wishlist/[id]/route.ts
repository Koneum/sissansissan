import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

// DELETE /api/wishlist/[id] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id }
    })

    if (!wishlistItem) {
      return NextResponse.json(
        { success: false, error: "Wishlist item not found" },
        { status: 404 }
      )
    }

    await prisma.wishlistItem.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist"
    })
  } catch (error) {
    console.error("Error removing wishlist item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to remove wishlist item" },
      { status: 500 }
    )
  }
}

