import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
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
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center space-y-4">
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                        <p className="text-gray-600">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {import.meta.env.MODE === 'development' && this.state.error && (
                            <pre className="text-left bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                                {this.state.error.toString()}
                            </pre>
                        )}
                        <div className="flex gap-2 justify-center">
                            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
                            <Button variant="outline" onClick={() => window.location.href = '/'}>Go Home</Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
