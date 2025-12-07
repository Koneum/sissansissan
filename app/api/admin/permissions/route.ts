import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/admin/permissions - List all permissions (PROTECTED)
// Accessible uniquement aux admins et staff
export async function GET(request: NextRequest) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION
    // ========================================
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // ========================================
    // 2. AUTORISATION (Admin/Staff uniquement)
    // ========================================
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser || !['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Accès réservé au personnel" },
        { status: 403 }
      )
    }

    // ========================================
    // 3. RÉCUPÉRER LES PERMISSIONS
    // ========================================
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    )
  }
}

