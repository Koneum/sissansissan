import { getSession } from "@/lib/get-session"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// DELETE /api/user/delete-account - Supprimer le compte utilisateur (PROTECTED)
export async function DELETE(request: NextRequest) {
  try {
    // ========================================
    // 1. AUTHENTIFICATION VIA SESSION
    // ========================================
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // ========================================
    // 2. VALIDATION DE LA CONFIRMATION
    // ========================================
    const body = await request.json()
    const { confirmText } = body

    if (confirmText !== "SUPPRIMER") {
      return NextResponse.json(
        { success: false, error: "Confirmation invalide. Veuillez taper 'SUPPRIMER'" },
        { status: 400 }
      )
    }

    // ========================================
    // 3. VÉRIFIER QUE L'UTILISATEUR EXISTE
    // ========================================
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Empêcher la suppression des comptes admin/super_admin
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Les comptes administrateurs ne peuvent pas être supprimés via cette interface" },
        { status: 403 }
      )
    }

    // ========================================
    // 4. SUPPRIMER LES DONNÉES ASSOCIÉES
    // ========================================
    // Note: Selon la configuration Prisma, les relations peuvent être
    // supprimées automatiquement (onDelete: Cascade) ou manuellement

    // Supprimer les sessions de l'utilisateur
    await prisma.session.deleteMany({
      where: { userId }
    })

    // Supprimer les comptes liés (OAuth)
    await prisma.account.deleteMany({
      where: { userId }
    })

    // Supprimer les articles de wishlist
    await prisma.wishlistItem.deleteMany({
      where: { userId }
    })

    // Supprimer les adresses
    await prisma.address.deleteMany({
      where: { userId }
    })

    // Supprimer les avis
    await prisma.review.deleteMany({
      where: { userId }
    })

    // Note: Les commandes sont conservées pour l'historique comptable
    // On ne peut pas mettre userId à null car c'est un champ required
    // Les commandes restent liées à l'utilisateur jusqu'à sa suppression

    // ========================================
    // 5. SUPPRIMER L'UTILISATEUR
    // ========================================
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: "Votre compte a été supprimé avec succès"
    })
  } catch (error) {
    console.error("Erreur suppression compte:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    )
  }
}
