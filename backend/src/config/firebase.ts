import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';


dotenv.config();

// Get absolute path to service account file
const serviceAccountPath = path.resolve(
  process.cwd(),
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json'
);

console.log(`📁 Loading Firebase config from: ${serviceAccountPath}`);

// Initialize Firebase Admin SDK
try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('⚠️ Push notifications will be disabled');
  console.log('💡 Make sure firebase-service-account.json exists in project root');
}

export const fcm: admin.messaging.Messaging = admin.messaging();
export default admin;