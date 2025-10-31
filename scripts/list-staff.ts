/**
 * Script to list all staff members
 * Usage: npx tsx scripts/list-staff.ts
 */

import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function listStaff() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n👥 Staff Members:\n')
    console.log('═════════════════════════════════════════════════════════════')
    
    if (users.length === 0) {
      console.log('No staff members found.')
      console.log('\nTo create a staff member, use the admin interface:')
      console.log('1. Login as admin')
      console.log('2. Go to Settings → Users')
      console.log('3. Click "Ajouter un Membre"')
    } else {
      users.forEach((user, i) => {
        console.log(`\n${i + 1}. ${user.name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role:  ${user.role}`)
        console.log(`   Permissions: ${user.permissions.length}`)
        console.log(`   Created: ${user.createdAt.toLocaleString()}`)
      })
      
      console.log('\n═════════════════════════════════════════════════════════════')
      console.log(`\nTotal: ${users.length} staff member(s)`)
    }
    
    console.log('\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listStaff()
