import { NextResponse } from "next/server"

// Simuler une base de données pour les paramètres de livraison
let shippingSettings = {
  freeShippingEnabled: true,
  freeShippingThreshold: 80,
  standardShippingCost: 10,
  expressShippingCost: 20,
  shippingMethods: [
    { id: "free", name: "Livraison gratuite", cost: 0, enabled: true },
    { id: "standard", name: "Livraison standard", cost: 10, enabled: true },
    { id: "express", name: "Livraison express", cost: 20, enabled: true },
  ]
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: shippingSettings
  })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    // Mettre à jour les paramètres
    shippingSettings = {
      ...shippingSettings,
      ...body
    }
    
    return NextResponse.json({
      success: true,
      message: "Paramètres de livraison mis à jour",
      data: shippingSettings
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}
