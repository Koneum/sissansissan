# 🧪 Test de Connexion Manager

## 📋 Informations du Compte Test

**Email**: `test@sissan.com`
**Rôle**: `MANAGER`
**Permissions**: 
- Products: View, Create, Edit, Delete
- Categories: View, Create, Edit, Delete
- Customers: View
- Orders: View
- Staff: View

## 🔍 Diagnostic Effectué

✅ Le compte existe dans la base de données
✅ Le rôle est bien défini à `MANAGER`
✅ Les permissions sont assignées
✅ Le contexte d'authentification supporte le rôle MANAGER
✅ La redirection est configurée pour MANAGER

## 🐛 Problème Possible

Better Auth pourrait ne pas inclure le champ `role` dans la session par défaut.

## ✅ Solution de Test

### Méthode 1: Test Console du Navigateur

1. **Ouvrez la page de connexion**: `http://localhost:3000/signin`

2. **Ouvrez la console du navigateur** (F12)

3. **Connectez-vous** avec:
   - Email: `test@sissan.com`
   - Password: [votre mot de passe]

4. **Après connexion, dans la console, tapez**:
   ```javascript
   fetch('/api/auth/get-session')
     .then(r => r.json())
     .then(data => console.log('Session:', data))
   ```

5. **Vérifiez la sortie**:
   - ✅ Si `data.user.role = "MANAGER"` → Le rôle est bien retourné
   - ❌ Si `data.user.role` est undefined → Better Auth ne retourne pas le rôle

### Méthode 2: Vérification Directe

1. **Connectez-vous** avec `test@sissan.com`

2. **Observez la redirection**:
   - ✅ Si redirigé vers `/admin` → Tout fonctionne
   - ❌ Si redirigé vers `/account` → Le rôle n'est pas récupéré

3. **Si redirigé vers `/account`**:
   - Ouvrez la console (F12)
   - Tapez:
     ```javascript
     fetch('/api/auth/get-session')
       .then(r => r.json())
       .then(data => {
         console.log('User:', data.user)
         console.log('Role:', data.user?.role)
       })
     ```

## 🔧 Solutions Possibles

### Solution A: Forcer le Rechargement de Session

Après connexion, ajoutez un rechargement:

```typescript
// Dans signin/page.tsx après signIn
const result = await signIn(email, password)
if (!result.error) {
  // Forcer le rechargement de la page pour récupérer la nouvelle session
  window.location.href = '/admin'
}
```

### Solution B: Utiliser l'API Better Auth Directement

```typescript
// Au lieu de fetch('/api/auth/get-session')
import { auth } from '@/lib/auth'

const session = await auth.api.getSession({ headers: request.headers })
console.log('Role:', session.user.role)
```

### Solution C: Vérifier le Cookie

1. Ouvrez DevTools → Application → Cookies
2. Cherchez le cookie `sissan.session_token` ou similaire
3. Décodez le JWT sur https://jwt.io
4. Vérifiez si `role` est dans le payload

## 🚀 Test Rapide

### Script de Test Automatique

Créez un fichier `test-session.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Session</title>
</head>
<body>
  <h1>Test Session Manager</h1>
  <button onclick="testSession()">Tester la Session</button>
  <pre id="result"></pre>

  <script>
    async function testSession() {
      try {
        const response = await fetch('http://localhost:3000/api/auth/get-session')
        const data = await response.json()
        
        document.getElementById('result').textContent = JSON.stringify(data, null, 2)
        
        if (data.user?.role === 'MANAGER') {
          alert('✅ Rôle MANAGER détecté!')
        } else {
          alert('❌ Rôle non détecté: ' + (data.user?.role || 'undefined'))
        }
      } catch (error) {
        document.getElementById('result').textContent = 'Erreur: ' + error.message
      }
    }
  </script>
</body>
</html>
```

## 📊 Résultats Attendus

### Si Tout Fonctionne

```json
{
  "user": {
    "id": "bx2HwpGhGDF30DSs7f235olqAZ5vLa3m",
    "email": "test@sissan.com",
    "name": "test",
    "role": "MANAGER"  // ✅ Présent
  },
  "session": { ... }
}
```

### Si Problème

```json
{
  "user": {
    "id": "bx2HwpGhGDF30DSs7f235olqAZ5vLa3m",
    "email": "test@sissan.com",
    "name": "test"
    // ❌ role manquant
  },
  "session": { ... }
}
```

## 🔄 Prochaines Étapes

1. **Testez la connexion** avec `test@sissan.com`
2. **Vérifiez la console** pour voir les logs
3. **Partagez le résultat** de `fetch('/api/auth/get-session')`
4. **Si le rôle est undefined**, nous devrons modifier la configuration Better Auth

## 💡 Alternative Immédiate

En attendant de résoudre le problème de session, vous pouvez utiliser le script pour changer le rôle d'un utilisateur existant:

```bash
# Changer votre compte admin en MANAGER pour tester
npx tsx scripts/set-admin-role.ts admin@sissan.com MANAGER

# Puis reconnecter avec admin@sissan.com
# Devrait rediriger vers /admin
```

## 📝 Informations à Collecter

Pour diagnostiquer, j'ai besoin de savoir:

1. **Après connexion avec test@sissan.com, êtes-vous redirigé vers**:
   - [ ] `/admin` (✅ Fonctionne)
   - [ ] `/account` (❌ Problème)
   - [ ] Autre: ___________

2. **Dans la console, que retourne**:
   ```javascript
   fetch('/api/auth/get-session').then(r => r.json()).then(console.log)
   ```
   - Copiez le résultat ici

3. **Le serveur affiche-t-il des erreurs** dans le terminal?

Partagez ces informations pour que je puisse vous aider davantage! 🚀
