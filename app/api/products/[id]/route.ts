import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // Calculate average rating
    const ratings = await prisma.review.aggregate({
      where: {
        productId: product.id,
        status: "APPROVED"
      },
      _avg: {
        rating: true
      }
    })

    const productWithRating = {
      ...product,
      averageRating: ratings._avg.rating || 0
    }

    return NextResponse.json({
      success: true,
      data: productWithRating
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // If slug is being changed, check if new slug is available
    if (body.slug && body.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: body.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Product with this slug already exists" },
          { status: 409 }
        )
      }
    }

    // If SKU is being changed, check if new SKU is available
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: body.sku }
      })

      if (skuExists) {
        return NextResponse.json(
          { success: false, error: "Product with this SKU already exists" },
          { status: 409 }
        )
      }
    }

    // If category is being changed, verify it exists
    if (body.categoryId && body.categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (body.name) updateData.name = body.name
    if (body.slug) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.shortDesc !== undefined) updateData.shortDesc = body.shortDesc
    if (body.price) updateData.price = parseFloat(body.price)
    if (body.discountPrice !== undefined) updateData.discountPrice = body.discountPrice ? parseFloat(body.discountPrice) : null
    if (body.salePercentage !== undefined) updateData.salePercentage = body.salePercentage ? parseInt(body.salePercentage) : null
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock)
    if (body.categoryId) updateData.categoryId = body.categoryId
    if (body.images !== undefined) updateData.images = body.images
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail
    if (body.isNew !== undefined) updateData.isNew = body.isNew
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.attributes !== undefined) updateData.attributes = body.attributes

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        variants: true,
        _count: {
          select: { reviews: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if product has been ordered
    if (product.orderItems.length > 0) {
      // Instead of deleting, mark as inactive
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: "Product has been ordered before and was marked as inactive instead of deleted"
      })
    }

    // Delete product (cascade will handle variants, reviews, etc.)
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    )
  }
}

