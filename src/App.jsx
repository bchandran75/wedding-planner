import { useEffect, useState } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { AgentSidebar } from "./components/AgentSidebar.jsx";
import { ChatArea } from "./components/ChatArea.jsx";
import { SettingsModal } from "./components/SettingsModal.jsx";
import { useWeddingPlanner } from "./hooks/useWeddingPlanner.js";
import "./App.css";

export default function App() {
  const planner = useWeddingPlanner();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#7c3aed" }).catch(() => {});
  }, []);

  useEffect(() => {
    const toggle = () => setSidebarOpen((v) => !v);
    window.addEventListener("wp:toggle-sidebar", toggle);
    return () => window.removeEventListener("wp:toggle-sidebar", toggle);
  }, []);

  useEffect(() => {
    if (!planner.hydrated || planner.apiKey) return;
    setSettingsOpen(true);
  }, [planner.hydrated, planner.apiKey]);

  function handleSend(text) {
    const message = typeof text === "string" ? text : input;
    planner.sendMessage(message);
    setInput("");
  }

  function selectAgent(id) {
    planner.setActiveAgent(id);
    setSidebarOpen(false);
    planner.setError("");
  }

  if (!planner.hydrated) {
    return (
      <div className="app-shell">
        <div className="loading-screen">Loading Wedding Planner…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className={`layout ${sidebarOpen ? "layout--sidebar-open" : ""}`}>
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
        />
        <AgentSidebar
          agents={planner.agents}
          activeAgent={planner.activeAgent}
          conversations={planner.conversations}
          totalMessages={planner.totalMessages}
          weddingInfo={planner.weddingInfo}
          onAgentSelect={selectAgent}
          onWeddingInfoChange={planner.setWeddingInfo}
          onClose={() => setSidebarOpen(false)}
        />
        <ChatArea
          agent={planner.agent}
          messages={planner.messages}
          loading={planner.loading}
          error={planner.error}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onClear={planner.clearChat}
        />
      </div>

      <button
        type="button"
        className="settings-fab"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open settings"
      >
        ⚙
      </button>

      {settingsOpen && (
        <SettingsModal
          apiKey={planner.apiKey}
          onSave={planner.updateApiKey}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
