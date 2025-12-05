import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { NextRequest, NextResponse } from "next/server"

// Custom mobile login endpoint that returns proper JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        accounts: {
          where: { providerId: "credential" }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Get credential account
    const credentialAccount = user.accounts.find(a => a.providerId === "credential")
    
    if (!credentialAccount || !credentialAccount.password) {
      return NextResponse.json(
        { success: false, error: "Compte non configuré pour la connexion par mot de passe" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, credentialAccount.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Create session token
    const sessionToken = crypto.randomUUID()
    const sessionId = crypto.randomUUID()
    
    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    })

    // Return user data and token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },
      token: session.token,
    })

  } catch (error) {
    console.error("Mobile login error:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la connexion" },
      { status: 500 }
    )
  }
}
