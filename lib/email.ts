// Configuration Brevo (anciennement Sendinblue)
// Documentation: https://developers.brevo.com/docs

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
          name: process.env.NEXT_PUBLIC_STORE_NAME || "Sissan",
          email: process.env.BREVO_SENDER_EMAIL || "noreply@sissan-sissan.net",
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

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw error
  }
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
