import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function testAuth() {
  console.log('🔍 Testing authentication setup...\n')
  
  // Check user
  const user = await prisma.user.findUnique({
    where: { email: 'admin@sissan.com' },
    include: { accounts: true }
  })

  if (!user) {
    console.log('❌ User not found')
    return
  }

  console.log('✅ User found:', user.email)
  console.log('   Role:', user.role)
  console.log('   Email verified:', user.emailVerified)
  console.log('   Accounts:', user.accounts.length)

  if (user.accounts.length > 0) {
    const account = user.accounts[0]
    console.log('\n📋 Account details:')
    console.log('   Provider:', account.providerId)
    console.log('   AccountId:', account.accountId)
    console.log('   Has password:', !!account.password)
    
    if (account.password) {
      // Test password verification
      const testPassword = 'admin123'
      const isValid = await bcrypt.compare(testPassword, account.password)
      console.log(`\n🔐 Password test (${testPassword}):`, isValid ? '✅ Valid' : '❌ Invalid')
    }
  }

  // Check all accounts
  const allAccounts = await prisma.account.findMany({
    where: { providerId: 'credential' }
  })
  console.log(`\n📊 Total credential accounts: ${allAccounts.length}`)
}

testAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
