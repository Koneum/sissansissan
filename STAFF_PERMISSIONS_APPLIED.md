# Permissions Staff Appliquees

## test@sissan.com (MANAGER)

### Permissions Configurees

**Staff (Personnel)**:
- ✅ Voir (canView = true)
- ✅ Creer (canCreate = true)
- ❌ Modifier (canEdit = false)
- ❌ Supprimer (canDelete = false)

**Autres permissions**:
- Dashboard: Voir
- Clients: Full access
- Commandes: Full access
- Categories: Full access
- Produits: Full access

## Modifications Appliquees

### 1. Permissions Mises a Jour
**Script**: `scripts/update-test-permissions.ts`

### 2. Boutons Proteges
**Fichier**: `app/admin/settings/users/page.tsx`

**Boutons remplaces par PermissionButton**:
- Bouton "Ajouter un Membre" (action: create)
- Bouton "Modifier" (action: edit)
- Bouton "Supprimer" (action: delete)

## Comportement Attendu

### Page /admin/settings/users

**Pour test@sissan.com (MANAGER)**:

**Bouton "Ajouter un Membre"**:
- ✅ ACTIF (a permission create)
- Peut creer de nouveaux membres du personnel

**Bouton "Modifier" (icone crayon)**:
- ❌ DESACTIVE (pas de permission edit)
- Tooltip: "Vous n'avez pas la permission de modifier le personnel"
- Opacity 50%, cursor not-allowed

**Bouton "Supprimer" (icone poubelle)**:
- ❌ DESACTIVE (pas de permission delete)
- Tooltip: "Vous n'avez pas la permission de supprimer le personnel"
- Opacity 50%, cursor not-allowed

**Liste des utilisateurs**:
- ✅ VISIBLE (a permission view)
- Peut voir tous les membres du personnel

### Pour perso@sissan.com (PERSONNEL)

**Bouton "Ajouter un Membre"**:
- ❌ DESACTIVE (pas de permission create)

**Boutons "Modifier" et "Supprimer"**:
- ❌ DESACTIVES (pas de permissions)

**Liste**:
- ✅ VISIBLE (a permission view)

### Pour ADMIN et SUPER_ADMIN

**Tous les boutons**:
- ✅ ACTIFS (ont toutes les permissions automatiquement)

## Test

### 1. Se connecter avec test@sissan.com

```
Email: test@sissan.com
Password: [votre-mot-de-passe]
```

### 2. Aller sur /admin/settings/users

### 3. Verifier

**Bouton "Ajouter un Membre"**:
- Doit etre ACTIF
- Cliquer dessus ouvre le dialogue de creation

**Boutons "Modifier" dans le tableau**:
- Doivent etre DESACTIVES (grises)
- Survol affiche tooltip: "Vous n'avez pas la permission de modifier le personnel"

**Boutons "Supprimer" dans le tableau**:
- Doivent etre DESACTIVES (grises)
- Survol affiche tooltip: "Vous n'avez pas la permission de supprimer le personnel"

### 4. Tester la creation

- Cliquer "Ajouter un Membre"
- Remplir le formulaire
- Creer l'utilisateur
- Doit fonctionner ✅

### 5. Tester la modification

- Essayer de cliquer sur un bouton "Modifier"
- Ne doit rien faire (bouton desactive)
- Tooltip s'affiche au survol

## Verification Rapide

```bash
# Verifier les permissions
npx tsx scripts/check-user-role.ts test@sissan.com
```

Resultat attendu:
```
Permissions:
- dashboard: View
- staff: View, Create
- customers: View, Create, Edit, Delete
- orders: View, Create, Edit, Delete
- categories: View, Create, Edit, Delete
- products: View, Create, Edit, Delete
```

## Cas d'Usage

### Scenario 1: Manager peut recruter
- test@sissan.com peut creer de nouveaux membres
- Mais ne peut pas les modifier ou supprimer
- Seul ADMIN peut modifier/supprimer

### Scenario 2: Personnel peut consulter
- perso@sissan.com peut voir la liste du personnel
- Mais ne peut rien faire d'autre
- Utile pour connaitre l'equipe

### Scenario 3: Admin a tout
- admin@sissan.com peut tout faire
- Creer, modifier, supprimer
- Gestion complete

## Notes Importantes

- Les boutons desactives ont opacity 50%
- Le curseur devient "not-allowed" au survol
- Un tooltip explicatif s'affiche
- Les permissions sont verifiees cote client ET serveur
- ADMIN et SUPER_ADMIN ont toutes les permissions automatiquement

## Prochaines Etapes

Appliquer le meme systeme aux autres pages:
1. /admin/products - Boutons Creer/Modifier/Supprimer
2. /admin/categories - Boutons Creer/Modifier/Supprimer
3. /admin/orders - Boutons Creer/Modifier/Supprimer
4. /admin/customers - Boutons Creer/Modifier/Supprimer
