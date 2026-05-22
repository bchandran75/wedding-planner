import { Preferences } from "@capacitor/preferences";

const KEYS = {
  conversations: "wp_conversations",
  weddingInfo: "wp_wedding_info",
  apiKey: "wp_api_key",
  activeAgent: "wp_active_agent",
  localUser: "wp_user",
  onboardingComplete: "wp_onboarding_done",
};

export async function loadAuthState() {
  const [user, onboarding] = await Promise.all([
    Preferences.get({ key: KEYS.localUser }),
    Preferences.get({ key: KEYS.onboardingComplete }),
  ]);
  return {
    localUser: user.value ? JSON.parse(user.value) : null,
    onboardingComplete: onboarding.value === "true",
  };
}

export async function saveAuthState({ localUser }) {
  if (localUser === null) {
    await Preferences.remove({ key: KEYS.localUser });
    return;
  }
  await Preferences.set({
    key: KEYS.localUser,
    value: JSON.stringify(localUser),
  });
}

export async function saveOnboardingComplete(done) {
  await Preferences.set({
    key: KEYS.onboardingComplete,
    value: done ? "true" : "false",
  });
}

export async function loadState() {
  const [conversations, weddingInfo, apiKey, activeAgent] = await Promise.all([
    Preferences.get({ key: KEYS.conversations }),
    Preferences.get({ key: KEYS.weddingInfo }),
    Preferences.get({ key: KEYS.apiKey }),
    Preferences.get({ key: KEYS.activeAgent }),
  ]);

  return {
    conversations: conversations.value ? JSON.parse(conversations.value) : null,
    weddingInfo: weddingInfo.value ? JSON.parse(weddingInfo.value) : null,
    apiKey: apiKey.value || "",
    activeAgent: activeAgent.value || "coordinator",
  };
}

export async function saveConversations(conversations) {
  await Preferences.set({
    key: KEYS.conversations,
    value: JSON.stringify(conversations),
  });
}

export async function saveWeddingInfo(weddingInfo) {
  await Preferences.set({
    key: KEYS.weddingInfo,
    value: JSON.stringify(weddingInfo),
  });
}

export async function saveApiKey(apiKey) {
  await Preferences.set({ key: KEYS.apiKey, value: apiKey });
}

export async function saveActiveAgent(activeAgent) {
  await Preferences.set({ key: KEYS.activeAgent, value: activeAgent });
}
