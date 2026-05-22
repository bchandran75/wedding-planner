# Wedding Planner (Android)

AI wedding planning app with six specialist agents (coordinator, venue, catering, photography, music, décor). Built with React, Vite, Capacitor, and Firebase Authentication.

## Features

- **Rich onboarding** — welcome flow and feature tour
- **Social sign-in** — Google, Apple, Facebook (via Firebase)
- **Guest mode** — use the app without an account
- **Personalized chat** — greeting, profile, and persisted wedding details
- **Six AI agents** — specialist wedding planning assistants

## Setup

```bash
npm install
```

### Anthropic API (required for chat)

Add your [Anthropic API key](https://console.anthropic.com/) in the app **Profile** screen (stored on-device only).

### Firebase social login (optional)

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → sign-in providers: Google, Apple, Facebook.
3. Register a **Web app** and copy config values into `.env` (see `.env.example`).
4. For **Android**, download `google-services.json` and place it at:
   `android/app/google-services.json`
5. Add your Android app in Firebase with package name `com.weddingplanner.app` and SHA-1 from your debug keystore.

```bash
cp .env.example .env
# fill in VITE_FIREBASE_* values
```

Without Firebase, **Continue as Guest** still works.

## Run in browser

```bash
npm run dev
```

## Build Android APK

```bash
npm run android:build
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

First-time SDK setup: `./scripts/setup-android-sdk.sh`
