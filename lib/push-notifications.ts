// Service de notifications push Expo
// Documentation: https://docs.expo.dev/push-notifications/sending-notifications/

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface ExpoPushMessage {
  to: string | string[]
  title: string
  body: string
  data?: Record<string, any>
  sound?: 'default' | null
  badge?: number
  priority?: 'default' | 'normal' | 'high'
  channelId?: string
}

interface ExpoPushTicket {
  id?: string
  status: 'ok' | 'error'
  message?: string
  details?: {
    error?: string
  }
}

/**
 * Envoie une notification push via Expo
 */
export async function sendPushNotification(message: ExpoPushMessage): Promise<ExpoPushTicket | null> {
  // Ne pas envoyer si pas de token
  if (!message.to || (Array.isArray(message.to) && message.to.length === 0)) {
    console.log('Pas de token push, notification ignorée')
    return null
  }

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...message,
        sound: message.sound ?? 'default',
        priority: message.priority ?? 'high',
      }),
    })

    const result = await response.json()
    
    if (result.data && result.data[0]) {
      const ticket = result.data[0] as ExpoPushTicket
      if (ticket.status === 'error') {
        console.error('Erreur push notification:', ticket.message, ticket.details)
      } else {
        console.log('🔔 Push notification envoyée')
      }
      return ticket
    }
    
    return null
  } catch (error) {
    console.error('Erreur envoi push notification:', error)
    return null
  }
}

/**
 * Envoie plusieurs notifications push en batch
 */
export async function sendPushNotificationBatch(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  const validMessages = messages.filter(m => m.to && (!Array.isArray(m.to) || m.to.length > 0))
  
  if (validMessages.length === 0) {
    return []
  }

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validMessages.map(m => ({
        ...m,
        sound: m.sound ?? 'default',
        priority: m.priority ?? 'high',
      }))),
    })

    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Erreur envoi batch push notifications:', error)
    return []
  }
}

// ===========================================
// TEMPLATES DE NOTIFICATIONS
// ===========================================

type OrderStatusPush = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

const ORDER_STATUS_MESSAGES: Record<OrderStatusPush, { title: string; body: string; emoji: string }> = {
  PENDING: {
    emoji: '⏳',
    title: 'Commande en attente',
    body: 'Votre commande {orderNumber} est en attente de confirmation.'
  },
  PROCESSING: {
    emoji: '🔄',
    title: 'Commande en préparation',
    body: 'Bonne nouvelle ! Votre commande {orderNumber} est en cours de préparation.'
  },
  SHIPPED: {
    emoji: '🚚',
    title: 'Commande expédiée',
    body: 'Votre commande {orderNumber} est en route vers vous !'
  },
  DELIVERED: {
    emoji: '✅',
    title: 'Commande livrée',
    body: 'Votre commande {orderNumber} a été livrée. Bon shopping !'
  },
  CANCELLED: {
    emoji: '❌',
    title: 'Commande annulée',
    body: 'Votre commande {orderNumber} a été annulée.'
  },
  REFUNDED: {
    emoji: '💰',
    title: 'Remboursement effectué',
    body: 'Votre commande {orderNumber} a été remboursée.'
  }
}

/**
 * Notification push de confirmation de commande
 */
export async function sendOrderConfirmationPush(pushToken: string, orderNumber: string, orderId: string, total: number) {
  return sendPushNotification({
    to: pushToken,
    title: '✅ Commande confirmée !',
    body: `Votre commande ${orderNumber} de ${total.toLocaleString('fr-FR')} FCFA a été reçue.`,
    data: {
      type: 'order_confirmation',
      orderId,
      orderNumber,
      screen: 'OrderDetails'
    }
  })
}

/**
 * Notification push de changement de statut
 */
export async function sendOrderStatusPush(
  pushToken: string, 
  orderNumber: string, 
  orderId: string, 
  status: OrderStatusPush
) {
  const config = ORDER_STATUS_MESSAGES[status]
  const body = config.body.replace('{orderNumber}', orderNumber)
  
  return sendPushNotification({
    to: pushToken,
    title: `${config.emoji} ${config.title}`,
    body,
    data: {
      type: 'order_status',
      orderId,
      orderNumber,
      status,
      screen: 'OrderDetails'
    }
  })
}

/**
 * Notification push de confirmation de paiement
 */
export async function sendPaymentConfirmationPush(pushToken: string, orderNumber: string, orderId: string, amount: number) {
  return sendPushNotification({
    to: pushToken,
    title: '💳 Paiement confirmé',
    body: `Paiement de ${amount.toLocaleString('fr-FR')} FCFA reçu pour la commande ${orderNumber}.`,
    data: {
      type: 'payment_confirmation',
      orderId,
      orderNumber,
      screen: 'OrderDetails'
    }
  })
}

/**
 * Notification push promotionnelle
 */
export async function sendPromoPush(pushToken: string, title: string, message: string, promoCode?: string) {
  return sendPushNotification({
    to: pushToken,
    title: `🎉 ${title}`,
    body: message,
    data: {
      type: 'promo',
      promoCode,
      screen: 'Home'
    }
  })
}

/**
 * Notification push retour en stock
 */
export async function sendBackInStockPush(pushToken: string, productName: string, productId: string) {
  return sendPushNotification({
    to: pushToken,
    title: '📦 Retour en stock',
    body: `${productName} est de nouveau disponible !`,
    data: {
      type: 'back_in_stock',
      productId,
      screen: 'ProductDetails'
    }
  })
}

/**
 * Notification push baisse de prix
 */
export async function sendPriceDropPush(
  pushToken: string, 
  productName: string, 
  productId: string, 
  oldPrice: number, 
  newPrice: number
) {
  const discount = Math.round((1 - newPrice / oldPrice) * 100)
  
  return sendPushNotification({
    to: pushToken,
    title: '💰 Baisse de prix',
    body: `${productName} est maintenant à ${newPrice.toLocaleString('fr-FR')} FCFA (-${discount}%)`,
    data: {
      type: 'price_drop',
      productId,
      oldPrice,
      newPrice,
      screen: 'ProductDetails'
    }
  })
}
