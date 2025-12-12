// Configuration Brevo (anciennement Sendinblue)
// Documentation: https://developers.brevo.com/docs

// ===========================================
// CONFIGURATION DES EMAILS
// ===========================================
// noreply@sissan-sissan.net - Emails transactionnels (ne reçoit pas de réponses)
// support@sissan-sissan.net - Support client
// contact@sissan-sissan.net - Contact général

const SENDER_EMAIL = "noreply@sissan-sissan.net"
const SUPPORT_EMAIL = "support@sissan-sissan.net"
const CONTACT_EMAIL = "contact@sissan-sissan.net"
const SENDER_NAME = "Sissan"
const STORE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sissan-sissan.net"

interface SendEmailParams {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
}

export async function sendEmail({ to, subject, htmlContent, textContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    console.error("BREVO_API_KEY n'est pas configuré")
    // En développement, on log l'email au lieu de le bloquer
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email simulé:")
      console.log("  To:", to)
      console.log("  Subject:", subject)
      return { messageId: "dev-" + Date.now() }
    }
    throw new Error("Configuration email manquante")
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, ""),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Erreur Brevo:", error)
      throw new Error("Échec de l'envoi de l'email")
    }

    console.log(`📧 Email envoyé à ${to}: ${subject}`)
    return await response.json()
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw error
  }
}

// ===========================================
// EMAIL DE BIENVENUE
// ===========================================
export async function sendWelcomeEmail(email: string, name: string, provider?: string) {
  const providerText = provider 
    ? `via ${provider.charAt(0).toUpperCase() + provider.slice(1)}` 
    : ""
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue sur Sissan-Sissan</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #F97316 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                    🎉 Bienvenue sur Sissan-Sissan!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #334155; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                    Bonjour <strong>${name}</strong>,
                  </p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Nous sommes ravis de vous accueillir ${providerText} sur <strong>Sissan-Sissan</strong> ! 🛍️
                  </p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Votre compte a été créé avec succès. Vous pouvez maintenant profiter de tous nos services :
                  </p>
                  
                  <!-- Features -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                      <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 10px;">
                        <p style="color: #334155; font-size: 14px; margin: 0;">
                          ✅ <strong>Parcourir notre catalogue</strong> - Des milliers de produits vous attendent
                        </p>
                      </td>
                    </tr>
                    <tr><td style="height: 10px;"></td></tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                        <p style="color: #334155; font-size: 14px; margin: 0;">
                          ✅ <strong>Passer des commandes</strong> - Livraison rapide et sécurisée
                        </p>
                      </td>
                    </tr>
                    <tr><td style="height: 10px;"></td></tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                        <p style="color: #334155; font-size: 14px; margin: 0;">
                          ✅ <strong>Suivre vos commandes</strong> - En temps réel depuis votre compte
                        </p>
                      </td>
                    </tr>
                    <tr><td style="height: 10px;"></td></tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                        <p style="color: #334155; font-size: 14px; margin: 0;">
                          ✅ <strong>Gérer votre liste de souhaits</strong> - Sauvegardez vos produits préférés
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${STORE_URL}" style="display: inline-block; padding: 16px 40px; background-color: #F97316; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Commencer mes achats 🛒
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                    Des questions ? Notre équipe est là pour vous aider !
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                    © ${new Date().getFullYear()} Sissan. Tous droits réservés.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Cet email a été envoyé à ${email}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Bienvenue sur Sissan!

Bonjour ${name},

Nous sommes ravis de vous accueillir ${providerText} sur Sissan!

Votre compte a été créé avec succès. Vous pouvez maintenant profiter de tous nos services :
- Parcourir notre catalogue
- Passer des commandes
- Suivre vos commandes
- Gérer votre liste de souhaits

Commencez vos achats: ${STORE_URL}

© ${new Date().getFullYear()} Sissan. Tous droits réservés.
  `

  return sendEmail({
    to: email,
    subject: "🎉 Bienvenue sur Sissan!",
    htmlContent,
    textContent,
  })
}

// ===========================================
// EMAIL CODE DE VÉRIFICATION
// ===========================================
export async function sendVerificationCodeEmail(email: string, code: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code de vérification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #F97316 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                    🔐 Code de vérification
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Vous avez demandé un code de vérification pour changer votre mot de passe.
                  </p>
                  
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0;">
                    Voici votre code :
                  </p>
                  
                  <!-- Code Box -->
                  <div style="background-color: #f8fafc; border: 2px dashed #F97316; border-radius: 12px; padding: 30px; margin: 30px 0;">
                    <p style="color: #F97316; font-size: 42px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: monospace;">
                      ${code}
                    </p>
                  </div>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; text-align: left;">
                    <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                      <strong>⏱️ Ce code expire dans 15 minutes.</strong><br>
                      Ne partagez jamais ce code avec qui que ce soit.
                    </p>
                  </div>
                  
                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                    © ${new Date().getFullYear()} Sissan. Tous droits réservés.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Code de vérification Sissan

Vous avez demandé un code de vérification pour changer votre mot de passe.

Votre code: ${code}

⏱️ Ce code expire dans 15 minutes.
Ne partagez jamais ce code avec qui que ce soit.

Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.

© ${new Date().getFullYear()} Sissan. Tous droits réservés.
  `

  return sendEmail({
    to: email,
    subject: "🔐 Votre code de vérification Sissan",
    htmlContent,
    textContent,
  })
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #475569 0%, #64748b 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">
                    Réinitialisation de <span style="font-weight: 700;">mot de passe</span>
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Bonjour,
                  </p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #2dd4bf; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Réinitialiser mon mot de passe
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                  </p>
                  <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin: 10px 0 20px 0;">
                    ${resetUrl}
                  </p>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                      <strong>⚠️ Important :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
                    </p>
                  </div>
                  
                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                    © ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_STORE_NAME || "Sissan"}. Tous droits réservés.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Réinitialisation de mot de passe

