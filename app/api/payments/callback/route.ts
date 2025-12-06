import prisma from "@/lib/prisma"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Récupérer les paramètres du callback
    const orderId = formData.get("order_id") as string
    const amount100 = formData.get("amount_100") as string
    const currencyCode = formData.get("currency_code") as string
    const authenticity = formData.get("authenticity") as string
    const success = formData.get("success") as string
    const failure = formData.get("failure") as string
    const sandbox = formData.get("sandbox") as string

    console.log("VitePay Callback reçu:", {
      orderId,
      amount100,
      currencyCode,
      success,
      failure,
      sandbox,
    })

    // Vérifier que tous les paramètres sont présents
    if (!orderId || !amount100 || !currencyCode || !authenticity) {
      return NextResponse.json(
        {
          status: "0",
          message: "Paramètres manquants dans le callback",
        },
        { status: 400 }
      )
    }

    // Récupérer l'API secret
    const apiSecret = process.env.VITEPAY_API_SECRET

    if (!apiSecret) {
      return NextResponse.json(
        {
          status: "0",
          message: "Configuration serveur incorrecte",
        },
        { status: 500 }
      )
    }

    // Recalculer le hash pour vérifier l'authenticité
    // Format: SHA1("order_id;amount_100;currency_code;api_secret")
    // order_id doit être en majuscules si non numérique
    const orderIdUpper = isNaN(Number(orderId)) ? orderId.toUpperCase() : orderId
    const hashString = `${orderIdUpper};${amount100};${currencyCode.toUpperCase()};${apiSecret}`
    const calculatedHash = crypto
      .createHash("sha1")
      .update(hashString)
      .digest("hex")
      .toUpperCase()

    // Vérifier l'authenticité
    if (calculatedHash !== authenticity.toUpperCase()) {
      console.error("Hash invalide:", {
        received: authenticity,
        calculated: calculatedHash,
        hashString,
      })
      return NextResponse.json(
        {
          status: "0",
          message: "Signature invalide",
        },
        { status: 403 }
      )
    }

    // Vérifier que la commande existe
    // L'orderId de VitePay correspond au orderNumber (ex: ORD-12345678-ABCD)
    const order = await prisma.order.findFirst({
      where: { orderNumber: orderId },
    })

    if (!order) {
      return NextResponse.json(
        {
          status: "0",
          message: "Commande introuvable",
        },
        { status: 404 }
      )
    }

    // Vérifier que la commande n'a pas déjà été traitée
    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          status: "0",
          message: "Commande déjà traitée",
        },
        { status: 400 }
      )
    }

    // Mettre à jour le statut de la commande selon le résultat
    const isSuccess = success === "1"
    const newOrderStatus = isSuccess ? "PROCESSING" : "CANCELLED"
    const newPaymentStatus = isSuccess ? "PAID" : "FAILED"

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newOrderStatus,
        paymentStatus: newPaymentStatus,
        paymentMethod: "ORANGE_MONEY",
      },
    })

    console.log(`Commande ${orderId} (${order.id}) mise à jour: ${newOrderStatus} / ${newPaymentStatus}`)

    // Retourner une confirmation à VitePay
    return NextResponse.json({
      status: "1",
    })
  } catch (error) {
    console.error("Erreur callback VitePay:", error)
    return NextResponse.json(
      {
        status: "0",
        message: "Erreur lors du traitement du callback",
      },
      { status: 500 }
    )
  }
}
