import { PrismaClient } from '@prisma/client'

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
        description: 'High-performance laptops and desktop computers',
        image: '/modern-laptop-workspace.png'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mobiles-tablets' },
      update: {},
      create: {
        name: 'Mobile & Tablets',
        slug: 'mobiles-tablets',
        description: 'Latest smartphones and tablets',
        image: '/modern-smartphone.png'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'games-videos' },
      update: {},
      create: {
        name: 'Games & Videos',
        slug: 'games-videos',
        description: 'Gaming consoles and video equipment',
        image: '/classic-gamepad.png'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'health-sports' },
      update: {},
      create: {
        name: 'Health & Sports',
        slug: 'health-sports',
        description: 'Fitness equipment and health accessories',
        image: '/diverse-fitness-group.png'
      }
    })
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // 2. Create Admin User
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sissan.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@sissan.com',
      password: '$2a$10$YourHashedPasswordHere', // In production, hash this properly
      role: 'ADMIN',
      phone: '+1234567890'
    }
  })

  // 3. Create Test Customers
  console.log('👥 Creating customers...')
  const customers = []
  for (let i = 1; i <= 10; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        password: '$2a$10$YourHashedPasswordHere',
        role: 'CUSTOMER',
        phone: `+123456789${i}`
      }
    })
    customers.push(customer)
  }

  console.log(`✅ Created ${customers.length} customers`)

  // 4. Create Products
  console.log('🛍️ Creating products...')
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 16 Pro - Premium Tech',
        slug: 'iphone-16-pro',
        description: 'Experience the future with A18 Pro chip, titanium design, and advanced camera system',
        price: 600000,
        discountPrice: 540000,
        salePercentage: 10,
        stock: 50,
        thumbnail: '/iphone-16-pro-blue.jpg',
        images: ['/iphone-16-pro-blue.jpg'],
        tags: ['smartphone', 'apple', 'premium'],
        categoryId: categories[1].id, // Mobile & Tablets
        isFeatured: true,
        isNew: false
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro M4',
        slug: 'macbook-pro-m4',
        description: '14-core CPU delivers exceptional performance for professionals and creators',
        price: 1500000,
        discountPrice: 1380000,
        salePercentage: 8,
        stock: 30,
        thumbnail: '/macbook-pro-laptop.png',
        images: ['/macbook-pro-laptop.png'],
        tags: ['laptop', 'apple', 'pro'],
        categoryId: categories[0].id, // Laptops & PC
        isFeatured: true,
        isNew: false
      }
    }),
    prisma.product.create({
      data: {
        name: 'iPad Air M2 Chip',
        slug: 'ipad-air-m2',
        description: 'Powerful performance with M2 chip and stunning Liquid Retina display',
        price: 360000,
        discountPrice: 330000,
        salePercentage: 8,
        stock: 40,
        thumbnail: '/silver-ipad-on-wooden-desk.png',
        images: ['/silver-ipad-on-wooden-desk.png'],
        tags: ['tablet', 'apple'],
        categoryId: categories[1].id,
        isFeatured: true,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Gaming Console Pro',
        slug: 'gaming-console-pro',
        description: 'Next-gen gaming console with 4K support and ultra-fast loading',
        price: 300000,
        discountPrice: 270000,
        salePercentage: 10,
        stock: 25,
        thumbnail: '/classic-gamepad.png',
        images: ['/classic-gamepad.png'],
        tags: ['gaming', 'console'],
        categoryId: categories[2].id,
        isFeatured: false,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Fitness Tracker Watch',
        slug: 'fitness-tracker-watch',
        description: 'Track your health and fitness goals with advanced sensors',
        price: 150000,
        discountPrice: 138000,
        salePercentage: 8,
        stock: 60,
        thumbnail: '/apple-watch-lifestyle.png',
        images: ['/apple-watch-lifestyle.png'],
        tags: ['watch', 'fitness'],
        categoryId: categories[3].id,
        isFeatured: false,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Air M4',
        slug: 'macbook-air-m4',
        description: 'Lightweight and powerful laptop perfect for everyday use',
        price: 780000,
        stock: 35,
        thumbnail: '/macbook-laptop-silver.jpg',
        images: ['/macbook-laptop-silver.jpg'],
        tags: ['laptop', 'apple'],
        categoryId: categories[0].id,
        isFeatured: true,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart TV 43"',
        slug: 'smart-tv-43',
        description: '4K Ultra HD Smart TV with HDR and built-in streaming apps',
        price: 270000,
        discountPrice: 240000,
        salePercentage: 11,
        stock: 20,
        thumbnail: '/tv-screen-display.jpg',
        images: ['/tv-screen-display.jpg'],
        tags: ['tv', 'smart', '4k'],
        categoryId: categories[2].id,
        isFeatured: true,
        isNew: false
      }
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Gaming Mouse',
        slug: 'wireless-gaming-mouse',
        description: 'High precision wireless mouse with customizable RGB',
        price: 48000,
        stock: 100,
        thumbnail: '/wireless-mouse-black.jpg',
        images: ['/wireless-mouse-black.jpg'],
        tags: ['mouse', 'gaming'],
        categoryId: categories[2].id,
        isFeatured: false,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Apple Watch Ultra',
        slug: 'apple-watch-ultra',
        description: 'Rugged and capable smartwatch for extreme adventures',
        price: 480000,
        discountPrice: 450000,
        salePercentage: 6,
        stock: 25,
        thumbnail: '/apple-watch-orange-band.jpg',
        images: ['/apple-watch-orange-band.jpg'],
        tags: ['watch', 'apple', 'premium'],
        categoryId: categories[3].id,
        isFeatured: true,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Bluetooth Speaker',
        slug: 'bluetooth-speaker',
        description: 'Portable speaker with amazing sound quality and 20h battery',
        price: 78000,
        stock: 50,
        thumbnail: '/speaker-audio-device.jpg',
        images: ['/speaker-audio-device.jpg'],
        tags: ['audio', 'speaker'],
        categoryId: categories[2].id,
        isFeatured: false,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'Running Shoes Pro',
        slug: 'running-shoes-pro',
        description: 'Professional running shoes with advanced cushioning',
        price: 90000,
        discountPrice: 72000,
        salePercentage: 20,
        stock: 80,
        thumbnail: '/running-shoes-sports.jpg',
        images: ['/running-shoes-sports.jpg'],
        tags: ['shoes', 'sports'],
        categoryId: categories[3].id,
        isFeatured: false,
        isNew: true
      }
    }),
    prisma.product.create({
      data: {
        name: 'iPhone 14 Pro',
        slug: 'iphone-14-pro',
        description: 'Previous generation iPhone with great performance',
        price: 480000,
        discountPrice: 420000,
        salePercentage: 13,
        stock: 45,
        thumbnail: '/iphone-blue-smartphone.jpg',
        images: ['/iphone-blue-smartphone.jpg'],
        tags: ['smartphone', 'apple'],
        categoryId: categories[1].id,
        isFeatured: true,
        isNew: false
      }
    })
  ])

  console.log(`✅ Created ${products.length} products`)

  // 5. Create Orders (with different statuses and dates)
  console.log('📦 Creating orders...')
  const orderStatuses: Array<'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'> = 
    ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  
  const orders = []
  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length]
    const randomProduct = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.floor(Math.random() * 3) + 1
    const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
    const paymentStatus = orderStatus === 'DELIVERED' || orderStatus === 'SHIPPED' ? 'PAID' : 'PENDING'
    
    // Create orders from different months
    const daysAgo = Math.floor(Math.random() * 180) // Random day in last 6 months
    const orderDate = new Date()
    orderDate.setDate(orderDate.getDate() - daysAgo)

    const subtotal = randomProduct.price * quantity
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(3000 + i).padStart(4, '0')}`,
        userId: customer.id,
        status: orderStatus,
        paymentStatus,
        subtotal,
        total: subtotal * 1.1, // Adding 10% for shipping and taxes
        shippingAddress: {
          firstName: customer.name.split(' ')[0],
          lastName: customer.name.split(' ')[1] || '',
          address: '123 Main St',
          city: 'New York',
          country: 'USA',
          zipCode: '10001',
          phone: customer.phone || ''
        },
        createdAt: orderDate,
        items: {
          create: {
            productId: randomProduct.id,
            quantity,
            price: randomProduct.price
          }
        }
      }
    })
    orders.push(order)
  }

  console.log(`✅ Created ${orders.length} orders`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
