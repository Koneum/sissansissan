import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/user/profile - Récupérer le profil utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Erreur récupération profil:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone } = body

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Le nom doit contenir au moins 2 caractères" },
        { status: 400 }
      )
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profil mis à jour avec succès"
    })
  } catch (error) {
    console.error("Erreur mise à jour profil:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
}
