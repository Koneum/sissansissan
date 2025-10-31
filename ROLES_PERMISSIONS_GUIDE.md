# 🔐 Guide Complet - Rôles et Permissions

## ✅ Système Implémenté

Un système complet de gestion des rôles et permissions granulaires a été mis en place.

## 📋 Rôles Disponibles

### 1. CUSTOMER (Client)
- **Accès**: Front-end uniquement
- **Redirection**: `/account`
- **Permissions**: Aucune permission admin

### 2. PERSONNEL
- **Accès**: Dashboard admin
- **Redirection**: `/admin` → `/admin/dashboard`
- **Permissions**: Définies par l'administrateur
- **Cas d'usage**: Employés avec accès limité

### 3. MANAGER
- **Accès**: Dashboard admin
- **Redirection**: `/admin` → `/admin/dashboard`
- **Permissions**: Définies par l'administrateur
- **Cas d'usage**: Managers avec plus de responsabilités

### 4. ADMIN (Administrateur)
- **Accès**: Dashboard admin complet
- **Redirection**: `/admin` → `/admin/dashboard`
- **Permissions**: Toutes les permissions
- **Cas d'usage**: Administrateurs du système

### 5. SUPER_ADMIN
- **Accès**: Dashboard admin complet
- **Redirection**: `/admin` → `/admin/dashboard`
- **Permissions**: Toutes les permissions + gestion des admins
- **Cas d'usage**: Super administrateur

## 🎯 Système de Permissions

### Structure des Permissions

Chaque permission a 4 niveaux d'accès:
- ✅ **Voir** (`canView`): Consulter les données
- ➕ **Créer** (`canCreate`): Ajouter de nouvelles entrées
- ✏️ **Modifier** (`canEdit`): Éditer les entrées existantes
- 🗑️ **Supprimer** (`canDelete`): Supprimer des entrées

### Catégories de Permissions

| Catégorie | Permissions | Description |
|-----------|-------------|-------------|
| **dashboard** | view, stats | Accès au tableau de bord |
| **products** | view, create, edit, delete | Gestion des produits |
| **orders** | view, create, edit, delete | Gestion des commandes |
| **customers** | view, create, edit, delete | Gestion des clients |
| **categories** | view, create, edit, delete | Gestion des catégories |
| **reviews** | view, edit, delete | Gestion des avis |
| **coupons** | view, create, edit, delete | Gestion des coupons |
| **settings** | view, edit | Paramètres du système |
| **staff** | view, create, edit, delete, permissions | Gestion du personnel |

## 📊 Base de Données

### Modèles Prisma

```prisma
enum UserRole {
  CUSTOMER
  PERSONNEL
  MANAGER
  ADMIN
  SUPER_ADMIN
}

model User {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  role        UserRole @default(CUSTOMER)
  permissions UserPermission[]
  // ...
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  category    String
  userPermissions UserPermission[]
}

model UserPermission {
  id           String   @id @default(cuid())
  userId       String
  permissionId String
  canView      Boolean  @default(true)
  canCreate    Boolean  @default(false)
  canEdit      Boolean  @default(false)
  canDelete    Boolean  @default(false)
  
  user       User       @relation(...)
  permission Permission @relation(...)
  
  @@unique([userId, permissionId])
}
```

## 🚀 Utilisation

### 1. Initialiser les Permissions

```bash
# Créer toutes les permissions par défaut
npx tsx scripts/seed-permissions.ts
```

Résultat: 32 permissions créées dans 9 catégories.

### 2. Créer un Membre du Personnel

#### Via l'Interface Admin

1. Se connecter en tant qu'ADMIN
2. Aller sur **Settings** → **Users**
3. Cliquer sur **"Ajouter un Membre"**
4. Remplir le formulaire:

**Onglet Informations:**
- Nom Complet: `Jean Dupont`
- Email: `jean.dupont@sissan.com`
- Mot de Passe: `password123` (min 6 caractères)
- Rôle: `PERSONNEL` / `MANAGER` / `ADMIN`

**Onglet Permissions:**
- Sélectionner les catégories accessibles
- Pour chaque catégorie, cocher:
  - ✅ Voir
  - ➕ Créer
  - ✏️ Modifier
  - 🗑️ Supprimer

5. Cliquer sur **"Créer l'Utilisateur"**

#### Exemple de Configuration Manager

**Manager de Produits:**
- **Rôle**: MANAGER
- **Permissions**:
  - Dashboard: Voir ✅, Stats ✅
  - Products: Voir ✅, Créer ✅, Modifier ✅, Supprimer ✅
  - Categories: Voir ✅, Créer ✅, Modifier ✅
  - Orders: Voir ✅, Modifier ✅

**Personnel de Support:**
- **Rôle**: PERSONNEL
- **Permissions**:
  - Dashboard: Voir ✅
  - Orders: Voir ✅, Modifier ✅
  - Customers: Voir ✅
  - Reviews: Voir ✅, Modifier ✅

### 3. Connexion avec un Compte Personnel/Manager

```bash
# 1. Aller sur /signin
# 2. Entrer les credentials:
Email: jean.dupont@sissan.com
Password: password123

# 3. Redirection automatique
→ /admin → /admin/dashboard ✅
```

### 4. Modifier les Permissions

1. Aller sur **Settings** → **Users**
2. Cliquer sur **"Modifier"** pour un utilisateur
3. Onglet **Permissions**:
   - Ajouter/retirer des permissions
   - Modifier les niveaux d'accès
4. Cliquer sur **"Enregistrer"**

## 🔄 Flux Complet

### Création d'un Manager

