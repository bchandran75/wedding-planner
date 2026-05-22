import { Capacitor } from "@capacitor/core";
import { firebaseConfig, isFirebaseConfigured } from "../config/firebase.js";

let firebaseApp;
let firebaseAuth;
let firebaseModules;

async function loadFirebase() {
  if (!isFirebaseConfigured()) return null;
  if (!firebaseModules) {
    const [appMod, authMod] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]);
    firebaseModules = { ...appMod, ...authMod };
  }
  if (!firebaseAuth) {
    firebaseApp = firebaseModules.initializeApp(firebaseConfig);
    firebaseAuth = firebaseModules.getAuth(firebaseApp);
  }
  return firebaseAuth;
}

export function mapFirebaseUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "Wedding Planner",
    photoURL: user.photoURL || "",
    provider: user.providerData?.[0]?.providerId || "firebase",
    isGuest: user.isAnonymous ?? false,
  };
}

export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }

  let unsubscribe = () => {};
  loadFirebase()
    .then((auth) => {
      if (!auth) {
        callback(null);
        return;
      }
      unsubscribe = firebaseModules.onAuthStateChanged(auth, (user) =>
        callback(mapFirebaseUser(user))
      );
    })
    .catch(() => callback(null));

  return () => unsubscribe();
}

export async function handleAuthRedirect() {
  if (!isFirebaseConfigured()) return null;
  try {
    const auth = await loadFirebase();
    if (!auth) return null;
    const result = await firebaseModules.getRedirectResult(auth);
    return result?.user ? mapFirebaseUser(result.user) : null;
  } catch {
    return null;
  }
}

async function signInWithProvider(ProviderClass, providerArgs = []) {
  const auth = await loadFirebase();
  if (!auth) throw new Error("FIREBASE_NOT_CONFIGURED");

  const provider = new ProviderClass(...providerArgs);

  if (Capacitor.isNativePlatform()) {
    await firebaseModules.signInWithRedirect(auth, provider);
    return null;
  }

  const result = await firebaseModules.signInWithPopup(auth, provider);
  return mapFirebaseUser(result.user);
}

export async function signInWithGoogle() {
  await loadFirebase();
  return signInWithProvider(firebaseModules.GoogleAuthProvider);
}

export async function signInWithApple() {
  await loadFirebase();
  return signInWithProvider(firebaseModules.OAuthProvider, ["apple.com"]);
}

export async function signInWithFacebook() {
  await loadFirebase();
  return signInWithProvider(firebaseModules.FacebookAuthProvider);
}

export async function signInAsGuest() {
  if (isFirebaseConfigured()) {
    try {
      const auth = await loadFirebase();
      if (auth) {
        const result = await firebaseModules.signInAnonymously(auth);
        return mapFirebaseUser(result.user);
      }
    } catch {
      /* use local guest */
    }
  }
  return createLocalGuest();
}

function createLocalGuest() {
  return {
    uid: `guest-${Date.now()}`,
    email: "",
    displayName: "Guest Planner",
    photoURL: "",
    provider: "guest",
    isGuest: true,
  };
}

export async function signOutUser() {
  if (!isFirebaseConfigured()) return;
  try {
    const auth = await loadFirebase();
    if (auth?.currentUser) {
      await firebaseModules.signOut(auth);
    }
  } catch {
    /* ignore */
  }
}

export function isAuthConfigured() {
  return isFirebaseConfigured();
}
