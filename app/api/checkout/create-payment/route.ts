import prisma from "@/lib/prisma"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      userId,         // null for guest checkout
      guestInfo,      // { firstName, lastName, email, phone, address, city, district }
      items,          // [{ productId, quantity, price }]
      subtotal,
      shipping,
      total,
      promoCode,
    } = body

    console.log("📥 Checkout request:", { userId, guestInfo, items: items?.length, total })

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Panier vide" },
        { status: 400 }
      )
    }

    // Get email and phone for VitePay
    let email: string
    let phone: string
    let customerName: string

    if (userId) {
      // Authenticated user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phone: true }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: "Utilisateur non trouvé" },
          { status: 404 }
        )
      }

      email = user.email
      phone = user.phone || ""
      customerName = user.name || ""
    } else if (guestInfo) {
      // Guest checkout
      if (!guestInfo.firstName || !guestInfo.lastName) {
        return NextResponse.json(
          { success: false, error: "Informations client manquantes" },
          { status: 400 }
        )
      }

      email = guestInfo.email || `guest_${String(guestInfo.phone || '').replace(/\D/g, '') || Date.now()}@sissan-sissan.net`
      phone = guestInfo.phone || ""
      customerName = `${guestInfo.firstName} ${guestInfo.lastName}`
    } else {
      return NextResponse.json(
        { success: false, error: "Utilisateur ou informations invité requis" },
        { status: 400 }
      )
    }

    // Verify products and calculate totals
    let calculatedSubtotal = 0
    const orderItems: any[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountPrice: true,
          thumbnail: true,
          stock: true,
          isActive: true
        }
      })

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Produit ${item.productId} introuvable` },
          { status: 404 }
        )
      }

      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `Le produit ${product.name} n'est plus disponible` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Stock insuffisant pour ${product.name}` },
          { status: 400 }
        )
      }

      const price = product.discountPrice || product.price
      calculatedSubtotal += price * item.quantity

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPrice: product.discountPrice
        }
      })
    }

    // Apply promo code discount if provided
    let discount = 0
    let couponId = null

    if (promoCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: promoCode }
      })

      if (coupon && coupon.status === "ACTIVE") {
        const now = new Date()
        const isValid =
          (!coupon.validFrom || coupon.validFrom <= now) &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          (!coupon.minPurchase || calculatedSubtotal >= coupon.minPurchase)

        if (isValid) {
          couponId = coupon.id
          if (coupon.discountType === "PERCENTAGE") {
            discount = (calculatedSubtotal * coupon.discountValue) / 100
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount
            }
          } else if (coupon.discountType === "FIXED") {
            discount = coupon.discountValue
          }
        }
      }
    }

    // Calculate final total
    const finalSubtotal = calculatedSubtotal
    const finalShipping = shipping || (finalSubtotal > 50 ? 0 : 5.99)
    const finalTotal = finalSubtotal - discount + finalShipping

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Build shipping address
    const shippingAddress = guestInfo ? {
      firstName: guestInfo.firstName,
      lastName: guestInfo.lastName,
      email,
      phone: guestInfo.phone,
      address: guestInfo.address,
      city: guestInfo.city,
      district: guestInfo.district,
      country: "Mali"
    } : {}

    // For guest checkout, we need to either:
    // 1. Create a guest user account, or
    // 2. Have userId as optional in schema
    // For now, we'll create a guest user if userId is not provided

    let finalUserId = userId

    if (!userId && guestInfo) {
      // Check if guest user already exists with this email
      let guestUser = await prisma.user.findUnique({
        where: { email }
      })

      if (!guestUser) {
        // Create a guest user account
        guestUser = await prisma.user.create({
          data: {
            name: customerName,
            email,
            phone: guestInfo.phone || null,
            role: "CUSTOMER",
            emailVerified: false,
          }
        })
        console.log("✅ Guest user created:", guestUser.id)
      }

      finalUserId = guestUser.id
    }

    if (!finalUserId) {
      return NextResponse.json(
        { success: false, error: "Utilisateur requis pour créer une commande" },
        { status: 400 }
      )
    }

    // Create order in database
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: finalUserId,
          items: {
            create: orderItems
          },
          subtotal: finalSubtotal,
          shipping: finalShipping,
          discount,
          total: finalTotal,
          couponCode: promoCode || undefined,
          couponId: couponId || undefined,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: "ORANGE_MONEY",
          shippingAddress,
          billingAddress: shippingAddress,
          customerNotes: guestInfo ? `Commande invité: ${customerName}` : undefined,
        },
        include: {
          items: true
        }
      })

      // Update product stock
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      // Update coupon usage if used
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: { increment: 1 }
          }
        })
      }

      return newOrder
    })

    console.log("✅ Order created:", order.id, order.orderNumber)

    // Now initiate VitePay payment
    const apiKey = process.env.VITEPAY_API_KEY
    const apiSecret = process.env.VITEPAY_API_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    if (!apiKey || !apiSecret) {
      console.error("❌ VitePay configuration missing")
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentUrl: null,
        error: "Configuration paiement manquante - Veuillez contacter le support"
      })
    }

    // Amount in centimes
    const amount100 = Math.round(finalTotal * 100)

    // Clean base URL
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

    // Callback URLs
    const callbackUrl = `${cleanBaseUrl}/api/payments/callback`
    const returnUrl = `${cleanBaseUrl}/payment/success?orderId=${order.id}`
    const declineUrl = `${cleanBaseUrl}/payment/decline?orderId=${order.id}`
    const cancelUrl = `${cleanBaseUrl}/payment/cancel?orderId=${order.id}`

    // Generate SHA1 hash
    const hashString = `${order.id.toString().toUpperCase()};${amount100};XOF;${callbackUrl};${apiSecret}`
    const hash = crypto
      .createHash("sha1")
      .update(hashString.toUpperCase())
      .digest("hex")
      .toLowerCase()

    // Prepare VitePay form data
    const formData = new URLSearchParams({
      "payment[language_code]": "fr",
      "payment[currency_code]": "XOF",
      "payment[country_code]": "ML",
      "payment[order_id]": order.id,
      "payment[description]": `Commande ${order.orderNumber} - ${customerName}`,
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

    console.log("📤 Calling VitePay API...")

    // Call VitePay API
    const vitepayApiUrl = process.env.VITEPAY_API_URL || "https://api.vitepay.com/v1/prod"
    const vitepayResponse = await fetch(`${vitepayApiUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    const responseText = await vitepayResponse.text()

    console.log("VitePay response:", {
      status: vitepayResponse.status,
      body: responseText.substring(0, 200)
    })

    // VitePay returns the checkout URL directly
    if (vitepayResponse.ok && responseText.includes("checkout")) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentUrl: responseText.trim(),
        total: finalTotal
      })
    }

    // VitePay error - order is created but payment failed
    console.error("VitePay error:", responseText)
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: null,
      error: "Erreur lors de l'initialisation du paiement. Veuillez réessayer."
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur lors de la création de la commande"
      },
      { status: 500 }
    )
  }
}

