// Configuration Brevo (anciennement Sendinblue)
// Documentation: https://developers.brevo.com/docs

const SENDER_EMAIL = "noreply@sissan-sissan.net"
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
                <td style="background: linear-gradient(135deg, #2E5BA8 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
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
                        <a href="${STORE_URL}" style="display: inline-block; padding: 16px 40px; background-color: #F39C12; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
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
                <td style="background: linear-gradient(135deg, #2E5BA8 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
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
                  <div style="background-color: #f8fafc; border: 2px dashed #2E5BA8; border-radius: 12px; padding: 30px; margin: 30px 0;">
                    <p style="color: #2E5BA8; font-size: 42px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: monospace;">
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
