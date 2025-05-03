// src/services/firebase/config.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Modification ici - simplifier les imports
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuration Firebase
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId, 
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId
};

// Fallback pour les valeurs directes
if (!firebaseConfig.apiKey) {
  console.warn('Firebase config not loaded from environment variables, using direct values');
  Object.assign(firebaseConfig, {
    apiKey: "AIzaSyAKf4n5t-TZN89q6mot_OuHb5St39CS4ak",
    authDomain: "modelo-db543.firebaseapp.com",
    projectId: "modelo-db543",
    storageBucket: "modelo-db543.firebasestorage.app",
    messagingSenderId: "922201984357",
    appId: "1:922201984357:web:df9b8037efa993c1c2258c",
    measurementId: "G-8MX2WLDD2W"
  });
}

// Initialiser Firebase - MODIFIÉ
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Simplifier l'initialisation pour éviter l'erreur
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };