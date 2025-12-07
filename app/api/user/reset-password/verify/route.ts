import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcrypt"

// POST /api/user/reset-password/verify - Vérifier le code et changer le mot de passe
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
    const { code, newPassword, confirmPassword } = body

    // Validation des champs
    if (!code || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier le code dans la table Verification
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: user.email,
        value: code
      }
    })

    if (!verification) {
      return NextResponse.json(
        { success: false, error: "Code de vérification incorrect" },
        { status: 400 }
      )
    }

    // Vérifier l'expiration
    if (new Date() > new Date(verification.expiresAt)) {
      await prisma.verification.delete({ where: { id: verification.id } })
      return NextResponse.json(
        { success: false, error: "Le code a expiré. Veuillez en demander un nouveau." },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hash(newPassword, 12)

    // Mettre à jour le mot de passe dans Account (utilisé par better-auth)
    await prisma.account.updateMany({
      where: { 
        userId,
        providerId: "credential"
      },
      data: {
        password: hashedPassword
      }
    })

    // Supprimer le code de vérification utilisé
    await prisma.verification.delete({ where: { id: verification.id } })

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès"
    })
  } catch (error) {
    console.error("Erreur changement mot de passe:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    )
  }
}

