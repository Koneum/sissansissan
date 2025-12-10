import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer,
      billingAddress,
      items,
      subtotal,
      shippingCost,
      total,
      shippingMethod,
      paymentMethod,
      userId,
    } = body

    console.log("Données reçues:", { customer, billingAddress, items, userId })

    // Vérifier ou créer un utilisateur guest
    let finalUserId = userId
    
    // Email est optionnel - utiliser le téléphone pour identifier le client si pas d'email
    const customerEmail = customer.email || `guest_${customer.phone?.replace(/\D/g, '') || Date.now()}@sissan-sissan.net`
    
    if (!userId) {
      // Chercher par email OU par téléphone
      let guestUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: customerEmail },
            ...(customer.phone ? [{ phone: customer.phone }] : [])
          ]
        }
      })
      
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: customerEmail,
            name: `${customer.firstName} ${customer.lastName || ""}`.trim(),
            phone: customer.phone || null,
            role: "CUSTOMER",
          }
        })
      }
      
      finalUserId = guestUser.id
    }

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    console.log("Création commande avec userId:", finalUserId)

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: finalUserId,
        shippingAddress: {
          name: `${customer.firstName} ${customer.lastName || ""}`.trim(),
          email: customerEmail,
          phone: customer.phone,
          address: billingAddress.address,
          city: billingAddress.city,
          zipCode: billingAddress.zipCode || "",
          country: billingAddress.country || "ML",
        },
        billingAddress: {
          name: `${customer.firstName} ${customer.lastName || ""}`.trim(),
          email: customerEmail,
          phone: customer.phone,
          address: billingAddress.address,
          city: billingAddress.city,
          zipCode: billingAddress.zipCode || "",
          country: billingAddress.country || "ML",
        },
        subtotal,
        shipping: shippingCost,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: paymentMethod.toUpperCase(),
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            productSnapshot: {
              name: item.name,
              price: item.price,
              total: item.price * item.quantity,
            },
          })),
        },
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
    })
  } catch (error) {
    console.error("Erreur création commande:", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de la commande",
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

