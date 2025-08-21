'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="font-bold">Something went wrong</h2>
          <p className="mb-4">{this.state.error?.message}</p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function RedirectErrorBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  const handleError = () => {
    // You can customize the redirect logic here
    router.push('/error');
  };

  return (
    <ErrorBoundary fallback={
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <h2 className="font-bold">Page Error</h2>
        <p className="mb-4">Sorry, something went wrong with this page.</p>
        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Go to Home
        </button>
      </div>
    }>
      {children}
    </ErrorBoundary>
  );
}