```
1. Admin se connecte
   └── /signin → /admin/dashboard

2. Admin va dans Settings → Users
   └── /admin/settings/users

3. Admin clique "Ajouter un Membre"
   └── Dialog s'ouvre

4. Admin remplit le formulaire
   ├── Nom: Manager Produits
   ├── Email: manager.produits@sissan.com
   ├── Password: secure123
   └── Rôle: MANAGER

5. Admin configure les permissions
   ├── Dashboard: Voir ✅
   ├── Products: Voir ✅, Créer ✅, Modifier ✅, Supprimer ✅
   └── Categories: Voir ✅, Créer ✅

6. Admin clique "Créer l'Utilisateur"
   └── POST /api/admin/staff
       ├── Better Auth crée le compte
       ├── Rôle défini à MANAGER
       └── Permissions créées

7. Manager peut maintenant se connecter
   └── /signin → /admin/dashboard
```

### Connexion Manager

```
1. Manager entre credentials
   └── POST /api/auth/sign-in/email

2. Better Auth authentifie
   └── Session créée avec role: MANAGER

3. Redirection basée sur le rôle
   └── MANAGER → /admin

4. AdminLayout vérifie l'accès
   └── hasAdminAccess = true (MANAGER inclus)

5. Dashboard affiché
   └── UI adaptée selon les permissions
```

## 📁 Structure des Fichiers

### Pages

```
app/admin/settings/users/page.tsx
├── Liste des membres du personnel
├── Création de nouveaux membres
├── Modification des membres
├── Gestion des permissions
└── Suppression de membres
```

### API Routes

```
app/api/admin/
├── permissions/route.ts
│   └── GET: Liste toutes les permissions
├── staff/route.ts
│   ├── GET: Liste tous les membres
│   └── POST: Créer un nouveau membre
└── staff/[id]/route.ts
    ├── PUT: Modifier un membre
    └── DELETE: Supprimer un membre
```

### Scripts

```
scripts/
├── seed-permissions.ts
│   └── Initialise les 32 permissions par défaut
└── set-admin-role.ts
    └── Change le rôle d'un utilisateur
```

## 🎨 Interface Utilisateur

### Page Gestion du Personnel

**Statistiques:**
- Total Personnel
- Nombre de Managers
- Nombre de Personnel
- Nombre d'Admins

**Liste:**
- Tableau avec tous les membres
- Filtrage par nom/email/rôle
- Badges colorés par rôle
- Affichage des permissions
- Actions: Modifier / Supprimer

**Dialog Création/Modification:**
- **Onglet Informations**:
  - Formulaire de base
  - Sélection du rôle
  - Mot de passe (avec toggle visibilité)
  
- **Onglet Permissions**:
  - Groupées par catégorie
  - Checkboxes pour chaque niveau
  - Interface intuitive

## 🔐 Sécurité

### Vérifications

1. **Authentification**: Better Auth vérifie l'identité
2. **Autorisation**: AdminLayout vérifie le rôle
3. **API Protection**: Toutes les routes vérifient la session
4. **Permissions**: UI adaptée selon les permissions

### Mots de Passe

- **Minimum**: 6 caractères
- **Hachage**: scrypt (Better Auth)
- **Stockage**: Dans la table `Account`
- **Modification**: Via l'interface admin

## 📊 Exemples de Configuration

### Configuration 1: Manager de Boutique

```json
{
  "role": "MANAGER",
  "permissions": [
    { "category": "dashboard", "canView": true },
    { "category": "products", "canView": true, "canCreate": true, "canEdit": true },
    { "category": "orders", "canView": true, "canEdit": true },
    { "category": "customers", "canView": true },
    { "category": "reviews", "canView": true, "canEdit": true }
  ]
}
```

### Configuration 2: Personnel de Support

```json
{
  "role": "PERSONNEL",
  "permissions": [
    { "category": "dashboard", "canView": true },
    { "category": "orders", "canView": true, "canEdit": true },
    { "category": "customers", "canView": true },
    { "category": "reviews", "canView": true }
  ]
}
```

### Configuration 3: Manager Complet

```json
{
  "role": "MANAGER",
  "permissions": [
    { "category": "dashboard", "canView": true, "stats": true },
    { "category": "products", "canView": true, "canCreate": true, "canEdit": true, "canDelete": true },
    { "category": "orders", "canView": true, "canCreate": true, "canEdit": true },
    { "category": "customers", "canView": true, "canEdit": true },
    { "category": "categories", "canView": true, "canCreate": true, "canEdit": true },
    { "category": "coupons", "canView": true, "canCreate": true, "canEdit": true }
  ]
}
```

## ✅ Checklist de Vérification

- [x] Schéma Prisma mis à jour avec nouveaux rôles
- [x] Modèles Permission et UserPermission créés
- [x] Script de seed des permissions
- [x] Page de gestion du personnel
- [x] API routes pour CRUD personnel
- [x] Système de permissions granulaires
- [x] Interface de création avec onglets
- [x] Interface de modification
- [x] Redirection basée sur les rôles
- [x] Protection des routes admin
- [x] Gestion des mots de passe
- [x] Badges colorés par rôle
- [x] Statistiques du personnel

## 🎉 Résumé

**Système Complet de Gestion des Rôles et Permissions:**

✅ **5 Rôles**: CUSTOMER, PERSONNEL, MANAGER, ADMIN, SUPER_ADMIN
✅ **32 Permissions**: 9 catégories avec 4 niveaux d'accès
✅ **Interface Intuitive**: Création et modification faciles
✅ **Sécurité**: Authentification et autorisation robustes
✅ **Flexibilité**: Permissions personnalisables par utilisateur
✅ **Redirection Intelligente**: Basée sur le rôle
✅ **API Complète**: CRUD pour la gestion du personnel

**Le système est prêt à l'emploi!** 🚀
