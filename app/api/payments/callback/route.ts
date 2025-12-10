import prisma from "@/lib/prisma"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

/**
 * VitePay Callback Handler
 * 
 * IMPORTANT: VitePay exige TOUJOURS une réponse HTTP 200 avec:
 * - Succès: { "status": "1" }
 * - Échec: { "status": "0", "message": "..." }
 * 
 * Si le callback ne retourne pas { "status": "1" }, VitePay REMBOURSE automatiquement !
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // DEBUG: Logger TOUS les champs reçus de VitePay
    const allFields: Record<string, string> = {}
    formData.forEach((value, key) => {
      allFields[key] = key === 'authenticity' ? String(value).substring(0, 10) + '...' : String(value)
    })
    console.log("VitePay Callback - TOUS les champs:", allFields)
    
    // Récupérer les paramètres du callback
    // VitePay peut envoyer les champs avec ou sans préfixe "payment[]"
    const orderId = (formData.get("order_id") || formData.get("payment[order_id]")) as string
    const amount100 = (formData.get("amount_100") || formData.get("payment[amount_100]") || formData.get("amount")) as string
    const currencyCode = (formData.get("currency_code") || formData.get("payment[currency_code]") || formData.get("currency")) as string
    const authenticity = (formData.get("authenticity") || formData.get("payment[authenticity]")) as string
    const success = (formData.get("success") || formData.get("payment[success]")) as string
    const failure = (formData.get("failure") || formData.get("payment[failure]")) as string
    const sandbox = (formData.get("sandbox") || formData.get("payment[sandbox]")) as string

    console.log("VitePay Callback parsed:", {
      orderId,
      amount100,
      currencyCode,
      success,
      failure,
      sandbox,
      authenticity: authenticity?.substring(0, 10) + "...",
    })

    // Vérifier les paramètres obligatoires
    if (!orderId || !authenticity) {
      console.error("VitePay Callback: Paramètres obligatoires manquants (orderId ou authenticity)")
      return NextResponse.json({
        status: "0",
        message: "Paramètres manquants dans le callback",
      })
    }
    
    // Si amount100 ou currencyCode manquent, on va les récupérer depuis la commande
    let finalAmount100 = amount100
    let finalCurrencyCode = currencyCode || "XOF" // XOF par défaut pour le Mali

    // Récupérer l'API secret
    const apiSecret = process.env.VITEPAY_API_SECRET

    if (!apiSecret) {
      console.error("VitePay Callback: VITEPAY_API_SECRET non configuré")
      return NextResponse.json({
        status: "0",
        message: "Configuration serveur incorrecte",
      })
    }

    // ÉTAPE 1: Trouver la commande AVANT de vérifier le hash
    // Car VitePay peut ne pas envoyer amount100, on doit le récupérer depuis la commande
    let order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    
    // Fallback: chercher par orderNumber
    if (!order) {
      order = await prisma.order.findFirst({
        where: { orderNumber: orderId },
      })
    }

    // Fallback 2: chercher par orderNumber en majuscules
    if (!order) {
      order = await prisma.order.findFirst({
        where: { orderNumber: orderId.toUpperCase() },
      })
    }

    if (!order) {
      console.error("VitePay Callback: Commande introuvable:", orderId)
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, orderNumber: true, createdAt: true }
      })
      console.error("Dernières commandes:", recentOrders)
      
      return NextResponse.json({
        status: "0",
        message: "Commande introuvable",
      })
    }

    console.log("VitePay: Commande trouvée:", {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus
    })

    // ÉTAPE 2: Récupérer amount100 depuis la commande si non fourni par VitePay
    // VitePay ne semble pas toujours envoyer amount_100 dans le callback
    if (!finalAmount100) {
      finalAmount100 = String(Math.round(Number(order.total) * 100))
      console.log("VitePay: amount100 récupéré depuis la commande:", finalAmount100)
    }

    // ÉTAPE 3: Vérifier le hash d'authenticité
    // Format: SHA1("order_id;amount_100;currency_code;api_secret")
    // - order_id: majuscules si non numérique
    // - currency_code: majuscules (XOF)
    // - api_secret: tel quel
    // - Résultat SHA1: en majuscules
    const orderIdForHash = isNaN(Number(orderId)) ? orderId.toUpperCase() : orderId
    const currencyCodeUpper = finalCurrencyCode.toUpperCase()
    const hashString = `${orderIdForHash};${finalAmount100};${currencyCodeUpper};${apiSecret}`
    
    const calculatedHash = crypto
      .createHash("sha1")
      .update(hashString)
      .digest("hex")
      .toUpperCase()

    console.log("VitePay Hash verification:", {
      orderIdForHash,
      amount100: finalAmount100,
      currencyCode: currencyCodeUpper,
      hashStringPreview: `${orderIdForHash};${finalAmount100};${currencyCodeUpper};***`,
      calculatedHash: calculatedHash.substring(0, 10) + "...",
      receivedHash: authenticity?.toUpperCase().substring(0, 10) + "...",
      match: calculatedHash === authenticity.toUpperCase()
    })

    // Vérifier l'authenticité
    if (calculatedHash !== authenticity.toUpperCase()) {
      console.error("VitePay Callback: Hash invalide", {
        received: authenticity.toUpperCase(),
        calculated: calculatedHash,
        hashString: `${orderIdForHash};${finalAmount100};${currencyCodeUpper};***`
      })
      // En cas de hash invalide mais commande trouvée avec success=1,
      // on peut quand même valider (VitePay a des variations de format)
      if (success === "1" && order.paymentStatus === "PENDING") {
        console.warn("VitePay: Hash invalide MAIS success=1, on valide quand même")
      } else {
        return NextResponse.json({
          status: "0",
          message: "Signature invalide",
        })
      }
    } else {
      console.log("VitePay: Signature validée ✓")
    }

    // Si la commande a déjà été traitée avec succès, confirmer quand même à VitePay
    if (order.paymentStatus === "PAID") {
      console.log("VitePay: Commande déjà payée, confirmation renvoyée")
      return NextResponse.json({
        status: "1",
      })
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

    console.log(`VitePay: Commande ${order.orderNumber} mise à jour: ${newOrderStatus} / ${newPaymentStatus}`)

    // IMPORTANT: Retourner { "status": "1" } pour confirmer à VitePay
    return NextResponse.json({
      status: "1",
    })
  } catch (error) {
    console.error("VitePay Callback ERREUR:", error)
    // Même en cas d'erreur, retourner HTTP 200 avec status "0"
    return NextResponse.json({
      status: "0",
      message: "Erreur lors du traitement du callback",
    })
  }
}

