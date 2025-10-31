import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      amount,
      description,
      email,
      phoneNumber,
    } = body

    // Validation des paramètres
    if (!orderId || !amount || !email) {
      return NextResponse.json(
        { error: "Paramètres manquants: orderId, amount, email requis" },
        { status: 400 }
      )
    }

    // Configuration VitePay
    const apiKey = process.env.VITEPAY_API_KEY
    const apiSecret = process.env.VITEPAY_API_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Configuration VitePay manquante" },
        { status: 500 }
      )
    }

    // Montant en centimes (multiplier par 100)
    const amount100 = Math.round(amount * 100)

    // URLs de callback
    const callbackUrl = `${baseUrl}/api/payments/callback`
    const returnUrl = `${baseUrl}/payment/success`
    const declineUrl = `${baseUrl}/payment/decline`
    const cancelUrl = `${baseUrl}/payment/cancel`

    // Générer le hash SHA1
    // Format: SHA1(UPPERCASE("order_id;amount_100;currency_code;callback_url;api_secret"))
    const hashString = `${orderId.toString().toUpperCase()};${amount100};XOF;${callbackUrl};${apiSecret}`
    const hash = crypto
      .createHash("sha1")
      .update(hashString.toUpperCase())
      .digest("hex")
      .toUpperCase()

    // Préparer les données pour VitePay
    const formData = new URLSearchParams({
      "payment[language_code]": "fr",
      "payment[currency_code]": "XOF",
      "payment[country_code]": "ML",
      "payment[order_id]": orderId.toString(),
      "payment[description]": description || `Commande #${orderId}`,
      "payment[amount_100]": amount100.toString(),
      "payment[buyer_ip_adress]": request.headers.get("x-forwarded-for") || "127.0.0.1",
      "payment[return_url]": returnUrl,
      "payment[decline_url]": declineUrl,
      "payment[cancel_url]": cancelUrl,
      "payment[callback_url]": callbackUrl,
      "payment[email]": email,
      "payment[p_type]": "orange_money",
      api_key: apiKey,
      hash: hash,
    })

    console.log("Données envoyées à VitePay:", {
      orderId,
      amount100,
      email,
      phoneNumber,
      hash,
      hashString,
    })

    // Appel à l'API VitePay
    const vitepayResponse = await fetch("https://api.vitepay.com/v1/prod/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    const responseText = await vitepayResponse.text()
    
    console.log("Réponse VitePay:", {
      status: vitepayResponse.status,
      statusText: vitepayResponse.statusText,
      response: responseText,
    })
    
    // VitePay retourne directement l'URL de redirection en texte
    if (vitepayResponse.ok && responseText.includes("checkout")) {
      return NextResponse.json({
        success: true,
        redirectUrl: responseText.trim(),
      })
    }

    // En cas d'erreur
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'initialisation du paiement",
        details: responseText,
      },
      { status: 400 }
    )
  } catch (error) {
    console.error("Erreur initiation paiement VitePay:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de l'initialisation du paiement",
      },
      { status: 500 }
    )
  }
}
