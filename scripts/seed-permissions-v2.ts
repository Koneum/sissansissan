/**
 * Script to seed permissions V2 - One permission per category
 * Usage: npx tsx scripts/seed-permissions-v2.ts
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

const defaultPermissions = [
  // Dashboard
  { name: 'dashboard', description: 'Dashboard', category: 'dashboard' },
  
  // Products
  { name: 'products', description: 'Produits', category: 'products' },
  
  // Orders
  { name: 'orders', description: 'Commandes', category: 'orders' },
  
  // Customers
  { name: 'customers', description: 'Clients', category: 'customers' },
  
  // Categories
  { name: 'categories', description: 'Catégories', category: 'categories' },
  
  // Reviews
  { name: 'reviews', description: 'Avis', category: 'reviews' },
  
  // Coupons
  { name: 'coupons', description: 'Coupons', category: 'coupons' },
  
  // Settings
  { name: 'settings', description: 'Paramètres', category: 'settings' },
  
  // Staff Management
  { name: 'staff', description: 'Personnel', category: 'staff' },
  
  // Customization
  { name: 'customization', description: 'Personnalisation', category: 'customization' },
]

async function seedPermissions() {
  console.log('🔐 Seeding permissions V2...\n')
  console.log('⚠️  This will delete all existing permissions and user permissions!\n')
  
  try {
    // Delete all existing user permissions first
    console.log('🗑️  Deleting existing user permissions...')
    await prisma.userPermission.deleteMany({})
    
    // Delete all existing permissions
    console.log('🗑️  Deleting existing permissions...')
    await prisma.permission.deleteMany({})
    
    console.log('\n✨ Creating new permissions...\n')
    
    for (const permission of defaultPermissions) {
      await prisma.permission.create({
        data: permission,
      })
      console.log(`✅ ${permission.name} - ${permission.description}`)
    }
    
    console.log(`\n🎉 Successfully seeded ${defaultPermissions.length} permissions!`)
    console.log('\n📝 Note: You need to reassign permissions to users in the admin interface.')
  } catch (error) {
    console.error('❌ Error seeding permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPermissions()
