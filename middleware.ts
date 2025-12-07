import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de sécurité global pour Sissan-Sissan
 * 
 * Routes autorisées sans authentification:
 * - /api/auth/* (Better Auth)
 * - /api/payments/callback (VitePay callbacks)
 * - GET /api/products, /api/categories, /api/pages/* (publiques)
 * - Pages publiques du site
 * 
 * Routes protégées:
 * - /admin/* (interface admin)
 * - /api/admin/* (API admin)
 * - Mutations sur /api/products, /api/orders, /api/customers, etc.
 */

// Routes API qui ne nécessitent JAMAIS d'authentification
const PUBLIC_API_ROUTES = [
  '/api/auth',           // Better Auth - TOUJOURS public
  '/api/payments',       // VitePay callbacks
  '/api/checkout',       // Checkout (guest checkout autorisé)
  '/api/contact',        // Formulaire de contact
  '/api/translate',      // Traductions
]

// Routes API publiques en lecture seule (GET uniquement)
const PUBLIC_GET_ROUTES = [
  '/api/products',
  '/api/categories', 
  '/api/pages',
  '/api/settings',
  '/api/images',
]

// Routes qui nécessitent une authentification admin/staff
const ADMIN_ROUTES = [
  '/api/admin',
  '/api/dashboard',
  '/api/customers',
  '/api/notifications',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // ====================================================
  // 1. Toujours autoriser les routes Better Auth
  // ====================================================
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // ====================================================
  // 2. Autoriser les callbacks VitePay (webhooks externes)
  // ====================================================
  if (pathname.startsWith('/api/payments')) {
    return NextResponse.next()
  }

  // ====================================================
  // 3. Autoriser le checkout (peut être guest)
  // ====================================================
  if (pathname.startsWith('/api/checkout')) {
    return NextResponse.next()
  }

  // ====================================================
  // 4. Autoriser le formulaire de contact (public)
  // ====================================================
  if (pathname.startsWith('/api/contact') && method === 'POST') {
    return NextResponse.next()
  }

  // ====================================================
  // 5. Autoriser les routes de lecture publiques (GET)
  // ====================================================
  if (method === 'GET') {
    for (const route of PUBLIC_GET_ROUTES) {
      if (pathname.startsWith(route)) {
        return NextResponse.next()
      }
    }
  }

  // ====================================================
  // 6. Routes /admin/* - Vérifier le cookie de session
  // ====================================================
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('sissan.session_token')?.value
    
    if (!sessionToken) {
      // Rediriger vers la page de connexion
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
    
    // Le cookie existe, laisser passer (la vérification du rôle se fait côté composant/API)
    return NextResponse.next()
  }

  // ====================================================
  // 7. Routes API admin - Vérifier le cookie de session
  // ====================================================
  for (const route of ADMIN_ROUTES) {
    if (pathname.startsWith(route)) {
      const sessionToken = request.cookies.get('sissan.session_token')?.value
      
      if (!sessionToken) {
        return NextResponse.json(
          { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
          { status: 401 }
        )
      }
      
      return NextResponse.next()
    }
  }

  // ====================================================
  // 8. Routes API avec mutations (POST, PUT, PATCH, DELETE)
  // ====================================================
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Vérifier si c'est une route API
    if (pathname.startsWith('/api/')) {
      const sessionToken = request.cookies.get('sissan.session_token')?.value
      
      // Exceptions déjà gérées plus haut (auth, payments, checkout, contact)
      // Pour les autres mutations, exiger une authentification
      if (!sessionToken) {
        return NextResponse.json(
          { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
          { status: 401 }
        )
      }
    }
  }

  // ====================================================
  // 9. Routes API orders - Protection spéciale
  // ====================================================
  if (pathname.startsWith('/api/orders')) {
    const sessionToken = request.cookies.get('sissan.session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }
  }

  // ====================================================
  // 10. Routes API wishlist/cart - Authentification requise
  // ====================================================
  if (pathname.startsWith('/api/wishlist') || pathname.startsWith('/api/cart')) {
    const sessionToken = request.cookies.get('sissan.session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }
  }

  // ====================================================
  // 11. Routes API addresses - Authentification requise
  // ====================================================
  if (pathname.startsWith('/api/addresses')) {
    const sessionToken = request.cookies.get('sissan.session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }
  }

  // ====================================================
  // 12. Routes API user - Authentification requise
  // ====================================================
  if (pathname.startsWith('/api/user')) {
    const sessionToken = request.cookies.get('sissan.session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }
  }

  // Laisser passer toutes les autres requêtes (pages publiques, etc.)
  return NextResponse.next()
}

// Configuration du matcher - quelles routes le middleware doit intercepter
export const config = {
  matcher: [
    // Routes admin
    '/admin/:path*',
    // Routes API (sauf _next et fichiers statiques)
    '/api/:path*',
  ],
}
