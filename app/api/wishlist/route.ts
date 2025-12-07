import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/wishlist?userId=xxx - Get user's wishlist
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

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            _count: {
              select: { reviews: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Calculate average rating for each product
    const itemsWithRatings = await Promise.all(
      wishlistItems.map(async (item) => {
        const ratings = await prisma.review.aggregate({
          where: {
            productId: item.product.id,
            status: "APPROVED"
          },
          _avg: {
            rating: true
          }
        })

        return {
          ...item,
          product: {
            ...item.product,
            averageRating: ratings._avg.rating || 0
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: itemsWithRatings,
      count: itemsWithRatings.length
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

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

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: "Product already in wishlist" },
        { status: 409 }
      )
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      },
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
      data: wishlistItem,
      message: "Product added to wishlist"
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist?userId=xxx - Clear wishlist
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

    await prisma.wishlistItem.deleteMany({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      message: "Wishlist cleared successfully"
    })
  } catch (error) {
    console.error("Error clearing wishlist:", error)
    return NextResponse.json(
      { success: false, error: "Failed to clear wishlist" },
      { status: 500 }
    )
  }
}


