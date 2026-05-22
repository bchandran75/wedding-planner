import { WEDDING_FIELDS } from "../config/agents.js";

export function AgentSidebar({
  agents,
  activeAgent,
  conversations,
  totalMessages,
  weddingInfo,
  onAgentSelect,
  onWeddingInfoChange,
  onClose,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span>💒</span> Wedding Planner
        </div>
        <div className="sidebar-subtitle">
          {totalMessages > 0
            ? `${totalMessages} messages across agents`
            : "6 specialist agents ready"}
        </div>
        {onClose && (
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        )}
      </div>

      <div className="section-label">Agents</div>
      <nav className="agent-list">
        {agents.map((a) => {
          const msgCount = conversations[a.id]?.length ?? 0;
          return (
            <button
              key={a.id}
              type="button"
              className={`agent-tab ${activeAgent === a.id ? "active" : ""}`}
              onClick={() => onAgentSelect(a.id)}
            >
              <span className="agent-tab-icon">{a.icon}</span>
              <span className="agent-tab-name">{a.name}</span>
              {msgCount > 0 && (
                <span className="agent-badge" style={{ background: a.color }}>
                  {msgCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="wedding-details">
        <div className="section-label">Wedding Details</div>
        {WEDDING_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="field-group">
            <label className="field-label">{label}</label>
            <input
              className="info-input"
              value={weddingInfo[key]}
              onChange={(e) =>
                onWeddingInfoChange((p) => ({ ...p, [key]: e.target.value }))
              }
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
