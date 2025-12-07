import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { randomBytes } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Pour des raisons de sécurité, on retourne toujours success même si l'email n'existe pas
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si cet email existe, un lien de réinitialisation a été envoyé",
      })
    }

    // Générer un token de réinitialisation
    const resetToken = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Envoyer l'email avec le lien de réinitialisation via Brevo
    try {
      await sendPasswordResetEmail(email, resetToken)
      console.log(`✅ Email de réinitialisation envoyé à ${email}`)
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError)
      // On ne révèle pas l'erreur d'email pour des raisons de sécurité
      // mais on log le token en dev pour faciliter les tests
      if (process.env.NODE_ENV === "development") {
        console.log(`🔑 Token de dev: ${resetToken}`)
        console.log(`🔗 Lien: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`)
      }
    }

    // En développement, on peut retourner le token pour faciliter les tests
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        success: true,
        message: "Email envoyé avec succès",
        // Retourner le token uniquement en dev pour les tests
        devToken: resetToken,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Si cet email existe, un lien de réinitialisation a été envoyé",
    })
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

