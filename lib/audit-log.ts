import 'server-only'
import prisma from '@/lib/prisma'
import { AuditAction, Prisma } from '@/app/generated/prisma'
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Interface pour les options de log d'audit
 */
interface AuditLogOptions {
  action: AuditAction
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  success?: boolean
  errorMessage?: string
}

/**
 * Récupère l'adresse IP depuis la requête
 */
function getIpAddress(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  )
}

/**
 * Crée un log d'audit pour une action
 * 
 * @param request - La requête Next.js
 * @param options - Les options du log
 */
export async function createAuditLog(
  request: NextRequest,
  options: AuditLogOptions
): Promise<void> {
  try {
    // Récupérer la session utilisateur
    const session = await auth.api.getSession({ headers: request.headers })
    
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id || null,
        userName: session?.user?.name || null,
        userEmail: session?.user?.email || null,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId || null,
        details: options.details as Prisma.InputJsonValue | undefined,
        ipAddress: getIpAddress(request),
        userAgent: request.headers.get('user-agent') || null,
        success: options.success ?? true,
        errorMessage: options.errorMessage || null,
      },
    })
  } catch (error) {
    // Ne pas bloquer l'action principale si le log échoue
    console.error('[AuditLog] Failed to create audit log:', error)
  }
}

/**
 * Log une action de création
 */
export async function logCreate(
  request: NextRequest,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await createAuditLog(request, {
    action: 'CREATE',
    resource,
    resourceId,
    details,
  })
}

/**
 * Log une action de mise à jour
 */
export async function logUpdate(
  request: NextRequest,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await createAuditLog(request, {
    action: 'UPDATE',
    resource,
    resourceId,
    details,
  })
}

/**
 * Log une action de suppression
 */
export async function logDelete(
  request: NextRequest,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await createAuditLog(request, {
    action: 'DELETE',
    resource,
    resourceId,
    details,
  })
}

/**
 * Log un changement de statut de commande
 */
export async function logOrderStatusChange(
  request: NextRequest,
  orderId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  await createAuditLog(request, {
    action: 'ORDER_STATUS_CHANGE',
    resource: 'order',
    resourceId: orderId,
    details: { oldStatus, newStatus },
  })
}

/**
 * Log un changement de rôle utilisateur
 */
export async function logRoleChange(
  request: NextRequest,
  targetUserId: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  await createAuditLog(request, {
    action: 'ROLE_CHANGE',
    resource: 'user',
    resourceId: targetUserId,
    details: { oldRole, newRole },
  })
}

/**
 * Log une tentative de connexion échouée
 */
export async function logLoginFailed(
  request: NextRequest,
  email: string,
  reason?: string
): Promise<void> {
  await createAuditLog(request, {
    action: 'LOGIN_FAILED',
    resource: 'auth',
    details: { email, reason },
    success: false,
    errorMessage: reason,
  })
}

/**
 * Log une connexion réussie
 */
export async function logLogin(
  request: NextRequest,
  userId: string
): Promise<void> {
  await createAuditLog(request, {
    action: 'LOGIN',
    resource: 'auth',
    resourceId: userId,
  })
}

/**
 * Log une déconnexion
 */
export async function logLogout(
  request: NextRequest,
  userId: string
): Promise<void> {
  await createAuditLog(request, {
    action: 'LOGOUT',
    resource: 'auth',
    resourceId: userId,
  })
}

/**
 * Log une action en masse (bulk)
 */
export async function logBulkDelete(
  request: NextRequest,
  resource: string,
  count: number,
  ids?: string[]
): Promise<void> {
  await createAuditLog(request, {
    action: 'BULK_DELETE',
    resource,
    details: { count, ids },
  })
}

/**
 * Log un changement de paramètres
 */
export async function logSettingsChange(
  request: NextRequest,
  settingsType: string,
  changes: Record<string, unknown>
): Promise<void> {
  await createAuditLog(request, {
    action: 'SETTINGS_CHANGE',
    resource: 'settings',
    resourceId: settingsType,
    details: changes,
  })
}
