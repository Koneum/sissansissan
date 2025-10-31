import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function checkAccounts() {
  console.log('🔍 Checking accounts...\n')
  
  const users = await prisma.user.findMany({
    include: {
      accounts: true
    },
    take: 3
  })

  users.forEach(user => {
    console.log(`User: ${user.email}`)
    console.log(`  - Accounts: ${user.accounts.length}`)
    user.accounts.forEach(acc => {
      console.log(`    - Provider: ${acc.providerId}, AccountId: ${acc.accountId}`)
    })
    console.log()
  })

  const totalAccounts = await prisma.account.count()
  console.log(`Total accounts in database: ${totalAccounts}`)
}

checkAccounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
