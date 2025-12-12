import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { 
  sendOrderConfirmationEmail, 
  sendNewOrderNotificationToAdmins 
} from "@/lib/email"
import { sendOrderConfirmationSMS } from "@/lib/sms"

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

    // ========================================
    // ENVOI DES NOTIFICATIONS
    // ========================================
    try {
      // 1. Email de confirmation au client (si email fourni)
      if (customer.email) {
        sendOrderConfirmationEmail({
          email: customer.email,
          customerName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
          orderNumber: order.orderNumber,
          items: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price * item.quantity
          })),
          subtotal,
          shipping: shippingCost,
          tax: 0,
          discount: 0,
          total,
          shippingAddress: {
            firstName: customer.firstName,
            lastName: customer.lastName || '',
            address: billingAddress.address,
            city: billingAddress.city,
            country: billingAddress.country || 'ML',
            zipCode: billingAddress.zipCode || '',
            phone: customer.phone || ''
          }
        }).catch(err => console.error('Erreur envoi email confirmation:', err))
      }

      // 2. SMS de confirmation au client (si téléphone fourni)
      if (customer.phone) {
        sendOrderConfirmationSMS(customer.phone, order.orderNumber, total)
          .catch(err => console.error('Erreur envoi SMS confirmation:', err))
      }

      // 3. Notification aux admins/managers
      sendNewOrderNotificationToAdmins({
        orderNumber: order.orderNumber,
        customerName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
        customerEmail: customerEmail,
        customerPhone: customer.phone,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity
        })),
        total,
        shippingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName || '',
          address: billingAddress.address,
          city: billingAddress.city,
          country: billingAddress.country || 'ML',
          zipCode: billingAddress.zipCode || '',
          phone: customer.phone || ''
        },
        paymentMethod: paymentMethod.toUpperCase()
      }).catch(err => console.error('Erreur envoi notification admin:', err))

    } catch (notifError) {
      console.error('Erreur notifications:', notifError)
      // Ne pas bloquer la commande si les notifications échouent
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
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

