export function ProfileSheet({ user, apiKey, onSaveApiKey, onSignOut, onClose }) {
  const initial = (user?.displayName || "G").charAt(0).toUpperCase();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>Profile</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="profile-user">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{initial}</div>
          )}
          <div>
            <div className="profile-name">{user?.displayName}</div>
            <div className="profile-meta">
              {user?.email || (user?.isGuest ? "Guest account" : "Signed in")}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Anthropic API key</h3>
          <p className="modal-hint">
            Stored only on this device. Get a key at{" "}
            <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer">
              console.anthropic.com
            </a>
          </p>
          <input
            className="info-input"
            type="password"
            autoComplete="off"
            defaultValue={apiKey}
            placeholder="sk-ant-..."
            onBlur={(e) => onSaveApiKey(e.target.value)}
          />
        </div>

        <button type="button" className="btn-danger" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
