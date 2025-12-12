import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST /api/user/push-token - Enregistrer ou mettre à jour le token push
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pushToken } = body

    if (!pushToken || typeof pushToken !== 'string') {
      return NextResponse.json(
        { success: false, error: "Token push invalide" },
        { status: 400 }
      )
    }

    // Vérifier que c'est bien un token Expo valide
    if (!pushToken.startsWith('ExponentPushToken[') && !pushToken.startsWith('ExpoPushToken[')) {
      return NextResponse.json(
        { success: false, error: "Format de token Expo invalide" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { pushToken }
    })

    return NextResponse.json({
      success: true,
      message: "Token push enregistré"
    })
  } catch (error) {
    console.error("Erreur enregistrement push token:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// DELETE /api/user/push-token - Supprimer le token push (logout, désactivation)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { pushToken: null }
    })

    return NextResponse.json({
      success: true,
      message: "Token push supprimé"
    })
  } catch (error) {
    console.error("Erreur suppression push token:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
