# Configuration des Notifications - Sissan

> **Dernière mise à jour**: Implémentation complète (Backend + Mobile)

## 📧 Emails (Brevo)

### Configuration
Les emails sont déjà configurés via Brevo dans `lib/email.ts`.

**Variable d'environnement requise dans `.env`:**
```env
BREVO_API_KEY=votre-api-key-brevo
```

### Emails disponibles

| Fonction | Déclencheur |
|----------|-------------|
| `sendWelcomeEmail` | Inscription utilisateur |
| `sendVerificationCodeEmail` | Demande de code de vérification |
| `sendPasswordResetEmail` | Réinitialisation mot de passe |
| `sendOrderConfirmationEmail` | Création de commande |
| `sendOrderStatusEmail` | Changement de statut commande |
| `sendPaymentConfirmationEmail` | Paiement confirmé |

---

## 📱 SMS (Brevo)

### Configuration
Le service SMS utilise la même clé API Brevo dans `lib/sms.ts`.

**La même variable d'environnement est utilisée:**
```env
BREVO_API_KEY=votre-api-key-brevo
```

### SMS disponibles

| Fonction | Déclencheur |
|----------|-------------|
| `sendOrderConfirmationSMS` | Création de commande (guest checkout) |
| `sendOrderStatusSMS` | Changement de statut (PROCESSING, SHIPPED, DELIVERED, CANCELLED) |
| `sendPaymentConfirmationSMS` | Paiement confirmé |
| `sendVerificationCodeSMS` | Code OTP |
| `sendWelcomeSMS` | Inscription |

### Format des numéros
Les numéros sont automatiquement formatés au format international.
- Code pays par défaut: `225` (Côte d'Ivoire)
- Formats acceptés: `+225 01 23 45 67`, `00225 01234567`, `01 23 45 67`

### Coûts SMS Brevo
- Voir les tarifs sur: https://www.brevo.com/pricing/
- Les SMS transactionnels sont facturés par crédit

---

## 🔔 Notifications Push (Expo) - Mobile App

### Étape 1: Configuration côté mobile (sissan-mobile)

1. **Installer expo-notifications:**
```bash
npx expo install expo-notifications expo-device expo-constants
```

2. **Configurer app.json:**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#F97316"
        }
      ]
    ]
  }
}
```

3. **Créer un hook pour les notifications** (`hooks/usePushNotifications.ts`):
```typescript
import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Gérer le clic sur la notification
      const data = response.notification.request.content.data;
      // Navigation vers la commande, etc.
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F97316',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission notifications refusée');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  }

  return token;
}
```

4. **Enregistrer le token sur le backend:**
```typescript
// Dans votre auth store ou au login
const registerPushToken = async (expoPushToken: string) => {
  await fetch(`${API_URL}/api/user/push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ pushToken: expoPushToken }),
  });
};
```

### Étape 2: Configuration côté backend (sissansissan)

1. **Ajouter le champ pushToken au modèle User** (`prisma/schema.prisma`):
```prisma
model User {
  // ... autres champs
  pushToken     String?  // Expo push token
}
```

2. **Créer l'API pour enregistrer le token** (`app/api/user/push-token/route.ts`):
```typescript
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { pushToken } = await request.json()
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushToken }
  })

  return NextResponse.json({ success: true })
}
```

3. **Créer le service push** (`lib/push-notifications.ts`):
```typescript
interface PushNotificationData {
  to: string // Expo push token
  title: string
  body: string
  data?: Record<string, any>
}

export async function sendPushNotification({ to, title, body, data }: PushNotificationData) {
  const message = {
    to,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// Templates de notifications
export async function sendOrderPushNotification(
  pushToken: string,
  orderNumber: string,
  status: string,
  orderId: string
) {
  const messages: Record<string, { title: string; body: string }> = {
    PROCESSING: {
      title: '🔄 Commande en préparation',
      body: `Votre commande ${orderNumber} est en cours de préparation.`
    },
    SHIPPED: {
      title: '🚚 Commande expédiée',
      body: `Votre commande ${orderNumber} est en route !`
    },
    DELIVERED: {
      title: '✅ Commande livrée',
      body: `Votre commande ${orderNumber} a été livrée.`
    },
    CANCELLED: {
      title: '❌ Commande annulée',
      body: `Votre commande ${orderNumber} a été annulée.`
    }
  };

  const msg = messages[status];
  if (msg && pushToken) {
    await sendPushNotification({
      to: pushToken,
      title: msg.title,
      body: msg.body,
      data: { orderId, orderNumber, type: 'order_status' }
    });
  }
}
```

---

## 🔄 Intégration actuelle

### Création de commande
- ✅ Email de confirmation envoyé
- ✅ SMS de confirmation envoyé (si numéro disponible)
- ⏳ Push notification (à implémenter)

### Changement de statut
- ✅ Email envoyé pour tous les statuts
- ✅ SMS envoyé pour: PROCESSING, SHIPPED, DELIVERED, CANCELLED
- ⏳ Push notification (à implémenter)

### Statuts de commande

| Statut | Email | SMS | Push |
|--------|-------|-----|------|
| PENDING | ⏳ | ❌ | ❌ |
| PROCESSING | ✅ | ✅ | ⏳ |
| SHIPPED | ✅ | ✅ | ⏳ |
| DELIVERED | ✅ | ✅ | ⏳ |
| CANCELLED | ✅ | ✅ | ⏳ |
| REFUNDED | ✅ | ❌ | ⏳ |

---

## 📋 TODO

1. [ ] Ajouter le champ `pushToken` au modèle User (Prisma)
2. [ ] Créer l'API `/api/user/push-token`
3. [ ] Créer `lib/push-notifications.ts`
4. [ ] Intégrer les push dans les API orders
5. [ ] Configurer expo-notifications dans l'app mobile
6. [ ] Tester l'envoi de SMS en production
