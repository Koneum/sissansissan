// Service SMS Brevo
// Documentation: https://developers.brevo.com/docs/transactional-sms-endpoints
// API Endpoint: https://api.brevo.com/v3/transactionalSMS/send

const SENDER_NAME = "Sissan" // Max 11 caractères alphanumériques
const STORE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sissan-sissan.net"

interface SendSMSParams {
  recipient: string // Format international: 22501234567 (sans +)
  content: string
  type?: 'transactional' | 'marketing'
  tag?: string
}

interface SMSResponse {
  messageId: number
  smsCount: number
  usedCredits: number
  remainingCredits: number
}

/**
 * Formate un numéro de téléphone au format international
 * Supporte les formats: +223 70 12 34 56, 00223 70123456, 70 12 34 56, 70123456
 * Code pays par défaut: Mali (223)
 */
export function formatPhoneNumber(phone: string, defaultCountryCode = '223'): string {
  // Supprime tous les caractères non numériques sauf le +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // Si commence par +, on enlève le +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }
  
  // Si commence par 00, on enlève les 00
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2)
  }
  
  // Détection automatique du code pays
  // Si commence déjà par 223 (Mali), 225 (Côte d'Ivoire), etc. - ne pas ajouter
  const countryCodes = ['223', '225', '221', '226', '227', '228', '229', '33', '1']
  const hasCountryCode = countryCodes.some(code => cleaned.startsWith(code) && cleaned.length > 10)
  
  // Si pas de code pays détecté, ajouter le code Mali (223)
  if (!hasCountryCode && cleaned.length <= 10) {
    // Enlever le 0 initial si présent (format local)
    if (cleaned.startsWith('0') && cleaned.length === 9) {
      cleaned = cleaned.substring(1)
    }
    cleaned = defaultCountryCode + cleaned
  }
  
  return cleaned
}

/**
 * Envoie un SMS transactionnel via Brevo
 */
export async function sendSMS({ recipient, content, type = 'transactional', tag }: SendSMSParams): Promise<SMSResponse | null> {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    console.error("BREVO_API_KEY n'est pas configuré")
    if (process.env.NODE_ENV === "development") {
      console.log("📱 SMS simulé:")
      console.log("  To:", recipient)
      console.log("  Content:", content)
      return { messageId: Date.now(), smsCount: 1, usedCredits: 1, remainingCredits: 999 }
    }
    return null
  }

  try {
    const formattedRecipient = formatPhoneNumber(recipient)
    
    const response = await fetch("https://api.brevo.com/v3/transactionalSMS/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: SENDER_NAME,
        recipient: formattedRecipient,
        content,
        type,
        tag,
        unicodeEnabled: true, // Support des caractères spéciaux
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Erreur Brevo SMS:", error)
      return null
    }

    const result = await response.json()
    console.log(`📱 SMS envoyé à ${formattedRecipient}`)
    return result
  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error)
    return null
  }
}

// ===========================================
// SMS TEMPLATES
// ===========================================

/**
 * SMS de confirmation de commande (pour guests)
 */
export async function sendOrderConfirmationSMS(phone: string, orderNumber: string, total: number) {
  const content = `Sissan: Votre commande ${orderNumber} de ${total.toLocaleString('fr-FR')} FCFA est confirmée! Suivez-la sur ${STORE_URL}/track/${orderNumber}`
  
  return sendSMS({
    recipient: phone,
    content,
    tag: 'order_confirmation'
  })
}

/**
 * SMS de changement de statut commande
 */
type OrderStatusSMS = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

const SMS_STATUS_MESSAGES: Record<OrderStatusSMS, string> = {
  PROCESSING: 'Votre commande {orderNumber} est en préparation.',
  SHIPPED: 'Votre commande {orderNumber} a été expédiée! Livraison prévue sous 24-48h.',
  DELIVERED: 'Votre commande {orderNumber} a été livrée. Merci pour votre confiance!',
  CANCELLED: 'Votre commande {orderNumber} a été annulée. Contactez-nous pour plus d\'infos.'
}

export async function sendOrderStatusSMS(phone: string, orderNumber: string, status: OrderStatusSMS, trackingNumber?: string) {
  let message = `Sissan: ${SMS_STATUS_MESSAGES[status].replace('{orderNumber}', orderNumber)}`
  
  if (status === 'SHIPPED' && trackingNumber) {
    message += ` Suivi: ${trackingNumber}`
  }
  
  return sendSMS({
    recipient: phone,
    content: message,
    tag: `order_${status.toLowerCase()}`
  })
}

/**
 * SMS de confirmation de paiement
 */
export async function sendPaymentConfirmationSMS(phone: string, orderNumber: string, amount: number) {
  const content = `Sissan: Paiement de ${amount.toLocaleString('fr-FR')} FCFA reçu pour la commande ${orderNumber}. Merci!`
  
  return sendSMS({
    recipient: phone,
    content,
    tag: 'payment_confirmation'
  })
}

/**
 * SMS code de vérification (OTP)
 */
export async function sendVerificationCodeSMS(phone: string, code: string) {
  const content = `Sissan: Votre code de verification est ${code}. Valable 15 minutes. Ne le partagez pas.`
  
  return sendSMS({
    recipient: phone,
    content,
    tag: 'verification_code'
  })
}

/**
 * SMS de bienvenue
 */
export async function sendWelcomeSMS(phone: string, name: string) {
  const content = `Bienvenue sur Sissan ${name}! Decouvrez nos produits sur ${STORE_URL}`
  
  return sendSMS({
    recipient: phone,
    content,
    tag: 'welcome'
  })
}
