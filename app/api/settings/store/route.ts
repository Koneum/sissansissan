import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const defaultStoreInfo = {
  name: "Sissan Store",
  email: "contact@sissan-sissan.net",
  phone: "+223 XX XX XX XX",
  address: "Bamako, Mali",
  description: "Votre boutique en ligne de confiance",
  emails: {
    noreply: "noreply@sissan-sissan.net",
    support: "support@sissan-sissan.net",
    contact: "contact@sissan-sissan.net",
    admin: "admin@sissan-sissan.net"
  }
}

export async function GET() {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: "store" }
  })

  return NextResponse.json({
    success: true,
    data: setting?.value || defaultStoreInfo
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
    
    const current = await prisma.siteSettings.findUnique({
      where: { key: "store" }
    })

    const nextValue = {
      ...defaultStoreInfo,
      ...(current?.value as any),
      ...body,
    }

    await prisma.siteSettings.upsert({
      where: { key: "store" },
      update: { value: nextValue },
      create: { key: "store", value: nextValue },
    })
    
    return NextResponse.json({
      success: true,
      message: "Informations de la boutique mises à jour",
      data: nextValue
    })
  } catch (error) {
    console.error("Erreur mise à jour store settings:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}

