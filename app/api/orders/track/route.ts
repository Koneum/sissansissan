import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderNumber = String(body?.orderNumber || "").trim()
    const phone = String(body?.phone || body?.contact || "").trim()

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { success: false, error: "Informations manquantes" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
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
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Commande introuvable" },
        { status: 404 }
      )
    }

    const shippingAddr: any = order.shippingAddress as any
    const shippingPhone = String(shippingAddr?.phone || "").trim()

    const normalizePhone = (v: string) => v.replace(/\D/g, "")
    const matches = normalizePhone(phone) !== "" && normalizePhone(phone) === normalizePhone(shippingPhone)

    if (!matches) {
      return NextResponse.json(
        { success: false, error: "Informations de suivi invalides" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Erreur suivi commande:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors du suivi de la commande" },
      { status: 500 }
    )
  }
}
