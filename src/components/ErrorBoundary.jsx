import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <div className="welcome-icon small">💒</div>
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <button
            type="button"
            className="btn-gradient"
            onClick={() => window.location.reload()}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
