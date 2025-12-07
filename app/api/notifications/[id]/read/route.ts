import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { success: false, error: "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}
