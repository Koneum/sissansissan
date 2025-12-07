import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkPermission } from "@/lib/check-permission"

// GET /api/customers - Get all customers (PROTECTED - Admin/Staff only)
// Requiert la permission customers.canView
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
    // 2. AUTORISATION (permission customers.canView)
    // ========================================
    const { authorized, error: permError } = await checkPermission(request, 'customers', 'canView')
    
    if (!authorized) {
      return NextResponse.json(
        { error: permError || "Permission refusée" },
        { status: 403 }
      )
    }

    // ========================================
    // 3. RÉCUPÉRER LES CLIENTS
    // ========================================
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role")
    
    const customers = await prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}


