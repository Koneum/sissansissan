import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { sendWelcomeEmail } from './email'
import prisma from './prisma'


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'CUSTOMER',
      },
      phone: {
        type: 'string', 
        required: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      teamId: process.env.APPLE_TEAM_ID!,
      keyId: process.env.APPLE_KEY_ID!,
      privateKey: process.env.APPLE_PRIVATE_KEY!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours pour les customers (pas de délai)
    updateAge: 60 * 60 * 24, // Rafraîchir le token tous les jours
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'sissan',
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://192.168.100.8:8081',
    'exp://192.168.100.8:8081',
    'https://sissan-sissan.net',
    'http://sissan-sissan.net',
  ],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'https://sissan-sissan.net',
  
  // Hooks pour envoyer les emails de bienvenue
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          // Envoyer l'email de bienvenue pour tous les nouveaux comptes
          try {
            const user = await prisma.user.findUnique({
              where: { id: account.userId }
            })
            
            if (user) {
              // Déterminer le provider pour personnaliser le message
              const isCredential = account.providerId === 'credential'
              const providerName = isCredential 
                ? undefined 
                : account.providerId.charAt(0).toUpperCase() + account.providerId.slice(1)
              
              await sendWelcomeEmail(user.email, user.name || 'Cher client', providerName)
              console.log(`📧 Email de bienvenue${providerName ? ` (${providerName})` : ''} envoyé à ${user.email}`)
            }
          } catch (error) {
            console.error('Erreur envoi email de bienvenue:', error)
            // Ne pas bloquer l'inscription/connexion si l'email échoue
          }
        },
      },
    },
  },
})