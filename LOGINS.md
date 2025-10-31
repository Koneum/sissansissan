# 🔐 Informations de Connexion - Sissan E-commerce

## ⚠️ IMPORTANT: Better Auth utilise SCRYPT!

Better Auth utilise **scrypt** pour hasher les mots de passe (pas bcrypt). Les comptes doivent être créés via l'API Better Auth.

### 📝 Procédure de Configuration (3 étapes)

1. **Réinitialiser la base**:
   ```bash
   npx prisma migrate reset --force
   ```

2. **Démarrer le serveur** (dans un terminal):
   ```bash
   npm run dev
   ```

3. **Créer les comptes** (dans un autre terminal):
   ```bash
   npx tsx scripts/create-auth-accounts.ts
   ```

4. **Se connecter**:
   - Aller sur `http://localhost:3000/signin`
   - Utiliser les identifiants ci-dessous
   - ✅ Les comptes sont maintenant créés avec le bon hachage (scrypt)

## Comptes de Test

### 👨‍💼 Compte Administrateur
- **Email**: `admin@sissan.com`
- **Mot de passe**: `admin123`
- **Rôle**: ADMIN
- **Accès**: Dashboard admin complet
- **Statut**: ✅ Prêt à l'emploi

### 👤 Comptes Clients (10 comptes disponibles)
- **Email**: `customer1@example.com` à `customer10@example.com`
- **Mot de passe**: `customer123` (même mot de passe pour tous)
- **Rôle**: CUSTOMER
- **Accès**: Interface client standard
- **Statut**: ✅ Prêts à l'emploi

## Exemples de Connexion

### Connexion Admin
```
1. Aller sur /signin
2. Email: admin@sissan.com
3. Mot de passe: admin123
4. Cliquer sur "Se connecter"
```

### Connexion Client
```
1. Aller sur /signin
2. Email: customer1@example.com
3. Mot de passe: customer123
4. Cliquer sur "Se connecter"
```

### Boutons de Connexion Rapide
Sur la page `/signin`, vous pouvez aussi utiliser:
- **"Quick User Login"**: Connexion automatique en tant que customer1
- **"Quick Admin Login"**: Connexion automatique en tant qu'admin

## Configuration de l'Authentification

L'application utilise **Better Auth** avec les fonctionnalités suivantes:
- ✅ Authentification par email/mot de passe
- ✅ Sessions sécurisées (7 jours)
- ✅ Hachage bcrypt des mots de passe
- ✅ Support des rôles (ADMIN, CUSTOMER, SUPER_ADMIN)
- ✅ Inscription de nouveaux utilisateurs

## Seed de la Base de Données

Pour réinitialiser et créer les comptes de test:

```bash
npx prisma migrate reset --force
```

Cela va:
- ✅ Réinitialiser la base de données
- ✅ Appliquer les migrations
- ✅ Créer 11 comptes (1 admin + 10 clients)
- ✅ Créer les enregistrements Account avec mots de passe hachés
- ✅ Créer les catégories et produits de démonstration

## Comment fonctionne le Signup

Quand un nouvel utilisateur s'inscrit via `/signin`:

1. **Better-auth** crée automatiquement:
   - Un enregistrement `User` avec les informations de base
   - Un enregistrement `Account` avec le mot de passe haché (bcrypt)
   - Une `Session` pour l'utilisateur

2. **La relation User ↔ Account** est automatique:
   ```typescript
   User {
     id: "user-id"
     email: "email@example.com"
     accounts: [
       {
         id: "account-id"
         accountId: "email@example.com"
         providerId: "credential"
         password: "$2b$10$..." // Hash bcrypt
         userId: "user-id" // Lié au User
       }
     ]
   }
   ```

3. **Le rôle par défaut** est `CUSTOMER`, mais peut être changé manuellement dans la base

## Notes de Sécurité

⚠️ **IMPORTANT**: Ces mots de passe sont pour le développement uniquement. 
En production, assurez-vous de:
1. Changer tous les mots de passe par défaut
2. Utiliser des mots de passe forts
3. Activer la vérification par email
4. Implémenter l'authentification à deux facteurs si nécessaire
5. Ne jamais commiter les vrais mots de passe dans le code
