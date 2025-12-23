/**
 * Script pour générer le JWT Apple Sign-In
 * 
 * Usage:
 * 1. Placez votre fichier .p8 dans le même dossier ou spécifiez le chemin
 * 2. Modifiez les variables ci-dessous avec vos informations
 * 3. Exécutez: node scripts/generate-apple-secret.js
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// =====================================================
// MODIFIEZ CES VALEURS AVEC VOS INFORMATIONS APPLE
// =====================================================

// Chemin vers votre fichier .p8 téléchargé depuis Apple Developer
const PRIVATE_KEY_PATH = './AuthKey_Y3F243ZZ44.p8';

// Team ID - Trouvable dans: Account > Membership > Team ID
const TEAM_ID = '74SXLY3FJU';

// Key ID - L'ID de la clé que vous avez créée (visible dans Keys)
const KEY_ID = 'Y3F243ZZ44';

// Client ID - L'identifier de votre Service ID
const CLIENT_ID = 'com.global.auth';

// =====================================================
// NE PAS MODIFIER EN DESSOUS
// =====================================================

try {
  // Vérifier que le fichier existe
  const keyPath = path.resolve(__dirname, PRIVATE_KEY_PATH);
  
  if (!fs.existsSync(keyPath)) {
    console.error('❌ Erreur: Fichier .p8 non trouvé à:', keyPath);
    console.log('\n📝 Instructions:');
    console.log('1. Téléchargez votre clé .p8 depuis Apple Developer > Keys');
    console.log('2. Placez le fichier dans le dossier scripts/');
    console.log('3. Mettez à jour PRIVATE_KEY_PATH avec le nom du fichier');
    process.exit(1);
  }

  // Vérifier les variables
  if (TEAM_ID === 'VOTRE_TEAM_ID' || KEY_ID === 'VOTRE_KEY_ID') {
    console.error('❌ Erreur: Veuillez configurer TEAM_ID et KEY_ID');
    console.log('\n📝 Où trouver ces valeurs:');
    console.log('- TEAM_ID: Apple Developer > Account > Membership');
    console.log('- KEY_ID: Apple Developer > Keys > Votre clé Sign in with Apple');
    process.exit(1);
  }

  // Lire la clé privée
  const privateKey = fs.readFileSync(keyPath, 'utf8');

  // Générer le JWT
  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d', // 6 mois (maximum autorisé par Apple)
    audience: 'https://appleid.apple.com',
    issuer: TEAM_ID,
    subject: CLIENT_ID,
    keyid: KEY_ID
  });

  console.log('\n✅ JWT Apple généré avec succès!\n');
  console.log('='.repeat(60));
  console.log('APPLE_CLIENT_SECRET=');
  console.log(token);
  console.log('='.repeat(60));
  
  console.log('\n📋 Copiez cette valeur dans votre fichier .env');
  console.log('\n⚠️  Ce token expire dans 180 jours (le maximum autorisé).');
  console.log('    Vous devrez le régénérer avant expiration.');
  
  // Calculer la date d'expiration
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 180);
  console.log(`    Date d'expiration: ${expirationDate.toLocaleDateString('fr-FR')}`);

} catch (error) {
  console.error('❌ Erreur lors de la génération du JWT:', error.message);
  
  if (error.message.includes('jsonwebtoken')) {
    console.log('\n📦 Installez jsonwebtoken:');
    console.log('   npm install jsonwebtoken');
  }
}
