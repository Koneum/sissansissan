# Guide Validation et Messages

## Validation des Formulaires

### Champs Obligatoires

Tous les champs avec * sont obligatoires et valides:

1. **Nom**: Ne peut pas etre vide
2. **Email**: Doit contenir @ et ne pas etre vide
3. **Mot de passe**: Minimum 6 caracteres (creation uniquement)

### Indication Visuelle

- Bordure rouge sur les champs invalides
- Message d'erreur en rouge sous le champ
- Toast d'erreur avec emoji ❌

### Messages d'Erreur

**Creation d'utilisateur:**
- "Le nom est obligatoire"
- "L'email est obligatoire"
- "L'email n'est pas valide"
- "Le mot de passe est obligatoire"
- "Le mot de passe doit contenir au moins 6 caracteres"
- "❌ Cet email existe deja"
- "✅ Utilisateur cree avec succes"

**Modification d'utilisateur:**
- Memes messages que creation
- Mot de passe optionnel (peut rester vide)
- "✅ Utilisateur modifie avec succes"

**Suppression:**
- "✅ Utilisateur supprime avec succes"

**Connexion:**
- "❌ Erreur de connexion - Email ou mot de passe incorrect"
- "✅ Connexion reussie - Bienvenue!"

**Inscription:**
- "❌ Erreur d'inscription - Cet email existe deja"
- "✅ Inscription reussie - Votre compte a ete cree avec succes"

## Comportement

1. Champ devient rouge quand invalide
2. Message d'erreur apparait sous le champ
3. Toast s'affiche en haut
4. Champ redevient normal quand l'utilisateur tape
5. Validation au clic sur bouton Creer/Enregistrer

## Exemple Utilisation

```typescript
// Validation automatique
const validateForm = () => {
  const errors = {
    name: !formData.name.trim(),
    email: !formData.email.trim() || !formData.email.includes('@'),
    password: !formData.password || formData.password.length < 6,
  }
  
  setFormErrors(errors)
  
  if (errors.name) {
    toast.error("Le nom est obligatoire")
    return false
  }
  // ...
  return true
}

// Dans le JSX
<Input
  className={formErrors.name ? "border-red-500" : ""}
  onChange={(e) => {
    setFormData({ ...formData, name: e.target.value })
    setFormErrors({ ...formErrors, name: false })
  }}
/>
{formErrors.name && (
  <p className="text-sm text-red-500">Le nom est obligatoire</p>
)}
```
