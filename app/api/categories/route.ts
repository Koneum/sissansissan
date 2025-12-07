import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkPermission } from "@/lib/check-permission"
import { createCategorySchema, validateData } from "@/lib/validations"

// GET /api/categories - Get all categories (PUBLIC)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeProducts = searchParams.get("includeProducts") === "true"
    const parentOnly = searchParams.get("parentOnly") === "true"

    const categories = await prisma.category.findMany({
      where: parentOnly ? { parentId: null } : undefined,
      include: {
        children: true,
        products: includeProducts,
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category (PROTECTED)
// Requiert la permission categories.canCreate
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. AUTORISATION (permission categories.canCreate)
    // ========================================
    const { authorized, error: permError } = await checkPermission(request, 'categories', 'canCreate')
    
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: permError || "Permission refusée" },
        { status: 403 }
      )
    }

    // ========================================
    // 3. VALIDATION DES DONNÉES
    // ========================================
    const body = await request.json()
    const validation = validateData(createCategorySchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, issues: validation.issues },
        { status: 400 }
      )
    }

    const { name, slug, description, image, parentId } = validation.data!

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this slug already exists" },
        { status: 409 }
      )
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null
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
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    )
  }
}


