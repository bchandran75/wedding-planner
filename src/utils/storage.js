import { Preferences } from "@capacitor/preferences";

const KEYS = {
  conversations: "wp_conversations",
  weddingInfo: "wp_wedding_info",
  apiKey: "wp_api_key",
  activeAgent: "wp_active_agent",
};

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
