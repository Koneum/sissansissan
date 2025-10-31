const bcrypt = require('bcrypt');

async function generateHashes() {
  const passwords = {
    admin: 'admin123',
    customer: 'customer123'
  };

  console.log('Generating password hashes...\n');
  
  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role.toUpperCase()}:`);
    console.log(`  Password: ${password}`);
    console.log(`  Hash: ${hash}\n`);
  }
}

generateHashes().catch(console.error);
