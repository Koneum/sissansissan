import { PrismaClient } from '../app/generated/prisma'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('🔐 Creating admin account with Better Auth...')
  console.log('ℹ️  Note: Le seed crée déjà l\'admin automatiquement')
  console.log('ℹ️  Ce script est utile uniquement si vous voulez recréer l\'admin manuellement\n')

  try {
    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sissan.com' }
    })

    // Create user if doesn't exist
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@sissan.com',
          role: 'ADMIN',
          emailVerified: true
        }
      })
      console.log('✅ Admin user created')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    // Check if account exists
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: adminUser.id,
        providerId: 'credential'
      }
    })

    if (existingAccount) {
      console.log('ℹ️  Admin account already exists')
      return
    }

    // Hash password
    const hashedPassword = await hash('admin123', 10)

    // Create Better Auth account with password
    await prisma.account.create({
      data: {
        id: `${adminUser.id}_credential`,
        accountId: adminUser.id,
        providerId: 'credential',
        userId: adminUser.id,
        password: hashedPassword
      }
    })

    console.log('✅ Admin account created successfully')
    console.log('📧 Email: admin@sissan.com')
    console.log('🔑 Password: admin123')
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    throw error
  }
}

createAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
