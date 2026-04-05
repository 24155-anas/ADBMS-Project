import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(err) { return { hasError: true, error: err }; }
    componentDidCatch(err, info) { console.error('ErrorBoundary caught:', err, info); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                    <p className="text-gray-500 mb-6">{this.state.error?.message}</p>
                    <button className="btn-primary" onClick={() => window.location.reload()}>Reload page</button>
                </div>
            );
        }
        return this.props.children;
    }
}
