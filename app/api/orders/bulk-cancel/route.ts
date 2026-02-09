import { checkPermission } from "@/lib/check-permission"
import { getSession } from "@/lib/get-session"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null)
    const ids = Array.isArray(body?.ids) ? (body.ids as string[]) : []

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucune commande sélectionnée" },
        { status: 400 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(currentUser.role)
    const hasDeletePermission =
      isAdmin || (await checkPermission(request, "orders", "canDelete")).authorized

    const results = await prisma.$transaction(async (tx) => {
      const out: { id: string; success: boolean; error?: string }[] = []

      for (const id of ids) {
        const order = await tx.order.findUnique({
          where: { id },
          include: { items: true },
        })

        if (!order) {
          out.push({ id, success: false, error: "Order not found" })
          continue
        }

        const isOwner = order.userId === currentUser.id

        if (!hasDeletePermission) {
          if (!isOwner) {
            out.push({ id, success: false, error: "Accès refusé à cette commande" })
            continue
          }

          if (order.status !== "PENDING") {
            out.push({
              id,
              success: false,
              error: "Vous ne pouvez annuler que les commandes en attente",
            })
            continue
          }
        }

        if (order.status === "CANCELLED") {
          out.push({ id, success: true })
          continue
        }

        await tx.order.update({
          where: { id },
          data: {
            status: "CANCELLED",
            paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "FAILED",
          },
        })

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }

        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: { usedCount: { decrement: 1 } },
          })
        }

        out.push({ id, success: true })
      }

      return out
    }, { maxWait: 20000, timeout: 120000 })

    const failed = results.filter((r) => !r.success)

    return NextResponse.json({
      success: failed.length === 0,
      data: results,
      failed,
    })
  } catch (error) {
    console.error("Error bulk cancelling orders:", error)
    return NextResponse.json(
      { success: false, error: "Failed to cancel orders" },
      { status: 500 }
    )
  }
}
