# 🚀 Script de Configuration des Permissions

## Étapes d'Installation

### 1. Initialiser les Permissions dans la Base de Données

```bash
npx tsx prisma/seed-permissions.ts
```

**Résultat attendu:**
```
🌱 Seeding permissions...
✅ Permissions seeded successfully!
📊 Total permissions: 42
```

### 2. Vérifier les Permissions dans la Base de Données

Connectez-vous à votre base de données et vérifiez:

```sql
SELECT category, COUNT(*) as count 
FROM permission 
GROUP BY category;
```

**Résultat attendu:**
```
category        | count
----------------|------
dashboard       | 1
products        | 4
orders          | 4
customers       | 4
categories      | 4
reviews         | 4
coupons         | 4
settings        | 2
staff           | 4
customization   | 2
```

### 3. Créer un Utilisateur Test

#### Option A: Via l'Interface Admin

1. Connectez-vous en tant qu'ADMIN
2. Allez dans **Settings > Gestion du Personnel**
3. Cliquez sur **Ajouter un Membre**
4. Remplissez:
   - Nom: `Test Personnel`
   - Email: `test@sissan.com`
   - Mot de passe: `test123`
   - Rôle: `PERSONNEL`
5. Onglet **Permissions**:
   - Products: Cocher "Voir"
   - Orders: Cocher "Voir" et "Créer"
6. Cliquez sur **Créer l'Utilisateur**

#### Option B: Via SQL Direct

```sql
-- Créer l'utilisateur
INSERT INTO "user" (id, name, email, password, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  'test_user_id',
  'Test Personnel',
  'test@sissan.com',
  '$2a$10$...', -- Hash du mot de passe
  'PERSONNEL',
  false,
  NOW(),
  NOW()
);

-- Assigner des permissions
-- Récupérer l'ID de la permission products.view
INSERT INTO user_permission ("userId", "permissionId", "canView", "canCreate", "canEdit", "canDelete")
SELECT 
  'test_user_id',
  id,
  true,
  false,
  false,
  false
FROM permission
WHERE name = 'products.view';
```

### 4. Tester le Système

#### Test 1: Connexion avec Utilisateur Limité

1. Déconnectez-vous
2. Connectez-vous avec `test@sissan.com` / `test123`
3. Vérifiez:
   - ✅ Vous pouvez voir la page Produits
   - ❌ Le bouton "Ajouter un Produit" est désactivé
   - ❌ Les boutons "Modifier" et "Supprimer" sont désactivés
   - ℹ️ Un tooltip s'affiche au survol des boutons désactivés

#### Test 2: Ajouter une Permission

1. Reconnectez-vous en tant qu'ADMIN
2. Allez dans **Settings > Gestion du Personnel**
3. Modifiez l'utilisateur `test@sissan.com`
4. Dans l'onglet Permissions, cochez "Créer" pour Products
5. Sauvegardez
6. Reconnectez-vous avec `test@sissan.com`
7. Vérifiez:
   - ✅ Le bouton "Ajouter un Produit" est maintenant actif
   - ✅ Vous pouvez accéder à `/admin/products/add`

#### Test 3: Accès Refusé

1. Connecté en tant que `test@sissan.com`
2. Essayez d'accéder à `/admin/settings/users`
3. Vérifiez:
   - 🚫 Message "Accès Refusé" s'affiche
   - 🔙 Bouton "Retour au Dashboard" disponible

### 5. Protéger les Pages Restantes

Suivez le guide dans `IMPLEMENTATION_GUIDE.md` pour protéger:

- [ ] `/app/admin/dashboard/page.tsx`
- [ ] `/app/admin/orders/page.tsx`
- [ ] `/app/admin/customers/page.tsx`
- [ ] `/app/admin/categories/page.tsx`
- [ ] `/app/admin/reviews/page.tsx`
- [ ] `/app/admin/coupons/page.tsx`
- [ ] `/app/admin/settings/page.tsx`
- [ ] `/app/admin/customization/*`

## 🧪 Tests de Validation

