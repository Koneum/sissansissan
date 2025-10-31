/**
 * Script to set a user as ADMIN
 * Usage: npx tsx scripts/set-admin-role.ts admin@sissan.com
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function setAdminRole(email: string) {
  console.log(`🔧 Setting ADMIN role for ${email}...\n`)
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log(`❌ User not found: ${email}`)
      console.log(`\nPlease create the account first via /signin`)
      return
    }
    
    // Update role
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    
    console.log(`✅ User updated successfully!`)
    console.log(`   Email: ${updated.email}`)
    console.log(`   Name: ${updated.name}`)
    console.log(`   Role: ${updated.role}`)
    console.log(`\n🎉 ${email} is now an ADMIN!`)
    console.log(`\nPlease logout and login again for the role to take effect.`)
    
  } catch (error) {
    console.error(`❌ Error:`, error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.log('❌ Please provide an email address')
  console.log('\nUsage: npx tsx scripts/set-admin-role.ts <email>')
  console.log('Example: npx tsx scripts/set-admin-role.ts admin@sissan.com')
  process.exit(1)
}

setAdminRole(email)
