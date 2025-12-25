/**
 * Apple Sign-In - Initiate OAuth Flow
 * GET /api/auth/signin/apple
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state') || ''

  const clientId = process.env.APPLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(new URL('/signin?error=apple_not_configured', request.url))
  }

  // Construire l'URL de callback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sissan-sissan.net'
  const redirectUri = `${baseUrl}/api/auth/callback/apple`

  // Construire l'URL d'autorisation Apple
  const appleAuthUrl = new URL('https://appleid.apple.com/auth/authorize')
  
  appleAuthUrl.searchParams.set('client_id', clientId)
  appleAuthUrl.searchParams.set('redirect_uri', redirectUri)
  appleAuthUrl.searchParams.set('response_type', 'code id_token')
  appleAuthUrl.searchParams.set('response_mode', 'form_post')
  appleAuthUrl.searchParams.set('scope', 'name email')
  appleAuthUrl.searchParams.set('state', state)

  return NextResponse.redirect(appleAuthUrl.toString())
}
