'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service in production
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-neutral-950 to-orange-900/10" />
          
          <div className="relative max-w-md w-full text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
            <p className="text-neutral-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
            </p>

            {/* Error Details (dev only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <summary className="cursor-pointer text-sm text-neutral-400 hover:text-white">
                  Error details (dev only)
                </summary>
                <pre className="mt-3 text-xs text-red-400 bg-neutral-900 p-3 rounded-lg overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-neutral-950 bg-white hover:bg-neutral-100 rounded-full transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </button>
              <Link
                href="/"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white border border-neutral-700 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-full transition-all"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
