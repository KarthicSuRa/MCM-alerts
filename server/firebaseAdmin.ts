import admin from "firebase-admin";

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const messaging = admin.messaging();

export interface NotificationPayload {
  title: string;
  body: string;
  type: string;
}

export async function sendNotificationToToken(
  token: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        type: payload.type,
        timestamp: Date.now().toString(),
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
        },
      },
    };

    await messaging.send(message);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

export async function sendNotificationToMultipleTokens(
  tokens: string[],
  payload: NotificationPayload
): Promise<void> {
  if (tokens.length === 0) return;

  const message = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      type: payload.type,
      timestamp: Date.now().toString(),
    },
    webpush: {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
      },
    },
  };

  try {
    await messaging.sendEachForMulticast(message);
  } catch (error) {
    console.error('Error sending notifications to multiple tokens:', error);
  }
}
