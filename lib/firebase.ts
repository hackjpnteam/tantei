import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

// Firebase configuration from environment variables
const firebaseConfig = process.env.FIREBASE_API_KEY ? {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
} : null;

// Initialize Firebase only if configuration is available
if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    // Check if Firebase has already been initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);
    } else {
      app = getApps()[0];
      auth = getAuth(app);
      firestore = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.info('Firebase configuration not found. Firebase features will be disabled.');
}

// Export functions to get Firebase services
export const getFirebaseApp = (): FirebaseApp | null => {
  if (!app && firebaseConfig) {
    console.warn('Firebase not initialized despite having configuration');
  }
  return app;
};

export const getFirebaseAuth = (): Auth | null => {
  if (!auth && firebaseConfig) {
    console.warn('Firebase Auth not initialized');
  }
  return auth;
};

export const getFirebaseFirestore = (): Firestore | null => {
  if (!firestore && firebaseConfig) {
    console.warn('Firestore not initialized');
  }
  return firestore;
};

// Utility function to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return app !== null && auth !== null;
};

// Helper function to verify user authentication
export const verifyFirebaseToken = async (idToken: string) => {
  const authInstance = getFirebaseAuth();
  
  if (!authInstance) {
    console.error('Firebase Auth is not configured');
    return null;
  }

  try {
    // Note: Token verification should be done on the server side
    // This is just a placeholder for the client-side structure
    // Actual verification would require Firebase Admin SDK
    console.warn('Token verification requires Firebase Admin SDK on the server');
    return null;
  } catch (error) {
    console.error('Failed to verify Firebase token:', error);
    return null;
  }
};

export default {
  app,
  auth,
  firestore,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  isFirebaseConfigured
};