import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { scrypt, randomBytes } from "crypto"
import { promisify } from "util"

const scryptAsync = promisify(scrypt)

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Vérifier si le token existe et n'est pas expiré
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const salt = randomBytes(16).toString("hex")
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
    const hashedPassword = `${salt}:${derivedKey.toString("hex")}`

    // Mettre à jour le mot de passe et supprimer le token
    // Better Auth utilise la table Account pour stocker les mots de passe
    await prisma.account.updateMany({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      data: {
        password: hashedPassword,
      },
    })

    // Supprimer le token de réinitialisation
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

