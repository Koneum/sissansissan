import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/addresses/[id] - Get a single address
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const address = await prisma.address.findUnique({
      where: { id },
    })

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: address,
    })
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch address" },
      { status: 500 }
    )
  }
}

// PATCH /api/addresses/[id] - Update an address
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { firstName, lastName, address, city, state, country, zipCode, phone, isDefault } = body

    // Check if address exists
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      )
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: existingAddress.userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        firstName: firstName ?? existingAddress.firstName,
        lastName: lastName ?? existingAddress.lastName,
        address: address ?? existingAddress.address,
        city: city ?? existingAddress.city,
        state: state !== undefined ? state : existingAddress.state,
        country: country ?? existingAddress.country,
        zipCode: zipCode ?? existingAddress.zipCode,
        phone: phone ?? existingAddress.phone,
        isDefault: isDefault ?? existingAddress.isDefault,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedAddress,
    })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update address" },
      { status: 500 }
    )
  }
}

// DELETE /api/addresses/[id] - Delete an address
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const existingAddress = await prisma.address.findUnique({
      where: { id },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete address" },
      { status: 500 }
    )
  }
}
