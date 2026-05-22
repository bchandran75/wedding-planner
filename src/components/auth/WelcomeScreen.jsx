export function WelcomeScreen({ onContinue }) {
  return (
    <div className="auth-screen welcome-screen">
      <div className="auth-hero">
        <div className="auth-hero-glow" />
        <div className="welcome-icon">💒</div>
        <h1 className="auth-title">Wedding Planner</h1>
        <p className="auth-subtitle">
          Your AI dream team for venues, catering, photos, music, and décor —
          all in one beautiful app.
        </p>
      </div>
      <div className="auth-footer">
        <button type="button" className="btn-gradient" onClick={onContinue}>
          Get started
        </button>
        <p className="auth-footnote">Plan your perfect day with six specialist agents</p>
      </div>
    </div>
  );
}
