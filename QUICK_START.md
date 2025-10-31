# 🚀 Guide de Démarrage Rapide - Authentification

## Étape 1: Réinitialiser la Base de Données

```bash
npx prisma migrate reset --force
```

Cela va:
- ✅ Réinitialiser la base de données
- ✅ Appliquer les migrations
- ✅ Exécuter le seed (créer catégories, produits, utilisateurs de base)

## Étape 2: Démarrer le Serveur

```bash
npm run dev
```

## Étape 3: Créer le Compte Admin

1. Ouvrir le navigateur: `http://localhost:3000/signin`
2. Cliquer sur **"Pas de compte? S'inscrire"**
3. Remplir le formulaire:
   - **Nom complet**: `Admin User`
   - **Email**: `admin@sissan.com`
   - **Mot de passe**: `admin123`
4. Cliquer sur **"S'inscrire"**
5. ✅ Vous êtes maintenant connecté en tant qu'admin!

## Étape 4: Tester la Connexion

1. Se déconnecter (si connecté)
2. Retourner sur `/signin`
3. Entrer:
   - **Email**: `admin@sissan.com`
   - **Mot de passe**: `admin123`
4. Cliquer sur **"Se connecter"**
5. ✅ Connexion réussie!

## Comptes Disponibles

### Admin
- Email: `admin@sissan.com`
- Mot de passe: `admin123` (à créer via inscription)
- Rôle: ADMIN

### Clients (10 comptes)
- Email: `customer1@example.com` à `customer10@example.com`
- Mot de passe: `customer123` (à créer via inscription)
- Rôle: CUSTOMER

## Boutons de Test Rapide

Sur la page `/signin`, vous trouverez des boutons de connexion rapide:
- **Quick User Login**: Connexion rapide en tant que client
- **Quick Admin Login**: Connexion rapide en tant qu'admin

⚠️ **Note**: Ces boutons ne fonctionneront qu'après avoir créé les comptes via l'inscription!

## Dépannage

### Erreur: "Invalid password hash"
- **Cause**: Tentative de connexion avec un compte qui n'a pas été créé via l'inscription
- **Solution**: Créer le compte via la page d'inscription (`/signin` → "S'inscrire")

### Erreur: "Credential account not found"
- **Cause**: Le compte n'existe pas dans la table Account
- **Solution**: S'inscrire d'abord, puis se connecter

### Erreur: "Email already exists"
- **Cause**: L'email existe déjà dans la base
- **Solution**: Utiliser la connexion au lieu de l'inscription

## Architecture de l'Authentification

```
Better Auth
├── User (table principale)
│   ├── email
│   ├── name
│   ├── role (ADMIN/CUSTOMER)
│   └── emailVerified
├── Account (credentials)
│   ├── providerId: "credential"
│   ├── accountId: email
│   └── password (hash bcrypt par better-auth)
└── Session
    ├── token
    └── expiresAt
```

## Commandes Utiles

```bash
# Réinitialiser la base
npx prisma migrate reset --force

# Seed uniquement
npx prisma db seed

# Vérifier les comptes
npx tsx scripts/check-accounts.ts

# Tester l'authentification
npx tsx scripts/test-auth.ts
```

## Prochaines Étapes

1. ✅ Créer le compte admin
2. ✅ Tester la connexion/déconnexion
3. ✅ Créer quelques comptes clients
4. 🔄 Implémenter la protection des routes
5. 🔄 Ajouter le middleware d'authentification
6. 🔄 Créer le dashboard admin
7. 🔄 Implémenter la réinitialisation de mot de passe