Bonjour,

Vous avez demandé à réinitialiser votre mot de passe.

Pour choisir un nouveau mot de passe, cliquez sur ce lien :
${resetUrl}

⚠️ Important : Ce lien expirera dans 1 heure pour des raisons de sécurité.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_STORE_NAME || "Sissan"}. Tous droits réservés.
  `

  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    htmlContent,
    textContent,
  })
}

// ===========================================
// EMAIL CONFIRMATION DE COMMANDE
// ===========================================
interface OrderItem {
  name: string
  quantity: number
  price: number
  thumbnail?: string
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  email: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    country: string
    zipCode: string
    phone: string
  }
  paymentMethod?: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center;">
          <span style="color: #334155; font-weight: 500;">${item.name}</span>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">
        ${item.quantity}
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155; font-weight: 500;">
        ${item.price.toLocaleString('fr-FR')} FCFA
      </td>
    </tr>
  `).join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de commande</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                    ✅ Commande confirmée !
                  </h1>
                  <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">
                    Commande N° ${data.orderNumber}
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Bonjour <strong>${data.customerName}</strong>,
                  </p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Merci pour votre commande ! Nous avons bien reçu votre commande et elle est en cours de traitement.
                  </p>
                  
                  <!-- Order Items -->
                  <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #F97316; padding-bottom: 10px;">
                    📦 Détails de la commande
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <thead>
                      <tr style="background-color: #f8fafc;">
                        <th style="padding: 12px 15px; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">Produit</th>
                        <th style="padding: 12px 15px; text-align: center; color: #64748b; font-size: 12px; text-transform: uppercase;">Qté</th>
                        <th style="padding: 12px 15px; text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase;">Prix</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                  
                  <!-- Totals -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 8px 15px; color: #64748b;">Sous-total</td>
                      <td style="padding: 8px 15px; text-align: right; color: #334155;">${data.subtotal.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                    ${data.discount > 0 ? `
                    <tr>
                      <td style="padding: 8px 15px; color: #10b981;">Réduction</td>
                      <td style="padding: 8px 15px; text-align: right; color: #10b981;">-${data.discount.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 15px; color: #64748b;">Livraison</td>
                      <td style="padding: 8px 15px; text-align: right; color: #334155;">${data.shipping > 0 ? data.shipping.toLocaleString('fr-FR') + ' FCFA' : 'Gratuite'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 15px; color: #64748b;">Taxes</td>
                      <td style="padding: 8px 15px; text-align: right; color: #334155;">${data.tax.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 15px; color: #1e293b; font-weight: 700; font-size: 18px; border-top: 2px solid #e2e8f0;">Total</td>
                      <td style="padding: 12px 15px; text-align: right; color: #F97316; font-weight: 700; font-size: 18px; border-top: 2px solid #e2e8f0;">${data.total.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  </table>
                  
                  <!-- Shipping Address -->
                  <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 15px 0;">
                    📍 Adresse de livraison
                  </h3>
                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <p style="color: #334155; margin: 0; line-height: 1.8;">
                      <strong>${data.shippingAddress.firstName} ${data.shippingAddress.lastName}</strong><br>
                      ${data.shippingAddress.address}<br>
                      ${data.shippingAddress.city}, ${data.shippingAddress.zipCode}<br>
                      ${data.shippingAddress.country}<br>
                      📞 ${data.shippingAddress.phone}
                    </p>
                  </div>
                  
                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${STORE_URL}/account/orders" style="display: inline-block; padding: 16px 40px; background-color: #F97316; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Suivre ma commande 📦
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                    &copy; ${new Date().getFullYear()} Sissan. Tous droits réservés.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Cet email a été envoyé à ${data.email}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Commande confirmée !

Bonjour ${data.customerName},

Merci pour votre commande N° ${data.orderNumber} !

Détails:
${data.items.map(item => `- ${item.name} x${item.quantity}: ${item.price.toLocaleString('fr-FR')} FCFA`).join('\n')}

Total: ${data.total.toLocaleString('fr-FR')} FCFA

Adresse de livraison:
${data.shippingAddress.firstName} ${data.shippingAddress.lastName}
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

Suivre ma commande: ${STORE_URL}/account/orders

&copy; ${new Date().getFullYear()} Sissan. Tous droits réservés.
  `

  return sendEmail({
    to: data.email,
    subject: `✅ Commande ${data.orderNumber} confirmée`,
    htmlContent,
    textContent,
  })
}

// ===========================================
// EMAIL CHANGEMENT DE STATUT COMMANDE
// ===========================================
type OrderStatusType = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

const STATUS_CONFIG: Record<OrderStatusType, { emoji: string; title: string; message: string; color: string }> = {
  PENDING: {
    emoji: '⏳',
    title: 'Commande en attente',
    message: 'Votre commande est en attente de traitement.',
    color: '#f59e0b'
  },
  PROCESSING: {
    emoji: '🔄',
    title: 'Commande en cours de préparation',
    message: 'Bonne nouvelle ! Votre commande est en cours de préparation par notre équipe.',
    color: '#3b82f6'
  },
  SHIPPED: {
    emoji: '🚚',
    title: 'Commande expédiée',
    message: 'Votre commande a été expédiée et est en route vers vous !',
    color: '#8b5cf6'
  },
  DELIVERED: {
    emoji: '✅',
    title: 'Commande livrée',
    message: 'Votre commande a été livrée avec succès. Nous espérons que vous êtes satisfait !',
    color: '#10b981'
  },
  CANCELLED: {
    emoji: '❌',
    title: 'Commande annulée',
    message: 'Votre commande a été annulée. Si vous avez des questions, contactez-nous.',
    color: '#ef4444'
  },
  REFUNDED: {
    emoji: '💰',
    title: 'Commande remboursée',
    message: 'Votre commande a été remboursée. Le montant sera crédité sous 5-10 jours ouvrables.',
    color: '#06b6d4'
  }
}

interface OrderStatusEmailData {
  orderNumber: string
  customerName: string
  email: string
  status: OrderStatusType
  trackingNumber?: string
  total: number
}

export async function sendOrderStatusEmail(data: OrderStatusEmailData) {
  const config = STATUS_CONFIG[data.status]
  
  const trackingHtml = data.trackingNumber && data.status === 'SHIPPED' ? `
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="color: #166534; font-size: 14px; margin: 0 0 10px 0;">Numéro de suivi</p>
      <p style="color: #166534; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace; letter-spacing: 2px;">
        ${data.trackingNumber}
      </p>
    </div>
  ` : ''

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: ${config.color}; padding: 40px 20px; text-align: center;">
                  <p style="font-size: 48px; margin: 0 0 10px 0;">${config.emoji}</p>
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                    ${config.title}
                  </h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                    Commande N° ${data.orderNumber}
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Bonjour <strong>${data.customerName}</strong>,
                  </p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    ${config.message}
                  </p>
                  
                  ${trackingHtml}
                  
                  <!-- Order Summary -->
                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <table width="100%">
                      <tr>
                        <td style="color: #64748b; padding: 5px 0;">Numéro de commande</td>
                        <td style="color: #334155; font-weight: 600; text-align: right;">${data.orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 5px 0;">Montant total</td>
                        <td style="color: #F97316; font-weight: 600; text-align: right;">${data.total.toLocaleString('fr-FR')} FCFA</td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${STORE_URL}/account/orders" style="display: inline-block; padding: 16px 40px; background-color: #F97316; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Voir les détails 📋
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                    &copy; ${new Date().getFullYear()} Sissan. Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
${config.title}

Bonjour ${data.customerName},

${config.message}

Commande: ${data.orderNumber}
${data.trackingNumber ? `Numéro de suivi: ${data.trackingNumber}` : ''}
Total: ${data.total.toLocaleString('fr-FR')} FCFA

Voir les détails: ${STORE_URL}/account/orders

&copy; ${new Date().getFullYear()} Sissan. Tous droits réservés.
  `

  return sendEmail({
    to: data.email,
    subject: `${config.emoji} ${config.title} - Commande ${data.orderNumber}`,
    htmlContent,
    textContent,
  })
}

// ===========================================
// EMAIL CONFIRMATION DE PAIEMENT
// ===========================================
interface PaymentEmailData {
  orderNumber: string
  customerName: string
  email: string
  amount: number
  paymentMethod: string
  paymentId?: string
}

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Paiement confirmé</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                  <p style="font-size: 48px; margin: 0 0 10px 0;">💳</p>
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                    Paiement confirmé !
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Bonjour <strong>${data.customerName}</strong>,
                  </p>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Nous avons bien reçu votre paiement pour la commande <strong>${data.orderNumber}</strong>.
                  </p>
                  
                  <!-- Payment Details -->
                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: center;">
                    <p style="color: #166534; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase;">Montant payé</p>
                    <p style="color: #166534; font-size: 32px; font-weight: 700; margin: 0;">
                      ${data.amount.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p style="color: #166534; font-size: 14px; margin: 10px 0 0 0;">
                      via ${data.paymentMethod}
                    </p>
                  </div>
                  
                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0; text-align: center;">
                    Votre commande sera préparée et expédiée dans les plus brefs délais.
                  </p>
                  
                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${STORE_URL}/account/orders" style="display: inline-block; padding: 16px 40px; background-color: #F97316; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Suivre ma commande 📦
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                    &copy; ${new Date().getFullYear()} Sissan. Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  return sendEmail({
    to: data.email,
    subject: `💳 Paiement confirmé - Commande ${data.orderNumber}`,
    htmlContent,
  })
}

// ===========================================
// EMAIL NOTIFICATION NOUVELLE COMMANDE (ADMIN)
// ===========================================
import prisma from "@/lib/prisma"

interface AdminOrderNotificationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    country: string
    zipCode: string
    phone: string
  }
  paymentMethod?: string
}

export async function sendNewOrderNotificationToAdmins(data: AdminOrderNotificationData) {
  try {
    // Récupérer tous les utilisateurs qui peuvent recevoir des notifications de commandes:
    // 1. Utilisateurs avec rôle ADMIN ou SUPER_ADMIN (toujours notifiés)
    // 2. Utilisateurs avec permission "orders" canView ou canEdit (inclut les nouveaux rôles créés)
    const [adminsByRole, usersWithOrderPermission] = await Promise.all([
      // Admins par rôle
      prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }),
      // Utilisateurs avec permission orders
      prisma.user.findMany({
        where: {
          permissions: {
            some: {
              permission: {
                category: 'orders'
              },
              OR: [
                { canView: true },
                { canEdit: true }
              ]
            }
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
    ])

    // Fusionner et dédupliquer par email
    const allUsersMap = new Map<string, { email: string; name: string; role: string }>()
    
    for (const user of [...adminsByRole, ...usersWithOrderPermission]) {
      if (user.email) {
        allUsersMap.set(user.email, {
          email: user.email,
          name: user.name,
          role: user.role
        })
      }
    }

    const adminUsers = Array.from(allUsersMap.values())

    if (adminUsers.length === 0) {
      console.log('Aucun admin trouvé pour recevoir la notification')
      return
    }

    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${item.price.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    `).join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle Commande</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                      🛒 Nouvelle Commande Reçue !
                    </h1>
                    <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">
                      Commande N° ${data.orderNumber}
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <!-- Alert Box -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
                        ⚡ Une nouvelle commande nécessite votre attention
                      </p>
                    </div>

                    <!-- Customer Info -->
                    <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #F97316; padding-bottom: 8px;">
                      👤 Informations Client
                    </h3>
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                      <p style="color: #334155; margin: 0; line-height: 1.8;">
                        <strong>Nom:</strong> ${data.customerName}<br>
                        <strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color: #2563eb;">${data.customerEmail}</a><br>
                        ${data.customerPhone ? `<strong>Téléphone:</strong> <a href="tel:${data.customerPhone}" style="color: #2563eb;">${data.customerPhone}</a>` : ''}
                      </p>
                    </div>

                    <!-- Order Items -->
                    <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #F97316; padding-bottom: 8px;">
                      📦 Articles Commandés
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                      <thead>
                        <tr style="background-color: #f1f5f9;">
                          <th style="padding: 10px; text-align: left; color: #64748b; font-size: 12px;">PRODUIT</th>
                          <th style="padding: 10px; text-align: center; color: #64748b; font-size: 12px;">QTÉ</th>
                          <th style="padding: 10px; text-align: right; color: #64748b; font-size: 12px;">PRIX</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="2" style="padding: 15px; text-align: right; font-weight: 700; color: #1e293b; font-size: 16px;">TOTAL:</td>
                          <td style="padding: 15px; text-align: right; font-weight: 700; color: #F97316; font-size: 18px;">${data.total.toLocaleString('fr-FR')} FCFA</td>
                        </tr>
                      </tfoot>
                    </table>

                    <!-- Shipping Address -->
                    <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #F97316; padding-bottom: 8px;">
                      📍 Adresse de Livraison
                    </h3>
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                      <p style="color: #334155; margin: 0; line-height: 1.8;">
                        <strong>${data.shippingAddress.firstName} ${data.shippingAddress.lastName}</strong><br>
                        ${data.shippingAddress.address}<br>
                        ${data.shippingAddress.city}, ${data.shippingAddress.zipCode}<br>
                        ${data.shippingAddress.country}<br>
                        📞 ${data.shippingAddress.phone}
                      </p>
                    </div>

                    ${data.paymentMethod ? `
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">
                      <strong>Mode de paiement:</strong> ${data.paymentMethod}
                    </p>
                    ` : ''}

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${STORE_URL}/admin/orders" style="display: inline-block; padding: 14px 30px; background-color: #F97316; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                            Gérer cette commande →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                      Cette notification a été envoyée automatiquement depuis Sissan-Sissan.<br>
                      Ne pas répondre à cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const textContent = `
Nouvelle Commande Reçue !

Commande N° ${data.orderNumber}

Client: ${data.customerName}
Email: ${data.customerEmail}
${data.customerPhone ? `Téléphone: ${data.customerPhone}` : ''}

Articles:
${data.items.map(item => `- ${item.name} x${item.quantity}: ${item.price.toLocaleString('fr-FR')} FCFA`).join('\n')}

TOTAL: ${data.total.toLocaleString('fr-FR')} FCFA

Adresse de livraison:
${data.shippingAddress.firstName} ${data.shippingAddress.lastName}
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.zipCode}
${data.shippingAddress.country}
Tél: ${data.shippingAddress.phone}

Gérer cette commande: ${STORE_URL}/admin/orders
    `

    // Envoyer l'email à tous les admins
    const emailPromises = adminUsers.map(admin => 
      sendEmail({
        to: admin.email!,
        subject: `🛒 Nouvelle commande ${data.orderNumber} - ${data.total.toLocaleString('fr-FR')} FCFA`,
        htmlContent,
        textContent,
      }).catch(err => {
        console.error(`Erreur envoi notification à ${admin.email}:`, err)
        return null
      })
    )

    await Promise.all(emailPromises)
    console.log(`📧 Notification de commande envoyée à ${adminUsers.length} admin(s)`)
    
    return { success: true, adminCount: adminUsers.length }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications admin:', error)
    throw error
  }
}

// Export des emails de configuration pour utilisation ailleurs
export const EMAIL_CONFIG = {
  SENDER: SENDER_EMAIL,
  SUPPORT: SUPPORT_EMAIL,
  CONTACT: CONTACT_EMAIL,
  STORE_URL,
}
