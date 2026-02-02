import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

// Error boundary for debugging
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
    state = { error: null };
    static getDerivedStateFromError(error: Error) { return { error }; }
    render() {
        if (this.state.error) {
            return (
                <div className="h-screen flex items-center justify-center bg-dark-900 text-white p-8">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">App Error</h1>
                        <pre className="bg-dark-800 p-4 rounded overflow-auto text-sm">{(this.state.error as Error).message}</pre>
                        <pre className="bg-dark-800 p-4 rounded overflow-auto text-xs mt-2">{(this.state.error as Error).stack}</pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

try {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <ErrorBoundary>
                <HashRouter>
                    <App />
                </HashRouter>
            </ErrorBoundary>
        </React.StrictMode>
    );
} catch (error) {
    console.error('Failed to mount React app:', error);
    document.getElementById('root')!.innerHTML = `
        <div style="color: white; padding: 40px; font-family: monospace;">
            <h1 style="color: #f87171;">Failed to Mount App</h1>
            <pre style="background: #1e293b; padding: 16px; border-radius: 8px;">${error}</pre>
        </div>
    `;
}

