/**
 * Script to seed default permissions
 * Usage: npx tsx scripts/seed-permissions.ts
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

const defaultPermissions = [
  // Dashboard
  { name: 'dashboard.view', description: 'Voir le dashboard', category: 'dashboard' },
  { name: 'dashboard.stats', description: 'Voir les statistiques', category: 'dashboard' },
  
  // Products
  { name: 'products.view', description: 'Voir les produits', category: 'products' },
  { name: 'products.create', description: 'Créer des produits', category: 'products' },
  { name: 'products.edit', description: 'Modifier des produits', category: 'products' },
  { name: 'products.delete', description: 'Supprimer des produits', category: 'products' },
  
  // Orders
  { name: 'orders.view', description: 'Voir les commandes', category: 'orders' },
  { name: 'orders.create', description: 'Créer des commandes', category: 'orders' },
  { name: 'orders.edit', description: 'Modifier des commandes', category: 'orders' },
  { name: 'orders.delete', description: 'Supprimer des commandes', category: 'orders' },
  
  // Customers
  { name: 'customers.view', description: 'Voir les clients', category: 'customers' },
  { name: 'customers.create', description: 'Créer des clients', category: 'customers' },
  { name: 'customers.edit', description: 'Modifier des clients', category: 'customers' },
  { name: 'customers.delete', description: 'Supprimer des clients', category: 'customers' },
  
  // Categories
  { name: 'categories.view', description: 'Voir les catégories', category: 'categories' },
  { name: 'categories.create', description: 'Créer des catégories', category: 'categories' },
  { name: 'categories.edit', description: 'Modifier des catégories', category: 'categories' },
  { name: 'categories.delete', description: 'Supprimer des catégories', category: 'categories' },
  
  // Reviews
  { name: 'reviews.view', description: 'Voir les avis', category: 'reviews' },
  { name: 'reviews.edit', description: 'Modifier des avis', category: 'reviews' },
  { name: 'reviews.delete', description: 'Supprimer des avis', category: 'reviews' },
  
  // Coupons
  { name: 'coupons.view', description: 'Voir les coupons', category: 'coupons' },
  { name: 'coupons.create', description: 'Créer des coupons', category: 'coupons' },
  { name: 'coupons.edit', description: 'Modifier des coupons', category: 'coupons' },
  { name: 'coupons.delete', description: 'Supprimer des coupons', category: 'coupons' },
  
  // Settings
  { name: 'settings.view', description: 'Voir les paramètres', category: 'settings' },
  { name: 'settings.edit', description: 'Modifier les paramètres', category: 'settings' },
  
  // Staff Management (only for ADMIN and SUPER_ADMIN)
  { name: 'staff.view', description: 'Voir le personnel', category: 'staff' },
  { name: 'staff.create', description: 'Créer du personnel', category: 'staff' },
  { name: 'staff.edit', description: 'Modifier du personnel', category: 'staff' },
  { name: 'staff.delete', description: 'Supprimer du personnel', category: 'staff' },
  { name: 'staff.permissions', description: 'Gérer les permissions', category: 'staff' },
]

async function seedPermissions() {
  console.log('🔐 Seeding permissions...\n')
  
  try {
    for (const permission of defaultPermissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: permission,
        create: permission,
      })
      console.log(`✅ ${permission.name}`)
    }
    
    console.log(`\n🎉 Successfully seeded ${defaultPermissions.length} permissions!`)
  } catch (error) {
    console.error('❌ Error seeding permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPermissions()
