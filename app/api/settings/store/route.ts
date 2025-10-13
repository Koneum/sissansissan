import { NextResponse } from "next/server"

// Simuler une base de données pour les informations de la boutique
let storeInfo = {
  name: "Sissan Store",
  email: "contact@sissan.com",
  phone: "+223 XX XX XX XX",
  address: "Bamako, Mali",
  description: "Votre boutique en ligne de confiance"
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: storeInfo
  })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
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
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}
