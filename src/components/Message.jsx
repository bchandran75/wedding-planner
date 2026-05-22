import { memo } from "react";

export const Message = memo(function Message({ msg, agentColor, agentBg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row--user" : ""}`}>
      {!isUser && (
        <div
          className="message-avatar"
          style={{ background: agentBg, borderColor: `${agentColor}40` }}
        >
          {msg.icon}
        </div>
      )}
      <div
        className={`message-bubble ${isUser ? "message-bubble--user" : ""}`}
        style={isUser ? { background: agentColor } : undefined}
      >
        {msg.content}
      </div>
    </div>
  );
});
