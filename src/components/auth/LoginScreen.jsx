import { SocialButton } from "./SocialButton.jsx";

export function LoginScreen({
  authLoading,
  authError,
  isAuthConfigured,
  onGoogle,
  onApple,
  onFacebook,
  onGuest,
}) {
  return (
    <div className="auth-screen login-screen">
      <div className="login-header">
        <div className="welcome-icon small">💒</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to sync your plans across devices, or continue as a guest.
        </p>
      </div>

      {!isAuthConfigured && (
        <div className="auth-notice">
          <strong>Social login setup</strong>
          <p>
            Add Firebase keys to <code>.env</code> for Google, Apple, and Facebook.
            Guest mode works without setup.
          </p>
        </div>
      )}

      {authError && <div className="auth-error">{authError}</div>}

      <div className="social-buttons">
        <SocialButton
          variant="google"
          icon={
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
          label="Continue with Google"
          onClick={onGoogle}
          disabled={!isAuthConfigured}
          loading={authLoading}
        />
        <SocialButton
          variant="apple"
          icon={
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05 1.88-3.3 1.9-1.24.02-1.64-.79-3.06-.79-1.42 0-1.83.77-3.06.82-1.23.05-2.16-1.12-3.14-2.07C2.79 17.25 1.38 12.55 3.1 9.39c.86-1.52 2.37-2.48 4.03-2.51 1.26-.02 2.45.85 3.06.85.61 0 1.75-1.05 2.96-.9.5.02 1.9.2 2.8 1.45-2.36 1.3-1.97 4.68.43 5.58-.47 1.22-.72 1.87-1.1 2.72zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          }
          label="Continue with Apple"
          onClick={onApple}
          disabled={!isAuthConfigured}
          loading={authLoading}
        />
        <SocialButton
          variant="facebook"
          icon={
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          }
          label="Continue with Facebook"
          onClick={onFacebook}
          disabled={!isAuthConfigured}
          loading={authLoading}
        />
      </div>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="btn-outline"
        onClick={onGuest}
        disabled={authLoading}
      >
        Continue as Guest
      </button>

      <p className="auth-legal">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
