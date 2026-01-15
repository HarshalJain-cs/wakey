/**
 * @fileoverview Error Boundary Component for Wakey
 * 
 * React Error Boundary that catches JavaScript errors in child components,
 * logs them, and displays a fallback UI with recovery options.
 * 
 * @module components/ErrorBoundary
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
    /** Child components to wrap */
    children: ReactNode;
    /** Optional fallback component */
    fallback?: ReactNode;
    /** Callback when error occurs */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
    /** Whether an error has been caught */
    hasError: boolean;
    /** The caught error */
    error: Error | null;
    /** React error info with component stack */
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches and handles React component errors.
 * 
 * Features:
 * - Catches errors in child component tree
 * - Displays user-friendly error UI
 * - Provides recovery options (retry, go home)
 * - Logs errors for debugging
 * 
 * @example
 * <ErrorBoundary onError={(e) => console.error(e)}>
 *   <Dashboard />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    /**
     * Static lifecycle method to update state when error is caught
     */
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    /**
     * Lifecycle method called when error is caught
     * Logs error and calls optional callback
     */
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });

        // Log to console for debugging
        console.error('ErrorBoundary caught an error:', error);
        console.error('Component stack:', errorInfo.componentStack);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    /**
     * Resets error state to retry rendering
     */
    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    /**
     * Navigates to home page
     */
    handleGoHome = (): void => {
        window.location.hash = '/';
        this.handleRetry();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Return custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-dark-800 rounded-xl">
                    <div className="p-4 bg-red-500/20 rounded-full mb-6">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Something went wrong
                    </h2>

                    <p className="text-dark-300 text-center mb-6 max-w-md">
                        An unexpected error occurred. Don't worry, your data is safe.
                        Try refreshing or go back to the dashboard.
                    </p>

                    {/* Error details (collapsible in production) */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="w-full max-w-lg mb-6">
                            <summary className="text-dark-400 cursor-pointer hover:text-dark-300">
                                Technical details
                            </summary>
                            <pre className="mt-2 p-4 bg-dark-900 rounded-lg text-xs text-red-400 overflow-auto max-h-40">
                                {this.state.error.message}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <button
                            onClick={this.handleGoHome}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
