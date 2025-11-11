# Configuration des Variables d'Environnement

## Variables Requises

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

### Base de Données
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Application
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STORE_NAME="Sissan"
```

### Brevo (Email Service)
```env
BREVO_API_KEY="votre_clé_api_brevo"
BREVO_SENDER_EMAIL="noreply@sissan-sissan.net"
```

### Better Auth
```env
BETTER_AUTH_SECRET="votre_secret_auth_généré"
```

## Configuration Brevo

1. Créez un compte sur [Brevo](https://www.brevo.com/)
2. Allez dans **Settings** > **SMTP & API** > **API Keys**
3. Créez une nouvelle clé API
4. Copiez la clé et ajoutez-la dans `.env` comme `BREVO_API_KEY`
5. Configurez l'email expéditeur vérifié dans `BREVO_SENDER_EMAIL`

## Génération du Secret Auth

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Migration de la Base de Données

Après avoir configuré `DATABASE_URL`, exécutez :

```bash
npx prisma db push
```

## Vérification

Pour vérifier que tout fonctionne :

1. Démarrez le serveur : `npm run dev`
2. Testez le reset password : allez sur `/forgot-password`
3. Vérifiez les logs de la console pour le token de développement
4. En production, l'email sera envoyé via Brevo

## Notes

- En développement, le token de réinitialisation est affiché dans la console
- En production, l'email est envoyé automatiquement via Brevo
- Le token expire après 1 heure pour des raisons de sécurité
