import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { compare, hash } from "bcrypt"

// POST /api/admin/profile/change-password - Changer le mot de passe d'un admin
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
    const { currentPassword, newPassword, confirmPassword } = body

    // Validation des champs
    if (!currentPassword || !newPassword || !confirmPassword) {
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

    // Récupérer l'utilisateur avec son rôle
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est un admin
    const adminRoles = ["PERSONNEL", "MANAGER", "ADMIN", "SUPER_ADMIN"]
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer le compte avec le mot de passe actuel
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "credential"
      },
      select: {
        id: true,
        password: true,
      }
    })

    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, error: "Compte non trouvé ou authentification sociale uniquement" },
        { status: 400 }
      )
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await compare(currentPassword, account.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Mot de passe actuel incorrect" },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hash(newPassword, 12)

    // Mettre à jour le mot de passe
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword }
    })

    console.log(`🔐 Mot de passe modifié pour l'admin ${user.email}`)

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès"
    })
  } catch (error) {
    console.error("Erreur changement mot de passe admin:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    )
  }
}

