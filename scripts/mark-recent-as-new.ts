import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function markRecentProductsAsNew() {
  try {
    // Get products created in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentProducts = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        isNew: false // Only update products not already marked as new
      }
    })

    console.log(`Found ${recentProducts.length} recent products to mark as new`)

    // Update all recent products to be marked as new
    const result = await prisma.product.updateMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      data: {
        isNew: true
      }
    })

    console.log(`✅ Successfully marked ${result.count} products as new`)
    console.log('\nThese products will now appear in the "New Arrivals" section')

  } catch (error) {
    console.error('❌ Error marking products as new:', error)
  } finally {
    await prisma.$disconnect()
  }
}

markRecentProductsAsNew()
