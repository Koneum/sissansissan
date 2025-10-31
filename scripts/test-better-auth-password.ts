/**
 * Test to understand what password format Better Auth expects
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function testPasswordFormat() {
  console.log('🔍 Testing Better Auth password format...\n')
  
  // Get an account
  const account = await prisma.account.findFirst({
    where: { providerId: 'credential' },
    include: { user: true }
  })
  
  if (!account) {
    console.log('❌ No account found')
    return
  }
  
  console.log('Account found:')
  console.log('  Email:', account.user.email)
  console.log('  Password hash:', account.password)
  console.log('  Hash length:', account.password?.length)
  console.log('  Hash starts with:', account.password?.substring(0, 10))
  
  // Check hash format
  if (account.password?.startsWith('$2b$')) {
    console.log('  Format: bcrypt ($2b$)')
  } else if (account.password?.startsWith('$2a$')) {
    console.log('  Format: bcrypt ($2a$)')
  } else if (account.password?.startsWith('$argon2')) {
    console.log('  Format: argon2')
  } else {
    console.log('  Format: Unknown')
  }
  
  // Better Auth might use a different library
  console.log('\n💡 Better Auth might be using a different password hashing library.')
  console.log('   Let\'s check if it uses its own hash function...')
}

testPasswordFormat()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
