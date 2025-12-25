/**
 * GET /api/auth/me
 * Retourne les infos de l'utilisateur connecté via le cookie de session
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token de session depuis les cookies
    const sessionToken = request.cookies.get('__Secure-sissan.session_token')?.value 
      || request.cookies.get('sissan.session_token')?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Trouver la session
    const session = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: true
      }
    })

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Retourner les infos utilisateur
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        phone: session.user.phone,
        role: session.user.role,
        image: session.user.image,
      }
    })

  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
