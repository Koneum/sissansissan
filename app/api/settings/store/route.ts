import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Simuler une base de données pour les informations de la boutique
let storeInfo = {
  name: "Sissan Store",
  email: "contact@sissan-sissan.net",
  phone: "+223 XX XX XX XX",
  address: "Bamako, Mali",
  description: "Votre boutique en ligne de confiance",
  // Configuration des emails
  emails: {
    noreply: "noreply@sissan-sissan.net",      // Emails transactionnels (envoi uniquement, pas de réception)
    support: "support@sissan-sissan.net",       // Support client
    contact: "contact@sissan-sissan.net",       // Contact général
    admin: "admin@sissan-sissan.net"            // Notifications admin (peut être modifié)
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: storeInfo
  })
}

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est ADMIN ou SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, message: "Accès non autorisé. Seuls les administrateurs peuvent modifier ces paramètres." },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Si la modification concerne les emails, vérifier que c'est un SUPER_ADMIN ou ADMIN
    if (body.emails) {
      // Seuls ADMIN et SUPER_ADMIN peuvent modifier la configuration des emails
      console.log(`[AUDIT] ${session.user.email} a modifié la configuration des emails`)
    }
    
    // Mettre à jour les informations
    storeInfo = {
      ...storeInfo,
      ...body
    }
    
    return NextResponse.json({
      success: true,
      message: "Informations de la boutique mises à jour",
      data: storeInfo
    })
  } catch (error) {
    console.error("Erreur mise à jour store settings:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}

