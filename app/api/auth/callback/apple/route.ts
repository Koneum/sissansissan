/**
 * Apple Sign-In Callback Handler
 * POST /api/auth/callback/apple
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Audiences Apple valides
const VALID_APPLE_AUDIENCES = [
  process.env.APPLE_CLIENT_ID,      // Service ID (web)
  process.env.APPLE_APP_ID,         // App ID (mobile)
  'com.empire.sissansissan',        // App ID fallback
  'com.empire.sissan-sissan',       // Bundle ID mobile
].filter(Boolean)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const idToken = formData.get('id_token') as string
    const state = formData.get('state') as string
    const userDataStr = formData.get('user') as string

    if (!idToken) {
      return NextResponse.redirect(new URL('/signin?error=missing_token', request.url), { status: 303 })
    }

    // Décoder le state
    let isRegister = false
    let redirectUrl = '/'
    
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        isRegister = stateData.action === 'register'
        redirectUrl = stateData.redirect || '/'
      } catch {
        // State invalide
      }
    }

    // Extraire les infos utilisateur d'Apple (première connexion uniquement)
    let appleUserData: { email?: string; name?: { firstName?: string; lastName?: string } } = {}
    if (userDataStr) {
      try {
        appleUserData = JSON.parse(userDataStr)
      } catch {}
    }

    // Vérifier le token Apple
    const appleUser = await verifyAppleToken(idToken)
    if (!appleUser) {
      return NextResponse.redirect(new URL('/signin?error=invalid_token', request.url), { status: 303 })
    }

    const appleId = appleUser.sub
    const email = appleUser.email || appleUserData.email
    const fullName = appleUserData.name 
      ? `${appleUserData.name.firstName || ''} ${appleUserData.name.lastName || ''}`.trim()
      : undefined

    console.log('[Apple Callback] Recherche utilisateur:', { appleId, email, fullName })

    // Chercher un compte existant avec cet Apple ID
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

    if (user) {
      console.log('[Apple Callback] Utilisateur trouvé par Apple ID:', user.id)
      return await createSessionAndRedirect(user, redirectUrl, request)
    }

    console.log('[Apple Callback] Pas trouvé par Apple ID, recherche par email...')

    // Chercher par email
    if (email) {
      user = await prisma.user.findFirst({
        where: { email }
      })

      if (user) {
        console.log('[Apple Callback] Utilisateur trouvé par email:', user.id)
        // Lier le compte Apple
        const existingAccount = await prisma.account.findFirst({
          where: { providerId: 'apple', accountId: appleId }
        })
        
        if (!existingAccount) {
          console.log('[Apple Callback] Liaison du compte Apple...')
          await prisma.account.create({
            data: {
              id: generateToken(32),
              userId: user.id,
              providerId: 'apple',
              accountId: appleId,
            }
          })
        }
        return await createSessionAndRedirect(user, redirectUrl, request)
      }
    }

    console.log('[Apple Callback] Aucun utilisateur trouvé, création...')

    // Aucun compte trouvé - créer automatiquement
    if (!email) {
      console.log('[Apple Callback] ERREUR: Email manquant')
      return NextResponse.redirect(
        new URL('/signin?error=email_required', request.url),
        { status: 303 }
      )
    }

    try {
      const newUser = await prisma.user.create({
        data: {
          email,
          name: fullName || email.split('@')[0],
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

      console.log(`✅ Nouvel utilisateur créé via Apple: ${email}, ID: ${newUser.id}`)
      return await createSessionAndRedirect(newUser, redirectUrl, request)
    } catch (createError) {
      console.error('[Apple Callback] Erreur création utilisateur:', createError)
      throw createError
    }

  } catch (error) {
    console.error('Apple callback error:', error)
    return NextResponse.redirect(new URL('/signin?error=callback_failed', request.url), { status: 303 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/signin?error=${error}`, request.url))
  }

  return NextResponse.redirect(new URL('/signin?error=use_post', request.url))
}

// Vérifier le token Apple
async function verifyAppleToken(idToken: string): Promise<{ sub: string; email?: string } | null> {
  try {
    const parts = idToken.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    
    console.log('[Apple Callback] Token:', {
      iss: payload.iss,
      aud: payload.aud,
      sub: payload.sub,
      email: payload.email,
      validAudiences: VALID_APPLE_AUDIENCES,
    })

    if (payload.iss !== 'https://appleid.apple.com') return null
    if (!VALID_APPLE_AUDIENCES.includes(payload.aud)) return null
    if (payload.exp < Date.now() / 1000) return null

    return {
      sub: payload.sub,
      email: payload.email
    }
  } catch {
    return null
  }
}

// Créer une session et rediriger
async function createSessionAndRedirect(
  user: { id: string; email: string | null; name: string | null },
  redirectUrl: string,
  request: NextRequest
) {
  const sessionToken = generateToken(64)
  
  const session = await prisma.session.create({
    data: {
      id: generateToken(32),
      userId: user.id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    }
  })

  // Rediriger vers /auth/complete pour forcer la synchronisation côté client
  const completeUrl = new URL('/auth/complete', request.url)
  completeUrl.searchParams.set('redirect', redirectUrl)
  
  const response = NextResponse.redirect(completeUrl, { status: 303 })
  
  // Set session cookie - utiliser le même format que Better Auth
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName = isProduction ? '__Secure-sissan.session_token' : 'sissan.session_token'
  
  response.cookies.set(cookieName, session.token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/'
  })

  return response
}

function generateToken(length: number): string {
  return randomBytes(length).toString('hex').slice(0, length)
}
