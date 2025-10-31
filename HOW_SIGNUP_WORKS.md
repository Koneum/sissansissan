# 🔐 Comment fonctionne l'Inscription (Sign Up)

## Vue d'ensemble

Quand un utilisateur s'inscrit via la page `/signin`, **Better Auth** gère automatiquement la création du User et de l'Account avec la bonne relation.

## Flux Complet

### 1. L'utilisateur remplit le formulaire

```tsx
// Page: /signin (mode signup)
<form onSubmit={handleSubmit}>
  <input name="name" value="John Doe" />
  <input name="email" value="john@example.com" />
  <input name="password" value="password123" />
  <button>S'inscrire</button>
</form>
```

### 2. Le code appelle Better Auth

```tsx
// lib/auth-context.tsx
const handleSignUp = async (email: string, password: string, name: string) => {
  const result = await betterAuthSignUp.email({
    email,
    password,
    name,
  })
  return result
}
```

### 3. Better Auth crée automatiquement

```typescript
// Better Auth fait ceci en interne:

// 1. Hash le mot de passe
const hashedPassword = await bcrypt.hash(password, 10)

// 2. Crée le User
const user = await prisma.user.create({
  data: {
    id: crypto.randomUUID(),
    email: "john@example.com",
    name: "John Doe",
    role: "CUSTOMER", // Valeur par défaut
    emailVerified: null,
    password: hashedPassword, // Stocké dans User aussi
  }
})

// 3. Crée l'Account lié
const account = await prisma.account.create({
  data: {
    id: crypto.randomUUID(),
    accountId: "john@example.com",
    providerId: "credential",
    userId: user.id, // ← Lien vers le User
    password: hashedPassword, // Hash bcrypt
  }
})

// 4. Crée la Session
const session = await prisma.session.create({
  data: {
    id: crypto.randomUUID(),
    token: generateToken(),
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
  }
})

// 5. Retourne la session
return { user, session }
```

### 4. L'utilisateur est connecté

```tsx
// Le context met à jour l'état
const { user, session } = result
// user = { id, email, name, role }
// session = { token, expiresAt }

// L'utilisateur est maintenant connecté!
```

## Structure de la Base de Données Après Signup

```sql
-- Table User
INSERT INTO "user" (id, email, name, password, role, emailVerified)
VALUES (
  'clx123...',
  'john@example.com',
  'John Doe',
  '$2b$10$...',  -- Hash bcrypt
  'CUSTOMER',
  NULL
);

-- Table Account (créé automatiquement par Better Auth)
INSERT INTO "account" (id, accountId, providerId, userId, password)
VALUES (
  'clx456...',
  'john@example.com',
  'credential',
  'clx123...',  -- userId lié au User
  '$2b$10$...'  -- Même hash bcrypt
);

-- Table Session
INSERT INTO "session" (id, token, userId, expiresAt)
VALUES (
  'clx789...',
  'eyJhbGc...',
  'clx123...',  -- userId lié au User
  '2025-11-06 23:50:00'
);
```

## Relation User ↔ Account

```prisma
model User {
  id       String    @id @default(cuid())
  email    String    @unique
  name     String
  password String
  role     UserRole  @default(CUSTOMER)
  
  accounts Account[] // ← Un User peut avoir plusieurs Accounts
  sessions Session[]
}

model Account {
  id         String  @id
  accountId  String  // Email de l'utilisateur
  providerId String  // "credential" pour email/password
  userId     String  // ← Clé étrangère vers User
  password   String? // Hash bcrypt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Pourquoi User ET Account ont un password?

- **User.password**: Pour compatibilité avec le schéma existant
- **Account.password**: Utilisé par Better Auth pour l'authentification
- Les deux contiennent le **même hash bcrypt**

## Comment Better Auth vérifie le Login

```typescript
// Lors du login avec email + password

// 1. Trouve le User
const user = await prisma.user.findUnique({
  where: { email: "john@example.com" }
})

// 2. Trouve l'Account lié
const account = await prisma.account.findFirst({
  where: {
    userId: user.id,
    providerId: "credential"
  }
})

// 3. Vérifie le mot de passe
const isValid = await bcrypt.compare(password, account.password)

// 4. Si valide, crée une Session
if (isValid) {
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: generateToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })
  return { user, session }
}
```

## Exemple Complet: Créer un Utilisateur Manuellement

Si vous voulez créer un utilisateur dans le seed (comme nous l'avons fait):

```typescript
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createUser(email: string, password: string, name: string, role: 'ADMIN' | 'CUSTOMER') {
  // 1. Hash le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // 2. Crée User + Account en une transaction
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      emailVerified: new Date(),
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: email,
          providerId: 'credential',
          password: hashedPassword
        }
      }
    }
  })
  
  return user
}

// Utilisation
await createUser('admin@sissan.com', 'admin123', 'Admin User', 'ADMIN')
```

## Points Importants

1. **Better Auth gère tout automatiquement** lors du signup via l'interface
2. **La relation User ↔ Account est automatique** grâce à Prisma
3. **Le mot de passe est toujours haché** avec bcrypt (10 rounds)
4. **Le providerId "credential"** indique une authentification par email/password
5. **Le accountId est l'email** de l'utilisateur
6. **La Session est créée automatiquement** après signup/login réussi

## Tester le Signup

1. Aller sur `http://localhost:3000/signin`
2. Cliquer sur "Pas de compte? S'inscrire"
3. Remplir:
   - Nom: Test User
   - Email: test@example.com
   - Password: test123
4. Cliquer sur "S'inscrire"
5. ✅ Vous êtes connecté!

Vérifier dans la base:
```bash
npx tsx scripts/check-accounts.ts
```

Vous verrez:
```
User: test@example.com
  - Accounts: 1
    - Provider: credential, AccountId: test@example.com
```

## Conclusion

Le système d'inscription fonctionne parfaitement avec:
- ✅ Création automatique de User + Account
- ✅ Relation correcte entre les tables
- ✅ Mots de passe hachés avec bcrypt
- ✅ Sessions sécurisées
- ✅ Rôles gérés (ADMIN/CUSTOMER)

**Vous n'avez rien à faire de spécial - Better Auth s'occupe de tout!**
