import bcrypt from 'bcrypt'

async function hashPassword(password: string) {
  // Better-auth uses bcrypt with 10 rounds by default
  const hash = await bcrypt.hash(password, 10)
  console.log(`Password: ${password}`)
  console.log(`Hash: ${hash}`)
  return hash
}

async function main() {
  console.log('Generating password hashes for better-auth...\n')
  
  await hashPassword('admin123')
  console.log()
  await hashPassword('customer123')
}

main().catch(console.error)
