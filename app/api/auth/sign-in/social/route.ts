/**
 * Mobile Social Sign-In Endpoint
 * POST /api/auth/sign-in/social
 * 
 * Gère l'authentification Apple depuis l'app mobile
 * Le token mobile a une audience différente (App ID vs Service ID)
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Audiences Apple valides (Service ID pour web, App ID pour mobile)
const VALID_APPLE_AUDIENCES = [
  process.env.APPLE_CLIENT_ID,      // Service ID (web)
  process.env.APPLE_APP_ID,         // App ID (mobile)
  'com.empire.sissansissan',        // App ID fallback
  'com.empire.sissan-sissan',       // Bundle ID mobile
].filter(Boolean)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, idToken, name } = body

    if (provider !== 'apple') {
      return NextResponse.json(
        { error: 'Provider non supporté' },
        { status: 400 }
      )
    }

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Vérifier le token Apple
    const appleUser = await verifyAppleToken(idToken)
    if (!appleUser) {
      return NextResponse.json(
        { error: 'Token Apple invalide' },
        { status: 401 }
      )
    }

    const { sub: appleId, email } = appleUser

    // Chercher un utilisateur existant avec cet Apple ID
    let user = await prisma.user.findFirst({
      where: { 
        accounts: {
          some: {
            providerId: 'apple',
            accountId: appleId
          }
        }
      }
    })

    // Si pas trouvé par Apple ID, chercher par email
    if (!user && email) {
      user = await prisma.user.findFirst({
        where: { email }
      })

      // Lier le compte Apple si trouvé par email
      if (user) {
        // Vérifier si le compte Apple existe déjà
        const existingAccount = await prisma.account.findFirst({
          where: {
            providerId: 'apple',
            accountId: appleId
          }
        })
        
        if (!existingAccount) {
          await prisma.account.create({
            data: {
              id: generateToken(32),
              userId: user.id,
              providerId: 'apple',
              accountId: appleId,
            }
          })
        }
      }
    }

    // Créer un nouvel utilisateur si non trouvé
    if (!user) {
      if (!email) {
        return NextResponse.json(
          { error: 'Email requis pour créer un compte' },
          { status: 400 }
        )
      }

      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          emailVerified: true,
          role: 'CUSTOMER',
          accounts: {
            create: {
              id: generateToken(32),
              providerId: 'apple',
              accountId: appleId,
            }
          }
        }
      })

      console.log(`✅ Nouvel utilisateur créé via Apple: ${email}`)
    }

    // Créer une session
    const sessionToken = generateToken(64)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours

    const session = await prisma.session.create({
      data: {
        id: generateToken(32),
        userId: user.id,
        token: sessionToken,
        expiresAt,
      }
    })

    // Retourner l'utilisateur et le token
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: (user as any).phone,
        role: (user as any).role || 'CUSTOMER',
        image: user.image,
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      }
    })

  } catch (error) {
    console.error('Social sign-in error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Vérifier le token Apple (accepte Service ID et App ID)
async function verifyAppleToken(idToken: string): Promise<{ sub: string; email?: string } | null> {
  try {
    const parts = idToken.split('.')
    if (parts.length !== 3) {
      console.error('[Apple Mobile] Invalid token format')
      return null
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    
    console.log('[Apple Mobile] Token payload:', {
      iss: payload.iss,
      aud: payload.aud,
      sub: payload.sub,
      email: payload.email,
      validAudiences: VALID_APPLE_AUDIENCES,
    })

    // Vérifier l'issuer
    if (payload.iss !== 'https://appleid.apple.com') {
      console.error('[Apple Mobile] Invalid issuer:', payload.iss)
      return null
    }

    // Vérifier l'audience (accepter Service ID ou App ID)
    if (!VALID_APPLE_AUDIENCES.includes(payload.aud)) {
      console.error('[Apple Mobile] Invalid audience:', payload.aud)
      return null
    }

    // Vérifier l'expiration
    if (payload.exp < Date.now() / 1000) {
      console.error('[Apple Mobile] Token expired')
      return null
    }

    return {
      sub: payload.sub,
      email: payload.email
    }
  } catch (error) {
    console.error('[Apple Mobile] Token verification error:', error)
    return null
  }
}

function generateToken(length: number): string {
  return randomBytes(length).toString('hex').slice(0, length)
}
