import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary for the layout shell.
 *
 * Catches render errors in sidebar, header, and floating controls.
 * Route-level errors are handled by TanStack Router's errorComponent —
 * this boundary does NOT wrap <Outlet> to avoid suppressing router errors.
 *
 * Displays a user-friendly fallback with reload and home navigation.
 * Error details only shown in dev mode.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Caught render error:', error.message);
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
        >
          <div className="max-w-md mx-auto p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Something went wrong
            </h2>
            {import.meta.env.DEV && this.state.error && (
              <p className="text-sm text-red-600 dark:text-red-400 font-mono mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Reload page
              </button>
              {/* Intentional <a href> (not <Link>) — full page reload clears the error
                  state and re-initializes the app cleanly. SPA navigation would
                  preserve the errored component tree in memory. */}
              <a
                href="/"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
