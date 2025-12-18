import { NextRequest } from "next/server"
import { auth } from "./auth"
import prisma from "./prisma"

/**
 * Get session from request - supports both cookies and Bearer token
 * This is essential for mobile apps that can't use cookies reliably
 */
export async function getSession(request: NextRequest) {
  // 1. Try standard cookie-based session first
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user) {
      console.log('✅ Session found via cookies for:', session.user.email)
      return session
    }
  } catch (error) {
    console.log('⚠️ Cookie session check failed:', error)
  }

  // 2. Try Bearer token from Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    console.log('🔑 Trying Bearer token authentication...')
    
    try {
      // Look up the session by token in the database
      const sessionRecord = await prisma.session.findFirst({
        where: {
          token: token,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: true
        }
      })

      if (sessionRecord?.user) {
        console.log('✅ Session found via Bearer token for:', sessionRecord.user.email)
        return {
          session: {
            id: sessionRecord.id,
            token: sessionRecord.token,
            userId: sessionRecord.userId,
            expiresAt: sessionRecord.expiresAt,
          },
          user: {
            id: sessionRecord.user.id,
            name: sessionRecord.user.name,
            email: sessionRecord.user.email,
            emailVerified: sessionRecord.user.emailVerified,
            image: sessionRecord.user.image,
            role: sessionRecord.user.role,
            phone: sessionRecord.user.phone,
          }
        }
      } else {
        console.log('⚠️ No valid session found for Bearer token')
      }
    } catch (error) {
      console.error('❌ Bearer token validation error:', error)
    }
  }

  // 3. Try token from Cookie header (mobile apps send custom cookie header)
  const cookieHeader = request.headers.get('Cookie')
  if (cookieHeader) {
    // Parse cookies to find session token
    const cookies = cookieHeader.split(';').map(c => c.trim())
    let token: string | null = null

    for (const cookie of cookies) {
      // Check various cookie name formats
      if (cookie.startsWith('__Secure-sissan.session_token=')) {
        token = cookie.split('=')[1]
        break
      }
      if (cookie.startsWith('sissan.session_token=')) {
        token = cookie.split('=')[1]
        break
      }
    }

    if (token) {
      console.log('🍪 Trying cookie token authentication...')
      try {
        const sessionRecord = await prisma.session.findFirst({
          where: {
            token: token,
            expiresAt: {
              gt: new Date()
            }
          },
          include: {
            user: true
          }
        })

        if (sessionRecord?.user) {
          console.log('✅ Session found via cookie token for:', sessionRecord.user.email)
          return {
            session: {
              id: sessionRecord.id,
              token: sessionRecord.token,
              userId: sessionRecord.userId,
              expiresAt: sessionRecord.expiresAt,
            },
            user: {
              id: sessionRecord.user.id,
              name: sessionRecord.user.name,
              email: sessionRecord.user.email,
              emailVerified: sessionRecord.user.emailVerified,
              image: sessionRecord.user.image,
              role: sessionRecord.user.role,
              phone: sessionRecord.user.phone,
            }
          }
        }
      } catch (error) {
        console.error('❌ Cookie token validation error:', error)
      }
    }
  }

  console.log('❌ No valid session found')
  return null
}
