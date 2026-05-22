#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$ROOT/.tools"
JDK_DIR="$TOOLS/jdk-21"
SDK_DIR="$TOOLS/android-sdk"
ARCH="$(uname -m)"
case "$ARCH" in
  arm64) JDK_ARCH="aarch64" ;;
  x86_64) JDK_ARCH="x64" ;;
  *) echo "Unsupported arch: $ARCH"; exit 1 ;;
esac

mkdir -p "$TOOLS"

if [[ ! -d "$JDK_DIR/Contents/Home" ]]; then
  echo "Downloading JDK 21..."
  JDK_URL="https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_${JDK_ARCH}_mac_hotspot_21.0.6_7.tar.gz"
  curl -fsSL "$JDK_URL" -o "$TOOLS/jdk.tar.gz"
  tar -xzf "$TOOLS/jdk.tar.gz" -C "$TOOLS"
  mv "$TOOLS"/jdk-21.* "$JDK_DIR" 2>/dev/null || true
  rm -f "$TOOLS/jdk.tar.gz"
fi

if [[ ! -d "$SDK_DIR/cmdline-tools/latest" ]]; then
  echo "Downloading Android command-line tools..."
  CMD_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
  curl -fsSL "$CMD_URL" -o "$TOOLS/cmdline-tools.zip"
  mkdir -p "$SDK_DIR/cmdline-tools"
  unzip -q "$TOOLS/cmdline-tools.zip" -d "$SDK_DIR/cmdline-tools"
  mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
  rm -f "$TOOLS/cmdline-tools.zip"
fi

export JAVA_HOME="$JDK_DIR/Contents/Home"
export ANDROID_HOME="$SDK_DIR"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

yes | sdkmanager --licenses >/dev/null
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

echo "sdk.dir=$SDK_DIR" > "$ROOT/android/local.properties"
echo "Android SDK ready at $SDK_DIR"
echo "JAVA_HOME=$JAVA_HOME"
