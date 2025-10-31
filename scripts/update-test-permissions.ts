/**
 * Script to update test@sissan.com permissions
 * Usage: npx tsx scripts/update-test-permissions.ts
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function updateTestPermissions() {
  const email = 'test@sissan.com'
  
  console.log(`🔄 Mise à jour des permissions pour ${email}...\n`)
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.error(`❌ Utilisateur ${email} non trouvé`)
      process.exit(1)
    }
    
    // Get all permissions
    const allPermissions = await prisma.permission.findMany()
    
    const permissionMap: { [key: string]: string } = {}
    allPermissions.forEach(p => {
      permissionMap[p.category] = p.id
    })
    
    // Delete existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId: user.id }
    })
    
    console.log('🗑️  Anciennes permissions supprimées\n')
    
    // Define new permissions for MANAGER
    const newPermissions = [
      // Staff: Voir et Créer
      {
        permissionId: permissionMap['staff'],
        canView: true,
        canCreate: true,
        canEdit: false,
        canDelete: false,
      },
      // Dashboard: Full access
      {
        permissionId: permissionMap['dashboard'],
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      // Customers: Full access
      {
        permissionId: permissionMap['customers'],
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
      // Orders: Full access
      {
        permissionId: permissionMap['orders'],
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
      // Categories: Full access
      {
        permissionId: permissionMap['categories'],
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
      // Products: Full access
      {
        permissionId: permissionMap['products'],
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
    ]
    
    // Create new permissions
    for (const perm of newPermissions) {
      if (perm.permissionId) {
        await prisma.userPermission.create({
          data: {
            userId: user.id,
            ...perm,
          }
        })
      }
    }
    
    console.log('✅ Nouvelles permissions créées:\n')
    console.log('📋 Permissions de test@sissan.com (MANAGER):')
    console.log('─────────────────────────────────────')
    console.log('✓ Dashboard: Voir')
    console.log('✓ Staff: Voir et Créer (peut voir et créer du personnel)')
    console.log('✓ Clients: Full access')
    console.log('✓ Commandes: Full access')
    console.log('✓ Catégories: Full access')
    console.log('✓ Produits: Full access')
    console.log('\n❌ Staff: NE PEUT PAS Modifier ou Supprimer')
    console.log('─────────────────────────────────────\n')
    
    console.log('🎉 Permissions mises à jour avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTestPermissions()
