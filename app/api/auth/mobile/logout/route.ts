import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Custom mobile logout endpoint
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (token) {
      // Delete the session
      await prisma.session.deleteMany({
        where: { token }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Mobile logout error:", error)
    // Still return success - logout should always succeed from client perspective
    return NextResponse.json({ success: true })
  }
}
