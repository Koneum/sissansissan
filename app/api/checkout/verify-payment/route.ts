import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/checkout/verify-payment?orderId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID requis" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Commande introuvable" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.paymentStatus,
      orderStatus: order.status,
      total: order.total,
      isPaid: order.paymentStatus === "PAID",
      createdAt: order.createdAt
    })

  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la vérification" },
      { status: 500 }
    )
  }
}
