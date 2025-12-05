import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/user/orders - Récupérer les commandes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Récupérer les commandes sauf celles annulées par l'utilisateur
    const orders = await prisma.order.findMany({
      where: {
        userId,
        NOT: {
          status: "CANCELLED"
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error("Erreur récupération commandes:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    )
  }
}
