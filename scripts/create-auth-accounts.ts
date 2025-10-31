/**
 * Script to create Account records using Better Auth's password hashing
 * Run this AFTER the seed and AFTER starting the dev server
 * 
 * Usage:
 * 1. npm run dev (in another terminal)
 * 2. npx tsx scripts/create-auth-accounts.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SignUpData {
  email: string
  password: string
  name: string
}

const accounts: SignUpData[] = [
  { email: 'admin@sissan.com', password: 'admin123', name: 'Admin User' },
  { email: 'customer1@example.com', password: 'customer123', name: 'Customer 1' },
  { email: 'customer2@example.com', password: 'customer123', name: 'Customer 2' },
  { email: 'customer3@example.com', password: 'customer123', name: 'Customer 3' },
  { email: 'customer4@example.com', password: 'customer123', name: 'Customer 4' },
  { email: 'customer5@example.com', password: 'customer123', name: 'Customer 5' },
  { email: 'customer6@example.com', password: 'customer123', name: 'Customer 6' },
  { email: 'customer7@example.com', password: 'customer123', name: 'Customer 7' },
  { email: 'customer8@example.com', password: 'customer123', name: 'Customer 8' },
  { email: 'customer9@example.com', password: 'customer123', name: 'Customer 9' },
  { email: 'customer10@example.com', password: 'customer123', name: 'Customer 10' },
]

async function createAccount(data: SignUpData) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      console.log(`✅ ${data.email}`)
      return true
    } else {
      const status = response.status
      const errorText = await response.text()
      
      if (status === 422 && (errorText.includes('already') || errorText.includes('exists') || errorText.includes('unique'))) {
        console.log(`⚠️  ${data.email} (email exists - Account NOT created)`)
        return false
      }
      console.log(`❌ ${data.email} [${status}]: ${errorText}`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${data.email}: ${error}`)
    return false
  }
}

async function main() {
  console.log('🔐 Creating authentication accounts...\n')
  console.log(`Using API: ${BASE_URL}/api/auth/sign-up/email\n`)
  console.log('⚠️  Make sure the dev server is running (npm run dev)\n')

  let successCount = 0
  let failCount = 0

  for (const account of accounts) {
    const success = await createAccount(account)
    if (success) successCount++
    else failCount++
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`\n🎉 Done! You can now login with these accounts.`)
}

main().catch(console.error)
