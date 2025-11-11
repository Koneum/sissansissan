import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const promoBanners = await prisma.promoBanner.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: promoBanners,
    })
  } catch (error) {
    console.error("Error fetching promo banners:", error)
    return NextResponse.json(
      { error: "Failed to fetch promo banners" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const promoBanner = await prisma.promoBanner.create({
      data: body,
    })

    return NextResponse.json({
      success: true,
      data: promoBanner,
    })
  } catch (error) {
    console.error("Error creating promo banner:", error)
    return NextResponse.json(
      { error: "Failed to create promo banner" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    const promoBanner = await prisma.promoBanner.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      success: true,
      data: promoBanner,
    })
  } catch (error) {
    console.error("Error updating promo banner:", error)
    return NextResponse.json(
      { error: "Failed to update promo banner" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      )
    }

    await prisma.promoBanner.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Promo banner deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting promo banner:", error)
    return NextResponse.json(
      { error: "Failed to delete promo banner" },
      { status: 500 }
    )
  }
}
