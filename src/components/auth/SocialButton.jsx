export function SocialButton({
  icon,
  label,
  variant = "default",
  onClick,
  disabled,
  loading,
}) {
  return (
    <button
      type="button"
      className={`social-btn social-btn--${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <span className="social-btn-icon" aria-hidden>
        {icon}
      </span>
      <span className="social-btn-label">
        {loading ? "Signing in…" : label}
      </span>
    </button>
  );
}
