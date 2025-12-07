import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/addresses?userId=xxx - Get all addresses for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: addresses,
    })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses" },
      { status: 500 }
    )
  }
}

// POST /api/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, firstName, lastName, address, city, state, country, zipCode, phone, isDefault } = body

    if (!userId || !firstName || !lastName || !address || !city || !country || !zipCode || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        firstName,
        lastName,
        address,
        city,
        state: state || null,
        country,
        zipCode,
        phone,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({
      success: true,
      data: newAddress,
    })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create address" },
      { status: 500 }
    )
  }
}

