import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkPermission } from "@/lib/check-permission"
import { createProductSchema, validateData } from "@/lib/validations"

// GET /api/products - Get all products with filters and pagination (PUBLIC)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Filters
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const isNew = searchParams.get("isNew") === "true"
    const isFeatured = searchParams.get("isFeatured") === "true"
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const inStock = searchParams.get("inStock") === "true"
    const admin = searchParams.get("admin") === "true"
    
    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    // Build where clause
    const where: any = {}

    // Only filter by isActive if not admin
    if (!admin) {
      where.isActive = true
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { tags: { has: search } }
      ]
    }

    if (isNew) {
      where.isNew = true
    }

    if (isFeatured) {
      where.isFeatured = true
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (inStock) {
      where.stock = { gt: 0 }
    }

    // Fetch products with pagination
    const [products, total, ratings] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          _count: {
            select: { reviews: true }
          }
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.product.count({ where }),
      prisma.review.groupBy({
        by: ['productId'],
        where: { status: 'APPROVED' },
        _avg: { rating: true },
      })
    ])

    // Map productId to average rating
    const ratingMap = new Map<string, number>()
    ratings.forEach(r => {
      ratingMap.set(r.productId, r._avg.rating ?? 0)
    })

    const productsWithRatings = products.map(product => ({
      ...product,
      averageRating: ratingMap.get(product.id) ?? 0,
      reviewCount: product._count.reviews
    }))

    return NextResponse.json({
      success: true,
      data: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product (PROTECTED)
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
    // 2. AUTORISATION (permission products.canCreate)
    // ========================================
    const { authorized, error: permError } = await checkPermission(request, 'products', 'canCreate')
    
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
    const validation = validateData(createProductSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, issues: validation.issues },
        { status: 400 }
      )
    }

    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      discountPrice,
      salePercentage,
      sku,
      stock,
      categoryId,
      images,
      thumbnail,
      isNew,
      isFeatured,
      tags,
      attributes
    } = validation.data!

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product with this slug already exists" },
        { status: 409 }
      )
    }

    // Check if SKU already exists (if provided)
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      })

      if (existingSku) {
        return NextResponse.json(
          { success: false, error: "Product with this SKU already exists" },
          { status: 409 }
        )
      }
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    // Create product (les valeurs sont déjà transformées par Zod)
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDesc,
        price,
        discountPrice,
        salePercentage,
        sku: sku || null,
        stock: stock || 0,
        categoryId,
        images: images || [],
        thumbnail,
        isNew: isNew || false,
        isFeatured: isFeatured || false,
        tags: tags || [],
        attributes: attributes || undefined
      },
      include: {
        category: true,
        variants: true
      }
    })

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    )
  }
}


