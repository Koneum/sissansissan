// Better Auth uses its own password hashing
// Let's test what format it expects

import bcrypt from 'bcrypt'

async function testHashing() {
  const password = 'admin123'
  
  // Standard bcrypt hash
  const bcryptHash = await bcrypt.hash(password, 10)
  console.log('Standard bcrypt hash:', bcryptHash)
  console.log('Starts with $2b$10$:', bcryptHash.startsWith('$2b$10$'))
  
  // Test verification
  const isValid = await bcrypt.compare(password, bcryptHash)
  console.log('Bcrypt verification:', isValid)
  
  // Better Auth might use a different format
  // Let's check what we have in the database
  console.log('\nCurrent hash in seed:')
  console.log('$2b$10$nImgQKAlqcsfsmvPVFrP5.QqO8dAHHxsNMn9X1ISZpRqBWhmIntty')
  
  const testHash = '$2b$10$nImgQKAlqcsfsmvPVFrP5.QqO8dAHHxsNMn9X1ISZpRqBWhmIntty'
  const testValid = await bcrypt.compare('admin123', testHash)
  console.log('Test hash verification:', testValid)
}

testHashing().catch(console.error)
