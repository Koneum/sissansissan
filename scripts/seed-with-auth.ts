/**
 * Alternative seed script that uses Better Auth API to create users
 * This ensures passwords are hashed correctly by Better Auth
 */

async function seedWithAuth() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  console.log('🌱 Seeding users with Better Auth API...\n')
  
  // Create admin user
  console.log('👤 Creating admin user...')
  try {
    const adminResponse = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sissan.com',
        password: 'admin123',
        name: 'Admin User',
      }),
    })
    
    if (adminResponse.ok) {
      console.log('✅ Admin user created')
    } else {
      const error = await adminResponse.text()
      console.log('⚠️ Admin user might already exist:', error)
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  }
  
  // Create customer users
  console.log('\n👥 Creating customer users...')
  for (let i = 1; i <= 10; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `customer${i}@example.com`,
          password: 'customer123',
          name: `Customer ${i}`,
        }),
      })
      
      if (response.ok) {
        console.log(`✅ Created customer${i}@example.com`)
      } else {
        console.log(`⚠️ customer${i}@example.com might already exist`)
      }
    } catch (error) {
      console.error(`❌ Error creating customer${i}:`, error)
    }
  }
  
  console.log('\n🎉 Seed with auth completed!')
  console.log('\nNote: You need to manually update the role to ADMIN for admin@sissan.com in the database')
}

seedWithAuth().catch(console.error)
