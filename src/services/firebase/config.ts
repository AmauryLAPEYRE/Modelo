import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Changez cette ligne
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Configuration Firebase basée sur les variables d'environnement
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId
};

// Initialiser Firebase uniquement s'il n'est pas déjà initialisé
let app;
let auth;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Simplifiez l'initialisation de l'authentification
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
}

// Obtenir les références des services Firebase
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };