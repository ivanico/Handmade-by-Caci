import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
          <h1 className="text-2xl font-heading text-gray-900">Something went wrong</h1>
          <p className="text-sm text-gray-500">An unexpected error occurred.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 py-2 text-sm active:scale-95 transition-all duration-150"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
