import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token requis" },
        { status: 400 }
      )
    }

    // Vérifier si le token existe et n'est pas expiré
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token non expiré
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { valid: false, error: "Token invalide ou expiré" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      message: "Token valide",
    })
  } catch (error) {
    console.error("Erreur lors de la validation du token:", error)
    return NextResponse.json(
      { valid: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

