#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$ROOT/.tools"

export JAVA_HOME="${JAVA_HOME:-$TOOLS/jdk-21/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-$TOOLS/android-sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

if [[ ! -f "$JAVA_HOME/bin/java" ]]; then
  echo "JDK 21 not found. Run: ./scripts/setup-android-sdk.sh"
  exit 1
fi

if [[ ! -d "$ANDROID_HOME/platforms/android-35" ]]; then
  echo "Android SDK not ready. Run: ./scripts/setup-android-sdk.sh"
  exit 1
fi

echo "sdk.dir=$ANDROID_HOME" > "$ROOT/android/local.properties"

cd "$ROOT"
npm run build
npx cap sync android
cd android
./gradlew assembleDebug

APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
cp "$APK" "$ROOT/wedding-planner-debug.apk"
echo ""
echo "APK built:"
echo "  $APK"
echo "  $ROOT/wedding-planner-debug.apk"
