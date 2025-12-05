import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificationCodeEmail } from "@/lib/email"

// POST /api/user/reset-password/send-code - Envoyer un code de vérification par email
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'email existe et correspond à l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "L'email ne correspond pas à votre compte" },
        { status: 400 }
      )
    }

    // Générer un code de vérification à 6 chiffres
    const verificationCode = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Sauvegarder le code dans la table Verification
    const verificationId = `pwd_reset_${userId}_${Date.now()}`
    
    // Supprimer les anciens codes de vérification pour cet utilisateur
    await prisma.verification.deleteMany({
      where: {
        identifier: user.email
      }
    })

    // Créer le nouveau code de vérification
    await prisma.verification.create({
      data: {
        id: verificationId,
        identifier: user.email,
        value: verificationCode,
        expiresAt
      }
    })

    // Envoyer l'email avec le code de vérification
    try {
      await sendVerificationCodeEmail(user.email, verificationCode)
      console.log(`📧 Code de vérification envoyé à ${user.email}`)
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError)
      // En développement, on continue même si l'email échoue
      if (process.env.NODE_ENV !== "development") {
        throw emailError
      }
    }

    return NextResponse.json({
      success: true,
      message: "Code de vérification envoyé par email",
      // En mode développement, on renvoie le code pour test
      ...(process.env.NODE_ENV === "development" && { code: verificationCode })
    })
  } catch (error) {
    console.error("Erreur envoi code:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi du code" },
      { status: 500 }
    )
  }
}
