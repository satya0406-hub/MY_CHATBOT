import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white font-serif">Something went wrong</h1>
          <p className="mb-8 max-w-md text-zinc-500">
            An unexpected error occurred. We've been notified and are looking into it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCcw size={16} />
            Reload Application
          </button>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-8 max-w-2xl overflow-auto rounded-lg bg-zinc-900 p-4 text-left text-xs text-red-400 border border-red-500/20">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
