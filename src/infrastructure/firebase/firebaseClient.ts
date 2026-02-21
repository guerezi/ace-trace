import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const hasConfig =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.appId);

let appInstance: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let reactNativePersistenceFactory: ((storage: typeof AsyncStorage) => unknown) | null = null;

const getReactNativePersistenceFactory = () => {
  if (reactNativePersistenceFactory) {
    return reactNativePersistenceFactory;
  }

  try {
    const authModule = require("firebase/auth") as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
    };

    reactNativePersistenceFactory = authModule.getReactNativePersistence ?? null;
    return reactNativePersistenceFactory;
  } catch {
    return null;
  }
};

export const isFirebaseConfigured = (): boolean => hasConfig;

const getAppInstance = () => {
  if (!hasConfig) {
    return null;
  }

  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
  }

  return appInstance;
};

export const getFirebaseAuthOrNull = () => {
  const app = getAppInstance();
  if (!app) {
    return null;
  }

  if (authInstance) {
    return authInstance;
  }

  if (Platform.OS === "web") {
    authInstance = getAuth(app);
    return authInstance;
  }

  try {
    const persistenceFactory = getReactNativePersistenceFactory();
    if (!persistenceFactory) {
      authInstance = getAuth(app);
      return authInstance;
    }

    authInstance = initializeAuth(app, {
      persistence: persistenceFactory(AsyncStorage) as never,
    });
    return authInstance;
  } catch {
    authInstance = getAuth(app);
    return authInstance;
  }
};

export const getFirestoreOrNull = () => {
  const app = getAppInstance();
  if (!app) {
    return null;
  }

  return getFirestore(app);
};
