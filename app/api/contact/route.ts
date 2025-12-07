import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, message } = body

    // Validation
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email invalide" },
        { status: 400 }
      )
    }

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        firstName,
        lastName: lastName || null,
        email,
        phone: phone || null,
        subject: subject || "Contact général",
        message,
        status: "NEW"
      }
    })

    // Optionally send email notification here
    // You can integrate with your email service

    console.log("📩 New contact message received:", {
      id: contactMessage.id,
      from: `${firstName} ${lastName || ""}`.trim(),
      email,
      subject: subject || "Contact général"
    })

    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès",
      id: contactMessage.id
    })

  } catch (error) {
    console.error("Error saving contact message:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    )
  }
}

// GET /api/contact - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    )
  }
}
