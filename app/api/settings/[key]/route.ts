import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ key: string }>
}

// GET /api/settings/[key] - Get settings by key
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { key } = await context.params

    const setting = await prisma.siteSettings.findUnique({
      where: { key }
    })

    if (!setting) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }

    return NextResponse.json({
      success: true,
      data: setting.value
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

// POST /api/settings/[key] - Create or update settings
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { key } = await context.params
    const body = await request.json()

    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: {
        value: body,
        updatedAt: new Date()
      },
      create: {
        key,
        value: body
      }
    })

    return NextResponse.json({
      success: true,
      data: setting.value
    })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
