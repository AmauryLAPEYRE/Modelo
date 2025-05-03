import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
let db;
let storage;

// Utilisation d'une IIFE pour initialiser Firebase une seule fois
(() => {
  if (getApps().length === 0) {
    console.log("Initializing Firebase...");
    app = initializeApp(firebaseConfig);
  } else {
    console.log("Firebase already initialized");
    app = getApp();
  }
  
  // Initialiser les services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
})();

export { app, auth, db, storage };