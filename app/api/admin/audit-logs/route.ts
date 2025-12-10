import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { checkPermission } from '@/lib/check-permission'

/**
 * GET /api/admin/audit-logs
 * Récupère les logs d'audit avec pagination et filtres
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions (seuls les admins peuvent voir les logs)
    const { authorized } = await checkPermission(request, 'dashboard', 'canView')
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Permission refusée' }, { status: 403 })
    }

    // Paramètres de requête
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const success = searchParams.get('success')

    // Construire le filtre
    const where: Record<string, unknown> = {}

    if (action) {
      where.action = action
    }
    if (resource) {
      where.resource = resource
    }
    if (userId) {
      where.userId = userId
    }
    if (success !== null && success !== undefined) {
      where.success = success === 'true'
    }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    // Récupérer les logs avec pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[AuditLogs API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
