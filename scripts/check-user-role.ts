/**
 * Script to check user role in database
 * Usage: npx tsx scripts/check-user-role.ts [email]
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function checkUserRole() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('❌ Please provide an email address')
    console.log('Usage: npx tsx scripts/check-user-role.ts [email]')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      process.exit(1)
    }

    console.log('\n✅ User found!\n')
    console.log('📋 User Details:')
    console.log('─────────────────────────────────────')
    console.log(`ID:           ${user.id}`)
    console.log(`Name:         ${user.name}`)
    console.log(`Email:        ${user.email}`)
    console.log(`Role:         ${user.role}`)
    console.log(`Email Verified: ${user.emailVerified}`)
    console.log(`Created:      ${user.createdAt}`)
    console.log(`Updated:      ${user.updatedAt}`)
    
    console.log('\n🔐 Accounts:')
    console.log('─────────────────────────────────────')
    if (user.accounts.length > 0) {
      user.accounts.forEach((account, i) => {
        console.log(`Account ${i + 1}:`)
        console.log(`  Provider: ${account.providerId}`)
        console.log(`  Account ID: ${account.accountId}`)
      })
    } else {
      console.log('No accounts found')
    }

    console.log('\n🎯 Permissions:')
    console.log('─────────────────────────────────────')
    if (user.permissions.length > 0) {
      user.permissions.forEach((perm) => {
        const actions = []
        if (perm.canView) actions.push('View')
        if (perm.canCreate) actions.push('Create')
        if (perm.canEdit) actions.push('Edit')
        if (perm.canDelete) actions.push('Delete')
        
        console.log(`${perm.permission.category}: ${actions.join(', ')}`)
      })
    } else {
      console.log('No permissions assigned')
    }

    console.log('\n─────────────────────────────────────\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserRole()
