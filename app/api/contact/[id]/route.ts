import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/contact/[id] - Get single message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: message
    })

  } catch (error) {
    console.error("Error fetching contact message:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du message" },
      { status: 500 }
    )
  }
}

// PATCH /api/contact/[id] - Update message status/notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body

    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message non trouvé" },
        { status: 404 }
      )
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedMessage
    })

  } catch (error) {
    console.error("Error updating contact message:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du message" },
      { status: 500 }
    )
  }
}

// DELETE /api/contact/[id] - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message non trouvé" },
        { status: 404 }
      )
    }

    await prisma.contactMessage.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: "Message supprimé avec succès"
    })

  } catch (error) {
    console.error("Error deleting contact message:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du message" },
      { status: 500 }
    )
  }
}
