# Wedding Planner (Android)

AI wedding planning app with six specialist agents (coordinator, venue, catering, photography, music, décor). Built with React, Vite, and Capacitor for installable Android APKs.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your [Anthropic API key](https://console.anthropic.com/) in the app **Settings** (stored on-device only).

## Run in browser

```bash
npm run dev
```

## Build Android APK

Requires [Android Studio](https://developer.android.com/studio) or Android SDK with `ANDROID_HOME` set.

```bash
npm install
npm run build
npx cap add android   # first time only
npm run android:build
```

Debug APK output:

`android/app/build/outputs/apk/debug/app-debug.apk`

Install on a device:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Optimizations vs original

- Modular structure (config, hooks, components, API layer)
- Mobile-first layout with slide-out agent menu
- Full-screen native shell (no fixed 580px height)
- Persists chats and wedding details on device
- Proper Anthropic API authentication headers
- Request cancellation on rapid sends
- Memoized message rendering
- Safe-area support for notched phones
