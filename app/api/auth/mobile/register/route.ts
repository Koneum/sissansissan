import { sendWelcomeEmail } from "@/lib/email"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { NextRequest, NextResponse } from "next/server"

// Custom mobile register endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    const normalizedPhone = String(phone || "").replace(/\D/g, "")

    if (!password || !name || !normalizedPhone) {
      return NextResponse.json(
        { success: false, error: "Nom, téléphone et mot de passe requis" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    const internalEmail = `phone-${normalizedPhone}@sissan.local`
    const finalEmail = String(email || "").trim() ? String(email).trim().toLowerCase() : internalEmail

    const existingByPhone = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
      select: { id: true },
    })

    if (existingByPhone) {
      return NextResponse.json(
        { success: false, error: "Ce téléphone est déjà utilisé" },
        { status: 409 }
      )
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email: finalEmail }
    })

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: "Cet email est déjà utilisé" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and account in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email: finalEmail,
          phone: normalizedPhone,
          role: "CUSTOMER",
          emailVerified: false,
        }
      })

      // Create credential account
      await tx.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashedPassword,
        }
      })

      // Create session
      const session = await tx.session.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      })

      return { user, session }
    })

    if (!String(email || "").trim()) {
      // no-op
    } else {
      sendWelcomeEmail(result.user.email, result.user.name || "Cher client")
        .catch(err => console.error("Failed to send welcome email:", err))
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        image: result.user.image,
        role: result.user.role,
      },
      token: result.session.token,
    })

  } catch (error) {
    console.error("Mobile register error:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'inscription" },
      { status: 500 }
    )
  }
}

