import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "../config/firebase.js";

let firebaseApp;
let firebaseAuth;

function getWebAuth() {
  if (!isFirebaseConfigured()) return null;
  if (!firebaseAuth) {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
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

function mapNativeUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "Wedding Planner",
    photoURL: user.photoUrl || user.photoURL || "",
    provider: user.providerId || "firebase",
    isGuest: false,
  };
}

export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }

  if (Capacitor.isNativePlatform()) {
    let listenerHandle;
    FirebaseAuthentication.addListener("authStateChange", (event) => {
      callback(mapNativeUser(event.user));
    }).then((handle) => {
      listenerHandle = handle;
    });
    FirebaseAuthentication.getCurrentUser()
      .then((result) => callback(mapNativeUser(result.user)))
      .catch(() => callback(null));
    return () => listenerHandle?.remove();
  }

  const auth = getWebAuth();
  return onAuthStateChanged(auth, (user) => callback(mapFirebaseUser(user)));
}

async function webSignIn(provider) {
  const auth = getWebAuth();
  if (!auth) throw new Error("FIREBASE_NOT_CONFIGURED");
  const result = await signInWithPopup(auth, provider);
  return mapFirebaseUser(result.user);
}

async function nativeSignIn(providerId) {
  if (!isFirebaseConfigured()) throw new Error("FIREBASE_NOT_CONFIGURED");

  switch (providerId) {
    case "google.com":
      await FirebaseAuthentication.signInWithGoogle();
      break;
    case "apple.com":
      await FirebaseAuthentication.signInWithApple();
      break;
    case "facebook.com":
      await FirebaseAuthentication.signInWithFacebook();
      break;
    default:
      throw new Error("Unsupported provider");
  }

  const { user } = await FirebaseAuthentication.getCurrentUser();
  return mapNativeUser(user);
}

async function signInWithProvider(providerId, ProviderClass, providerArgs = []) {
  if (!isFirebaseConfigured()) throw new Error("FIREBASE_NOT_CONFIGURED");

  if (Capacitor.isNativePlatform()) {
    return nativeSignIn(providerId);
  }

  const provider = new ProviderClass(...providerArgs);
  return webSignIn(provider);
}

export function signInWithGoogle() {
  return signInWithProvider("google.com", GoogleAuthProvider);
}

export function signInWithApple() {
  return signInWithProvider("apple.com", OAuthProvider, ["apple.com"]);
}

export function signInWithFacebook() {
  return signInWithProvider("facebook.com", FacebookAuthProvider);
}

export async function signInAsGuest() {
  if (isFirebaseConfigured()) {
    if (Capacitor.isNativePlatform()) {
      // Anonymous auth via web layer isn't exposed on all native builds; use local guest.
      return createLocalGuest();
    }
    const auth = getWebAuth();
    const result = await signInAnonymously(auth);
    return mapFirebaseUser(result.user);
  }
  return createLocalGuest();
}

function createLocalGuest() {
  const id = `guest-${Date.now()}`;
  return {
    uid: id,
    email: "",
    displayName: "Guest Planner",
    photoURL: "",
    provider: "guest",
    isGuest: true,
  };
}

export async function signOutUser() {
  if (isFirebaseConfigured()) {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
      return;
    }
    const auth = getWebAuth();
    if (auth?.currentUser) await firebaseSignOut(auth);
  }
}

export function isAuthConfigured() {
  return isFirebaseConfigured();
}
