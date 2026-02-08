import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const normalizePhone = (v: string) => String(v || "").replace(/\D/g, "")

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const phone = normalizePhone(body?.phone)

    if (!phone) {
      return NextResponse.json({ success: false, error: "Téléphone requis" }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: session.user.id },
      },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: "Ce téléphone est déjà utilisé" }, { status: 409 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("update phone error:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
