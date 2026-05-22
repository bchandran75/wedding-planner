export function SettingsModal({ apiKey, onSave, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <p className="modal-hint">
          Your API key is stored only on this device. Get a key at{" "}
          <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer">
            console.anthropic.com
          </a>
          .
        </p>
        <label className="field-label" htmlFor="api-key">
          Anthropic API key
        </label>
        <input
          id="api-key"
          className="info-input"
          type="password"
          autoComplete="off"
          defaultValue={apiKey}
          placeholder="sk-ant-..."
          onBlur={(e) => onSave(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
