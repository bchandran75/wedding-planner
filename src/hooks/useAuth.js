import { useCallback, useEffect, useState } from "react";
import {
  handleAuthRedirect,
  isAuthConfigured,
  signInAsGuest,
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
} from "../services/auth.js";
import {
  loadAuthState,
  saveAuthState,
  saveOnboardingComplete,
} from "../utils/storage.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let unsub = () => {};

    loadAuthState().then(async (state) => {
      setOnboardingComplete(state.onboardingComplete);
      if (state.localUser && !isAuthConfigured()) {
        setUser(state.localUser);
        setHydrated(true);
        return;
      }
      if (state.localUser?.isGuest) {
        setUser(state.localUser);
      }

      const redirectUser = await handleAuthRedirect();
      if (redirectUser) {
        setUser(redirectUser);
        await saveAuthState({ localUser: redirectUser });
      }

      unsub = subscribeToAuth((firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          saveAuthState({ localUser: firebaseUser });
        } else if (!state.localUser?.isGuest) {
          setUser(state.localUser || null);
        }
        setHydrated(true);
      });

      if (!isAuthConfigured()) setHydrated(true);
    });

    return () => unsub();
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await saveOnboardingComplete(true);
  }, []);

  const runSignIn = useCallback(async (fn) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const signedInUser = await fn();
      if (signedInUser) {
        setUser(signedInUser);
        await saveAuthState({ localUser: signedInUser });
      }
      return signedInUser;
    } catch (e) {
      const msg = formatAuthError(e);
      setAuthError(msg);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signInGoogle = useCallback(
    () => runSignIn(signInWithGoogle),
    [runSignIn]
  );
  const signInApple = useCallback(() => runSignIn(signInWithApple), [runSignIn]);
  const signInFacebook = useCallback(
    () => runSignIn(signInWithFacebook),
    [runSignIn]
  );
  const continueAsGuest = useCallback(
    () => runSignIn(signInAsGuest),
    [runSignIn]
  );

  const signOut = useCallback(async () => {
    setAuthError("");
    await signOutUser();
    setUser(null);
    await saveAuthState({ localUser: null });
  }, []);

  return {
    user,
    hydrated,
    onboardingComplete,
    completeOnboarding,
    authLoading,
    authError,
    setAuthError,
    signInGoogle,
    signInApple,
    signInFacebook,
    continueAsGuest,
    signOut,
    isAuthConfigured: isAuthConfigured(),
  };
}

function formatAuthError(e) {
  if (e?.message === "FIREBASE_NOT_CONFIGURED") {
    return "Social sign-in requires Firebase. Add keys to .env (see README) or continue as Guest.";
  }
  if (e?.code === "auth/popup-closed-by-user") {
    return "Sign-in was cancelled.";
  }
  return e?.message || "Sign-in failed. Please try again.";
}
