/**
 * Script to test admin login credentials
 * This verifies the password hash is correct
 */

import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Better Auth uses bcrypt
  return await bcrypt.compare(password, hash)
}

async function testLogin() {
  console.log('🔐 Testing admin login...\n')

  try {
    // Get admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@sissan.com' },
      include: {
        accounts: true
      }
    })

    if (!user) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('✅ User found:')
    console.log(`   - Email: ${user.email}`)
    console.log(`   - Name: ${user.name}`)
    console.log(`   - Role: ${user.role}`)
    console.log(`   - Email Verified: ${user.emailVerified}`)

    // Get account
    const account = user.accounts.find(acc => acc.providerId === 'credential')

    if (!account) {
      console.log('\n❌ No credential account found')
      return
    }

    console.log('\n✅ Account found:')
    console.log(`   - Provider: ${account.providerId}`)
    console.log(`   - Has Password: ${!!account.password}`)

    if (!account.password) {
      console.log('\n❌ No password hash in account')
      return
    }

    // Test password
    const isValid = await verifyPassword('admin123', account.password)

    if (isValid) {
      console.log('\n✅ Password verification: SUCCESS')
      console.log('\n🎉 Admin login should work!')
      console.log('\nCredentials:')
      console.log('  Email: admin@sissan.com')
      console.log('  Password: admin123')
    } else {
      console.log('\n❌ Password verification: FAILED')
      console.log('The password hash is incorrect')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testLogin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
