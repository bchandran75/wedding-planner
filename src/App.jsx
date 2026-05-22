import { useEffect, useState } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { LoginScreen } from "./components/auth/LoginScreen.jsx";
import { OnboardingScreen } from "./components/auth/OnboardingScreen.jsx";
import { WelcomeScreen } from "./components/auth/WelcomeScreen.jsx";
import { AgentSidebar } from "./components/AgentSidebar.jsx";
import { ChatArea } from "./components/ChatArea.jsx";
import { ProfileSheet } from "./components/ProfileSheet.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useWeddingPlanner } from "./hooks/useWeddingPlanner.js";
import { tapFeedback } from "./utils/haptics.js";
import "./styles/auth.css";
import "./App.css";

export default function App() {
  const auth = useAuth();
  const planner = useWeddingPlanner();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authStep, setAuthStep] = useState("welcome");

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
    if (!planner.hydrated || !auth.user || planner.apiKey) return;
    setProfileOpen(true);
  }, [planner.hydrated, auth.user, planner.apiKey]);

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

  async function handleSignIn(fn) {
    await tapFeedback();
    try {
      await fn();
    } catch {
      /* error shown in LoginScreen */
    }
  }

  if (!auth.hydrated || !planner.hydrated) {
    return (
      <div className="app-shell">
        <div className="loading-screen">
          <div className="welcome-icon small">💒</div>
          Loading…
        </div>
      </div>
    );
  }

  if (!auth.user) {
    if (!auth.onboardingComplete) {
      if (authStep === "welcome") {
        return (
          <WelcomeScreen
            onContinue={async () => {
              await tapFeedback();
              setAuthStep("onboarding");
            }}
          />
        );
      }
      if (authStep === "onboarding") {
        return (
          <OnboardingScreen
            onComplete={async () => {
              await tapFeedback();
              await auth.completeOnboarding();
              setAuthStep("login");
            }}
          />
        );
      }
    }

    return (
      <LoginScreen
        authLoading={auth.authLoading}
        authError={auth.authError}
        isAuthConfigured={auth.isAuthConfigured}
        onGoogle={() => handleSignIn(auth.signInGoogle)}
        onApple={() => handleSignIn(auth.signInApple)}
        onFacebook={() => handleSignIn(auth.signInFacebook)}
        onGuest={() => handleSignIn(auth.continueAsGuest)}
      />
    );
  }

  const firstName = auth.user.displayName?.split(" ")[0] || "there";

  return (
    <div className="app-shell app-shell--main">
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
          user={auth.user}
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
          user={auth.user}
          greeting={`Hi, ${firstName}`}
          onInputChange={setInput}
          onSend={handleSend}
          onClear={planner.clearChat}
          onOpenProfile={() => setProfileOpen(true)}
        />
      </div>

      {profileOpen && (
        <ProfileSheet
          user={auth.user}
          apiKey={planner.apiKey}
          onSaveApiKey={planner.updateApiKey}
          onSignOut={async () => {
            await auth.signOut();
            setProfileOpen(false);
          }}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
