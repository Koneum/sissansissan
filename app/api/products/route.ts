import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/products - Get all products with filters and pagination
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
    
    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
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
    const [products, total] = await Promise.all([
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
      prisma.product.count({ where })
    ])

    // Calculate average rating for each product
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const ratings = await prisma.review.aggregate({
          where: {
            productId: product.id,
            status: "APPROVED"
          },
          _avg: {
            rating: true
          }
        })

        return {
          ...product,
          averageRating: ratings._avg.rating || 0,
          reviewCount: product._count.reviews
        }
      })
    )

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

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    } = body

    // Validate required fields
    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Name, slug, price, and category are required" },
        { status: 400 }
      )
    }

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

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDesc,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        salePercentage: salePercentage ? parseInt(salePercentage) : null,
        sku,
        stock: stock ? parseInt(stock) : 0,
        categoryId,
        images: images || [],
        thumbnail,
        isNew: isNew || false,
        isFeatured: isFeatured || false,
        tags: tags || [],
        attributes
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

