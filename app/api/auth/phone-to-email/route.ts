import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const normalizePhone = (v: string) => String(v || "").replace(/\D/g, "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const phone = normalizePhone(body?.phone)

    if (!phone) {
      return NextResponse.json({ success: false, error: "Téléphone requis" }, { status: 400 })
    }

    // On ne peut pas normaliser côté DB facilement sans fonctions SQL,
    // donc on fait un scan limité: on filtre grossièrement par les derniers chiffres,
    // puis on normalise côté JS.
    const lastDigits = phone.slice(-6)
    const candidates = await prisma.user.findMany({
      where: {
        phone: {
          contains: lastDigits,
          mode: "insensitive",
        },
      },
      select: { email: true, phone: true },
      take: 50,
    })

    const found = candidates.find((c) => normalizePhone(c.phone || "") === phone)

    if (!found) {
      return NextResponse.json({ success: false, error: "Compte introuvable" }, { status: 404 })
    }

    return NextResponse.json({ success: true, email: found.email })
  } catch (error) {
    console.error("phone-to-email error:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
