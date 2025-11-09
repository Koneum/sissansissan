import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function checkHash() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@sissan.com' },
    include: {
      accounts: true
    }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  console.log('User:', user.email)
  console.log('Accounts:', user.accounts.length)
  
  const account = user.accounts.find(a => a.providerId === 'credential')
  if (account) {
    console.log('Account ID:', account.id)
    console.log('Provider:', account.providerId)
    console.log('Password hash:', account.password)
    console.log('Hash length:', account.password?.length)
    console.log('Hash starts with:', account.password?.substring(0, 10))
  }
}

checkHash()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
