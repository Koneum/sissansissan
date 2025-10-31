/**
 * Script to update perso@sissan.com permissions
 * Usage: npx tsx scripts/update-perso-permissions.ts
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function updatePersoPermissions() {
  const email = 'perso@sissan.com'
  
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
    
    // Define new permissions
    const newPermissions = [
      // Staff: Voir uniquement
      {
        permissionId: permissionMap['staff'],
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      // Customers: Voir uniquement
      {
        permissionId: permissionMap['customers'],
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      // Orders: Voir uniquement
      {
        permissionId: permissionMap['orders'],
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
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
    console.log('📋 Permissions de perso@sissan.com:')
    console.log('─────────────────────────────────────')
    console.log('✓ Staff: Voir uniquement')
    console.log('✓ Clients: Voir uniquement')
    console.log('✓ Commandes: Voir uniquement')
    console.log('✓ Catégories: Full access (Voir, Créer, Modifier, Supprimer)')
    console.log('✓ Produits: Full access (Voir, Créer, Modifier, Supprimer)')
    console.log('\n❌ PAS d\'accès à:')
    console.log('  - Dashboard')
    console.log('  - Paramètres')
    console.log('  - Personnalisation')
    console.log('─────────────────────────────────────\n')
    
    console.log('🎉 Permissions mises à jour avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePersoPermissions()