### Scénario 1: Personnel de Vente

**Configuration:**
```
Rôle: PERSONNEL
Permissions:
  - products: view, create
  - orders: view, create, edit
  - customers: view
```

**Tests:**
```
✅ Peut voir les produits
✅ Peut ajouter des produits
❌ Ne peut pas modifier/supprimer des produits
✅ Peut voir et gérer les commandes
✅ Peut voir les clients
❌ Ne peut pas modifier les clients
❌ Ne peut pas accéder aux paramètres
❌ Ne peut pas gérer le personnel
```

### Scénario 2: Manager

**Configuration:**
```
Rôle: MANAGER
Permissions:
  - products: all
  - orders: all
  - customers: all
  - reviews: view, edit
  - settings: view
```

**Tests:**
```
✅ Accès complet aux produits
✅ Accès complet aux commandes
✅ Accès complet aux clients
✅ Peut modérer les avis
✅ Peut voir les paramètres
❌ Ne peut pas modifier les paramètres
❌ Ne peut pas gérer le personnel
```

### Scénario 3: Admin

**Configuration:**
```
Rôle: ADMIN
Permissions: Automatiques (toutes)
```

**Tests:**
```
✅ Accès complet à tout
✅ Tous les boutons actifs
✅ Toutes les pages accessibles
```

## 📊 Vérification de l'État du Système

### Vérifier les Permissions d'un Utilisateur

```sql
SELECT 
  u.name,
  u.email,
  u.role,
  p.category,
  p.description,
  up."canView",
  up."canCreate",
  up."canEdit",
  up."canDelete"
FROM "user" u
JOIN user_permission up ON u.id = up."userId"
JOIN permission p ON up."permissionId" = p.id
WHERE u.email = 'test@sissan.com'
ORDER BY p.category;
```

### Compter les Utilisateurs par Rôle

```sql
SELECT role, COUNT(*) as count
FROM "user"
WHERE role IN ('PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN')
GROUP BY role;
```

### Lister les Permissions Non Assignées

```sql
SELECT p.category, p.name, p.description
FROM permission p
WHERE NOT EXISTS (
  SELECT 1 FROM user_permission up WHERE up."permissionId" = p.id
);
```

## 🔧 Commandes Utiles

### Réinitialiser les Permissions

```bash
# Supprimer toutes les permissions
npx prisma db execute --sql "DELETE FROM user_permission; DELETE FROM permission;"

# Re-seeder
npx tsx prisma/seed-permissions.ts
```

### Donner Toutes les Permissions à un Utilisateur

```sql
-- Remplacer 'USER_ID' par l'ID de l'utilisateur
INSERT INTO user_permission ("userId", "permissionId", "canView", "canCreate", "canEdit", "canDelete")
SELECT 
  'USER_ID',
  id,
  true,
  true,
  true,
  true
FROM permission
ON CONFLICT DO NOTHING;
```

### Retirer Toutes les Permissions d'un Utilisateur

```sql
DELETE FROM user_permission WHERE "userId" = 'USER_ID';
```

## ✅ Checklist de Validation

Avant de considérer l'installation complète:

- [ ] Permissions seedées (42 permissions créées)
- [ ] Au moins 1 utilisateur PERSONNEL créé
- [ ] Au moins 1 utilisateur MANAGER créé
- [ ] Tests effectués avec utilisateur limité
- [ ] Boutons se désactivent correctement
- [ ] Tooltips s'affichent sur boutons désactivés
- [ ] Pages protégées affichent message d'erreur
- [ ] Navigation filtrée selon permissions
- [ ] Documentation lue

## 🎯 Prochaines Étapes

1. **Protéger toutes les pages admin** (voir `IMPLEMENTATION_GUIDE.md`)
2. **Ajouter vérifications serveur** dans les API routes
3. **Former les administrateurs** sur la gestion des permissions
4. **Documenter les rôles** spécifiques à votre organisation
5. **Créer des profils de permissions** prédéfinis

---

**Bonne configuration ! 🚀**
