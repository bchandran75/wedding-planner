import { useCallback, useEffect, useRef, useState } from "react";
import { AGENTS } from "../config/agents.js";
import {
  buildWeddingContext,
  extractWeddingHints,
  sendToAnthropic,
} from "../utils/api.js";
import {
  loadState,
  saveActiveAgent,
  saveApiKey,
  saveConversations,
  saveWeddingInfo,
} from "../utils/storage.js";

const emptyConversations = () =>
  Object.fromEntries(AGENTS.map((a) => [a.id, []]));

const defaultWeddingInfo = { date: "", guests: "", budget: "", style: "" };

export function useWeddingPlanner() {
  const [activeAgent, setActiveAgent] = useState("coordinator");
  const [conversations, setConversations] = useState(emptyConversations);
  const [weddingInfo, setWeddingInfo] = useState(defaultWeddingInfo);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    loadState().then((state) => {
      if (state.conversations) setConversations(state.conversations);
      if (state.weddingInfo) setWeddingInfo(state.weddingInfo);
      if (state.apiKey) setApiKey(state.apiKey);
      if (state.activeAgent) setActiveAgent(state.activeAgent);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveConversations(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveWeddingInfo(weddingInfo);
  }, [weddingInfo, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveActiveAgent(activeAgent);
  }, [activeAgent, hydrated]);

  const updateApiKey = useCallback(async (key) => {
    setApiKey(key);
    await saveApiKey(key);
  }, []);

  const agent = AGENTS.find((a) => a.id === activeAgent) ?? AGENTS[0];
  const messages = conversations[activeAgent] ?? [];

  const sendMessage = useCallback(
    async (text) => {
      const userText = text?.trim();
      if (!userText || loading) return;

      if (!apiKey.trim()) {
        setError("Add your Anthropic API key in Settings to start chatting.");
        return;
      }

      setError("");
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMsg = { role: "user", content: userText };
      const updatedMsgs = [...messages, userMsg];

      setConversations((prev) => ({
        ...prev,
        [activeAgent]: updatedMsgs,
      }));
      setLoading(true);

      try {
        const reply = await sendToAnthropic({
          apiKey,
          system: agent.role + buildWeddingContext(weddingInfo),
          messages: updatedMsgs.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          signal: abortRef.current.signal,
        });

        setConversations((prev) => ({
          ...prev,
          [activeAgent]: [
            ...updatedMsgs,
            { role: "assistant", content: reply, icon: agent.icon },
          ],
        }));

        if (activeAgent === "coordinator") {
          const hints = extractWeddingHints(reply, weddingInfo);
          if (Object.keys(hints).length) {
            setWeddingInfo((p) => ({ ...p, ...hints }));
          }
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        const message =
          e.message === "API_KEY_MISSING"
            ? "Add your Anthropic API key in Settings."
            : e.message || "Something went wrong. Please try again.";
        setError(message);
        // Keep the user message; show errors in the banner only (no fake assistant reply).
        setConversations((prev) => ({
          ...prev,
          [activeAgent]: updatedMsgs,
        }));
      } finally {
        setLoading(false);
      }
    },
    [activeAgent, agent, apiKey, loading, messages, weddingInfo]
  );

  const clearChat = useCallback(() => {
    setConversations((prev) => ({ ...prev, [activeAgent]: [] }));
    setError("");
  }, [activeAgent]);

  const totalMessages = Object.values(conversations).reduce(
    (s, v) => s + v.length,
    0
  );

  return {
    activeAgent,
    setActiveAgent,
    agent,
    agents: AGENTS,
    messages,
    conversations,
    weddingInfo,
    setWeddingInfo,
    apiKey,
    updateApiKey,
    loading,
    error,
    setError,
    sendMessage,
    clearChat,
    totalMessages,
    hydrated,
  };
}
