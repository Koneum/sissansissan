import { getSession } from "@/lib/get-session"
import prisma from "@/lib/prisma"
import { updateProfileSchema, validateData } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

// GET /api/user/profile - Récupérer le profil utilisateur (PROTECTED)
// CORRECTION SÉCURITÉ: Utilise la session au lieu du header x-user-id (falsifiable)
export async function GET(request: NextRequest) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION VIA SESSION (cookies ou Bearer token)
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié", code: "UNAUTHENTICATED" },
        { status: 401 }
      )
    }

    // Utiliser l'ID de la session, pas un header falsifiable
    const userId = session.user.id

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

// PUT /api/user/profile - Mettre à jour le profil utilisateur (PROTECTED)
// CORRECTION SÉCURITÉ: Utilise la session au lieu du header x-user-id (falsifiable)
export async function PUT(request: NextRequest) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION VIA SESSION (cookies ou Bearer token)
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié", code: "UNAUTHENTICATED" },
        { status: 401 }
      )
    }

    // Utiliser l'ID de la session, pas un header falsifiable
    const userId = session.user.id

    // ========================================
    // 2. VALIDATION DES DONNÉES
    // ========================================
    const body = await request.json()
    const validation = validateData(updateProfileSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, issues: validation.issues },
        { status: 400 }
      )
    }

    const { name, phone } = validation.data!

    // ========================================
    // 3. MISE À JOUR DU PROFIL
    // ========================================
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

