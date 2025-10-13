import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/categories/[id] - Get a single category
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        products: {
          take: 10,
          where: { isActive: true },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, slug, description, image, parentId } = body

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    // If slug is being changed, check if new slug is available
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Category with this slug already exists" },
          { status: 409 }
        )
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        description,
        image,
        parentId: parentId === undefined ? existingCategory.parentId : parentId
      },
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        children: true
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    // Check if category has products
    if (category.products.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete category with existing products. Please reassign or delete products first." 
        },
        { status: 409 }
      )
    }

    // Check if category has children
    if (category.children.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete category with subcategories. Please delete or reassign subcategories first." 
        },
        { status: 409 }
      )
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    )
  }
}

