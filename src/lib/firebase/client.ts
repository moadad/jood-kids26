import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * IMPORTANT (Vercel):
 * Put these env vars in Vercel Project Settings:
 * NEXT_PUBLIC_FIREBASE_API_KEY
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * NEXT_PUBLIC_FIREBASE_APP_ID
 *
 * We intentionally avoid throwing during build/SSR if env is missing,
 * so Next.js can compile without crashing. Runtime will require env.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

function hasConfig() {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : hasConfig()
      ? initializeApp(firebaseConfig)
      : undefined;

export const auth = app ? getAuth(app) : (undefined as any);
export const db = app ? getFirestore(app) : (undefined as any);

export function assertFirebaseReady() {
  if (!app) {
    throw new Error(
      "Firebase env vars are missing. Add NEXT_PUBLIC_FIREBASE_* in your environment (Vercel)."
    );
  }
}
