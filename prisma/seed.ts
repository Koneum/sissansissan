import { PrismaClient } from '../app/generated/prisma'
import { auth } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Categories
  console.log('📦 Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'laptops-pc' },
      update: {},
      create: {
        name: 'Laptops & PC',
        slug: 'laptops-pc',
        description: 'Ordinateurs portables et de bureau haute performance',
        image: '/modern-laptop-workspace.png'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mobiles-tablets' },
      update: {},
      create: {
        name: 'Téléphones & Tablettes',
        slug: 'mobiles-tablets',
        description: 'Smartphones et tablettes dernière génération',
        image: '/modern-smartphone.png'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'games-videos' },
      update: {},
      create: {
        name: 'Jeux & Vidéo',
        slug: 'games-videos',
        description: 'Consoles de jeux et équipements vidéo',
        image: '/classic-gamepad.png'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessoires',
        slug: 'accessories',
        description: 'Accessoires informatiques et électroniques',
        image: '/accessories.png'
      }
    })
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // 2. Create admin user
  console.log('👤 Creating admin user...')
  console.log('📧 Email: admin@sissan.com')
  console.log('🔑 Password: admin123')
  
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@sissan.com' }
  })
  
  if (!adminUser) {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: 'Admin Sissan',
        email: 'admin@sissan.com',
        password: 'admin123'
      }
    })
    
    if (!signUpResult) {
      throw new Error('Failed to create admin user')
    }
    
    adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sissan.com' }
    })
    
    if (!adminUser) {
      throw new Error('Admin user not found after creation')
    }
    
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { 
        role: 'ADMIN',
        emailVerified: true
      }
    })
    
    console.log('✅ Admin user created')
  } else {
    console.log('ℹ️  Admin user already exists')
  }

  // 3. Create manager user
  console.log('� Creating manager user...')
  console.log('📧 Email: manag@sissan.net')
  console.log('🔑 Password: ManagSissan@2025')
  
  let managerUser = await prisma.user.findUnique({
    where: { email: 'manag@sissan.net' }
  })
  
  if (!managerUser) {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: 'Manager Sissan',
        email: 'manag@sissan.net',
        password: 'ManagSissan@2025'
      }
    })
    
    if (!signUpResult) {
      throw new Error('Failed to create manager user')
    }
    
    managerUser = await prisma.user.findUnique({
      where: { email: 'manag@sissan.net' }
    })
    
    if (!managerUser) {
      throw new Error('Manager user not found after creation')
    }
    
    managerUser = await prisma.user.update({
      where: { id: managerUser.id },
      data: { 
        role: 'MANAGER',
        emailVerified: true
      }
    })
    
    console.log('✅ Manager user created')
  } else {
    console.log('ℹ️  Manager user already exists')
  }

  // 4. Create one example product
  console.log('🛍️ Creating example product...')
  
  const existingProduct = await prisma.product.findUnique({
    where: { slug: 'exemple-produit' }
  })

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        name: 'Exemple Produit',
        slug: 'exemple-produit',
        description: 'Ceci est un exemple de produit. Vous pouvez le modifier ou le supprimer depuis le panel admin.',
        shortDesc: 'Produit exemple à modifier',
        price: 50000,
        stock: 10,
        thumbnail: '/placeholder-product.png',
        images: [],
        tags: ['exemple'],
        categoryId: categories[0].id,
        isFeatured: false,
        isNew: true,
        isActive: false
      }
    })
    console.log('✅ Example product created')
  } else {
    console.log('ℹ️  Example product already exists')
  }

  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📋 Comptes créés:')
  console.log('   Admin: admin@sissan.com / admin123')
  console.log('   Manager: manag@sissan.net / ManagSissan@2025')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
