import { useEffect, useRef } from "react";
import { AGENT_GREETINGS, QUICK_PROMPTS } from "../config/agents.js";
import { Message } from "./Message.jsx";
import { TypingIndicator } from "./TypingIndicator.jsx";

export function ChatArea({
  agent,
  messages,
  loading,
  error,
  input,
  user,
  greeting,
  onInputChange,
  onSend,
  onClear,
  onOpenProfile,
}) {
  const initial = (user?.displayName || "G").charAt(0).toUpperCase();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <section className="chat-area">
      <header className="chat-header">
        <button
          type="button"
          className="icon-btn menu-btn"
          onClick={() => window.dispatchEvent(new CustomEvent("wp:toggle-sidebar"))}
          aria-label="Open agents menu"
        >
          ☰
        </button>
        <div
          className="chat-header-avatar"
          style={{ background: agent.bg, borderColor: `${agent.color}30` }}
        >
          {agent.icon}
        </div>
        <div className="chat-header-text">
          <div className="greeting-line">{greeting}</div>
          <div className="chat-header-name">{agent.name}</div>
          <div className="chat-header-role">Specialized wedding planning agent</div>
        </div>
        <div className="chat-header-actions">
          {messages.length > 0 && (
            <button type="button" className="clear-btn" onClick={onClear}>
              Clear
            </button>
          )}
          <button
            type="button"
            className="user-chip"
            onClick={onOpenProfile}
            aria-label="Open profile"
          >
            <span className="user-chip-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" />
              ) : (
                initial
              )}
            </span>
          </button>
        </div>
      </header>

      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">{agent.icon}</div>
            <div className="empty-title">{agent.name}</div>
            <p className="empty-desc">{AGENT_GREETINGS[agent.id]}</p>
            <div className="quick-prompts">
              {QUICK_PROMPTS[agent.id].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="quick-chip"
                  onClick={() => onSend(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={`${msg.role}-${i}`} className="chat-msg">
            <Message msg={msg} agentColor={agent.color} agentBg={agent.bg} />
          </div>
        ))}

        {loading && (
          <div className="message-row">
            <div
              className="message-avatar"
              style={{ background: agent.bg, borderColor: `${agent.color}40` }}
            >
              {agent.icon}
            </div>
            <div className="message-bubble message-bubble--typing">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <footer className="composer">
        {messages.length > 0 && (
          <div className="composer-chips">
            {QUICK_PROMPTS[agent.id].slice(0, 2).map((p) => (
              <button
                key={p}
                type="button"
                className="quick-chip"
                onClick={() => onSend(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="composer-row">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask the ${agent.name}...`}
            rows={1}
            className="composer-input"
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
          <button
            type="button"
            className="send-btn"
            disabled={!input.trim() || loading}
            onClick={() => onSend()}
            style={{ background: agent.color }}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </footer>
    </section>
  );
}
